"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createStudioProject } from "@/app/portal/actions";
import { PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";
import { ctaButtonClasses } from "@/components/ui/Button";
import {
  type PortalKind,
  portalKindLabel,
  STUDIO_FORM_WEBSITE_SOCIAL_PAIR,
} from "@/lib/portal-project-kind";
import type { StudioAdminSelectUser } from "@/lib/studio-admin-options";
import { studioAdminDisplayLabel, studioAdminRoleHint } from "@/lib/studio-admin-options";

/** Individual project types (see `portalKindLabel` for client-facing names). */
const PORTAL_KIND_FORM_ORDER: PortalKind[] = [
  "WEBSITE",
  "MULTI",
  "SIGNAGE",
  "PRINT",
  "SOCIAL",
  "BRANDING",
];

export type AgencyClientOption = {
  id: string;
  email: string;
  name: string | null;
  businessName: string | null;
};

const initial: { error?: string } | null = null;

function CreateProjectSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={ctaButtonClasses({
        variant: "burgundy",
        size: "md",
        isSubmit: true,
        className: "min-h-[48px] w-full justify-center disabled:cursor-wait disabled:opacity-80 sm:w-auto",
      })}
    >
      {pending ? "Creating…" : "Create project"}
    </button>
  );
}

function matchesClientSearch(client: AgencyClientOption, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const fields = [client.email, client.name, client.businessName].filter(Boolean) as string[];
  return fields.some((f) => f.toLowerCase().includes(q));
}

function clientSummary(client: AgencyClientOption): string {
  const bits: string[] = [];
  if (client.name) bits.push(client.name);
  if (client.businessName) bits.push(client.businessName);
  if (bits.length === 0) return client.email;
  return `${bits.join(" · ")} — ${client.email}`;
}

type SearchProps = {
  clients: AgencyClientOption[];
};

function ClientAccountSearch({ clients }: SearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = useMemo(
    () => (selectedId ? clients.find((c) => c.id === selectedId) ?? null : null),
    [clients, selectedId],
  );

  const filtered = useMemo(() => clients.filter((c) => matchesClientSearch(c, query)), [clients, query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (selected) {
    return (
      <div className="flex flex-col gap-2">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Selected client</span>
        <div className="flex min-h-[48px] flex-col justify-center gap-2 rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 font-body text-sm text-burgundy">{clientSummary(selected)}</p>
          <button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setQuery("");
              setOpen(true);
            }}
            className="shrink-0 self-start font-body text-[11px] uppercase tracking-[0.1em] text-burgundy underline underline-offset-4 sm:self-center"
          >
            Change
          </button>
        </div>
        <input type="hidden" name="clientUserId" value={selected.id} required />
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative flex flex-col gap-2">
      <label htmlFor="client-search-input" className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
        Find client
      </label>
      <input
        id="client-search-input"
        type="search"
        autoComplete="off"
        placeholder="Search by full name, business name, or email…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open}
        role="combobox"
        className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[48px] md:text-sm`}
      />
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="mt-1 max-h-[min(16rem,50dvh)] overflow-y-auto rounded-xl border border-zinc-200/90 bg-white py-1 shadow-sm"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 font-body text-[13px] text-burgundy/55">No matches. Try another spelling or use Invite by email.</li>
          ) : (
            filtered.map((c) => (
              <li key={c.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  className="w-full px-4 py-3 text-left font-body text-sm text-burgundy transition-colors hover:bg-zinc-50 focus-visible:bg-zinc-100 focus-visible:outline-none"
                  onClick={() => {
                    setSelectedId(c.id);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="block">{clientSummary(c)}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
      <input type="hidden" name="clientUserId" value="" />
    </div>
  );
}

export function AgencyCreateProjectForm({
  clients,
  studioAdmins,
  creatorPersonaSlug = null,
}: {
  clients: AgencyClientOption[];
  /** Registered users in STUDIO_EMAIL — pick who leads this project internally. */
  studioAdmins: StudioAdminSelectUser[];
  /** When `may`, only social media management projects can be created. */
  creatorPersonaSlug?: string | null;
}) {
  const [state, formAction] = useFormState(createStudioProject, initial);
  const hasClients = clients.length > 0;
  const [mode, setMode] = useState<"existing" | "invite">(hasClients ? "existing" : "invite");
  const errorRef = useRef<HTMLDivElement>(null);
  const mayOnlySocial = creatorPersonaSlug === "may";
  const portalKindOptions: PortalKind[] = mayOnlySocial
    ? ["SOCIAL"]
    : PORTAL_KIND_FORM_ORDER;

  useEffect(() => {
    if (state?.error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [state?.error]);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-6">
      <input type="hidden" name="assignmentMode" value={mode} />

      {state?.error ? (
        <div ref={errorRef}>
          <p
            className="rounded-xl border border-zinc-200/90 bg-zinc-50/90 px-4 py-3 font-body text-[13px] leading-relaxed text-burgundy"
            role="alert"
          >
            {state.error}
          </p>
        </div>
      ) : null}

      <label className="flex flex-col gap-2">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
          Project name
        </span>
        <input
          name="name"
          type="text"
          required
          maxLength={200}
          autoComplete="off"
          placeholder={
            mayOnlySocial
              ? "e.g. Client Name — Social"
              : "e.g. Riverside Studio (pair adds “— Website” and “— Social”)"
          }
          className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[48px] md:text-sm`}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
          Project type
        </span>
        <select
          name="portalKind"
          defaultValue={mayOnlySocial ? "SOCIAL" : "WEBSITE"}
          className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[48px] cursor-pointer md:text-sm`}
        >
          {portalKindOptions.map((k) => (
            <option key={k} value={k}>
              {portalKindLabel(k)}
            </option>
          ))}
          {mayOnlySocial ? null : (
            <option value={STUDIO_FORM_WEBSITE_SOCIAL_PAIR}>
              Website + Social (two separate subscriptions)
            </option>
          )}
        </select>
        <span className="font-body text-[11px] leading-relaxed text-burgundy/55">
          {mayOnlySocial ? (
            <>
              Your role creates <span className="font-medium text-burgundy">social media management</span>{" "}
              subscriptions only. Ask Issy or Harriet to add website, branding, or combined projects.
            </>
          ) : (
            <>
              One subscription = one project on the client&apos;s home. Pick{" "}
              <span className="font-medium text-burgundy">The Pre-Launch Suite</span> for branding + website + social in
              one hub; choose <span className="font-medium text-burgundy">Website + Social (two subscriptions)</span> when
              those should be separate cards. Print and signage are their own project types.
            </>
          )}
        </span>
      </label>

      {studioAdmins.length > 0 ? (
        <label className="flex flex-col gap-2">
          <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
            Assign a studio admin (optional)
          </span>
          <select
            name="assignedStudioUserId"
            defaultValue=""
            className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[48px] cursor-pointer md:text-sm`}
          >
            <option value="">No assignee — anyone on the team can own follow-ups</option>
            {studioAdmins.map((a) => {
              const role = studioAdminRoleHint(a.studioTeamProfile?.personaSlug);
              return (
                <option key={a.id} value={a.id}>
                  {studioAdminDisplayLabel(a)}
                  {role ? ` — ${role}` : ` (${a.email})`}
                </option>
              );
            })}
          </select>
          <span className="font-body text-[11px] leading-relaxed text-burgundy/55">
            {mayOnlySocial ? (
              <>
                Set yourself as lead for social retainers you own. Issy and Harriet manage website and full-service
                accounts.
              </>
            ) : (
              <>
                <strong className="font-medium text-burgundy">Harriet</strong> owns creative direction on project
                accounts; <strong className="font-medium text-burgundy">Issy</strong> oversees those clients and flow;{" "}
                <strong className="font-medium text-burgundy">May</strong> leads assigned{" "}
                <span className="font-medium text-burgundy">social-only</span> subscriptions. This pick is the named lead
                on the account.
              </>
            )}
          </span>
        </label>
      ) : (
        <p className="rounded-cc-card border border-amber-200/60 bg-amber-50/50 px-4 py-3 font-body text-[13px] leading-relaxed text-amber-950/90">
          No studio admin accounts are registered yet. Add emails to{" "}
          <span className="font-mono text-[11px]">STUDIO_EMAIL</span> in <span className="font-medium">.env</span>, then
          have each person sign in once so they appear in the assignee list.
        </p>
      )}

      {hasClients ? (
        <div key="client-account-toggle">
          <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Client account</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={`min-h-[52px] rounded-xl border px-4 py-3 text-left font-body text-sm transition-[border-color,background-color] ${
                mode === "existing"
                  ? "border-zinc-400 bg-white text-burgundy shadow-sm"
                  : "border-zinc-200/90 bg-zinc-50/50 text-burgundy/80 hover:border-zinc-300"
              }`}
            >
              <span className="block font-medium">Existing client</span>
              <span className="mt-0.5 block text-[11px] font-normal text-burgundy/55">
                Already registered on the portal
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode("invite")}
              className={`min-h-[52px] rounded-xl border px-4 py-3 text-left font-body text-sm transition-[border-color,background-color] ${
                mode === "invite"
                  ? "border-zinc-400 bg-white text-burgundy shadow-sm"
                  : "border-zinc-200/90 bg-zinc-50/50 text-burgundy/80 hover:border-zinc-300"
              }`}
            >
              <span className="block font-medium">Invite by email</span>
              <span className="mt-0.5 block text-[11px] font-normal text-burgundy/55">
                They sign up later with this address
              </span>
            </button>
          </div>
        </div>
      ) : null}

      {mode === "existing" && hasClients ? (
        <>
          <input type="hidden" name="inviteEmail" value="" />
          <input type="hidden" name="inviteFirstName" value="" />
          <ClientAccountSearch clients={clients} />
        </>
      ) : (
        <div key="invite-fields" className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">First name</span>
            <input
              name="inviteFirstName"
              type="text"
              required
              maxLength={80}
              autoComplete="given-name"
              placeholder="e.g. Alex"
              className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[48px] md:text-sm`}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Email</span>
            <input
              name="inviteEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="client@theirbusiness.com"
              className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[48px] md:text-sm`}
            />
          </label>
          <span className="font-body text-[11px] leading-relaxed text-burgundy/55">
            We&apos;ll email them a private link to set their password. It stays valid for 7 days — Issy can resend from
            the project page if needed.
          </span>
        </div>
      )}

      <CreateProjectSubmitButton />
    </form>
  );
}
