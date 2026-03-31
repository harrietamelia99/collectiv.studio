import { deleteProjectMessage } from "@/app/portal/actions";
import { ProjectMessageComposer } from "@/components/portal/ProjectMessageComposer";
import { PortalSectionCard } from "@/components/portal/PortalSectionCard";
import { ClientProjectLogoAvatar } from "@/components/portal/ClientProjectLogoAvatar";
import type { ConversationStripClient, ConversationStripStudio } from "@/lib/portal-conversation-strip";

type Message = {
  id: string;
  authorRole: string;
  authorName: string | null;
  body: string;
  createdAt: Date;
  /** When set (author linked + photo available), shown instead of generic studio/client avatars. */
  authorPhotoUrl?: string | null;
};

type Props = {
  projectId: string;
  messages: Message[];
  /** When false, hide the composer (studio-only read in some contexts). */
  canPost?: boolean;
  className?: string;
  /** Anchor id for in-page navigation (e.g. #project-messages). */
  sectionId?: string;
  /** White card frame matching Inspiration & mood (client portal). */
  clientVisualEmphasis?: boolean;
  /** Client view: you + assignee above the thread. */
  conversationParticipants?: {
    client: ConversationStripClient;
    studio: ConversationStripStudio;
  } | null;
  /** Agency: show delete on each message after reading. */
  studioCanDeleteMessages?: boolean;
  /**
   * When set with `clientVisualEmphasis`, controls bubble alignment (studio should use `"studio"` so their
   * messages read as “yours” in the client-styled card).
   */
  messagesThreadRole?: "client" | "studio";
  /** Replaces the default thread intro (e.g. agency project page copy). */
  feedbackDescription?: string;
};

function studioInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0] + parts[1]![0]).toUpperCase();
  const w = parts[0] ?? "?";
  return w.slice(0, 2).toUpperCase();
}

function MessageThreadAvatar({
  authorPhotoUrl,
  fromStudio,
  participants,
  clientLogoLabel,
  studioDisplayName,
}: {
  authorPhotoUrl: string | null | undefined;
  fromStudio: boolean;
  participants: { client: ConversationStripClient; studio: ConversationStripStudio } | null;
  clientLogoLabel: string;
  studioDisplayName: string;
}) {
  if (authorPhotoUrl) {
    return (
      <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-zinc-200/90 bg-white shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element -- portal profile / team URLs */}
        <img src={authorPhotoUrl} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }
  if (fromStudio) {
    const photoUrl = participants?.studio.photoUrl;
    if (photoUrl) {
      return (
        <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-zinc-200/90 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element -- team profile URLs */}
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        </span>
      );
    }
    return (
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-zinc-100 font-mono text-[11px] font-semibold text-burgundy/80 shadow-sm"
        aria-hidden
      >
        {studioInitials(studioDisplayName)}
      </span>
    );
  }
  return (
    <ClientProjectLogoAvatar
      logoPath={participants?.client.logoPath}
      name={clientLogoLabel}
      size="sm"
    />
  );
}

function MessagesList({
  projectId,
  messages,
  clientVisualEmphasis,
  studioCanDeleteMessages,
  participants,
  viewerRole,
}: {
  projectId: string;
  messages: Message[];
  clientVisualEmphasis: boolean;
  studioCanDeleteMessages: boolean;
  participants: { client: ConversationStripClient; studio: ConversationStripStudio } | null;
  viewerRole: "client" | "studio";
}) {
  return (
    <ul className="m-0 flex max-w-none list-none flex-col gap-5 p-0 lg:max-w-4xl">
      {messages.length === 0 ? (
        <li
          className={
            clientVisualEmphasis
              ? "cc-portal-client-empty m-0 list-none"
              : "rounded-xl border border-dashed border-burgundy/20 bg-burgundy/[0.02] px-4 py-6 font-body text-sm text-burgundy/55"
          }
        >
          No messages yet. Ask a question, request a tweak, or confirm you&apos;re happy with a deliverable.
        </li>
      ) : (
        messages.map((m) => {
          const fromStudio = m.authorRole === "STUDIO";
          const isMine =
            viewerRole === "client" ? m.authorRole === "CLIENT" : m.authorRole === "STUDIO";
          const clientLogoLabel =
            [participants?.client.businessName, participants?.client.personName].filter(Boolean).join(" · ") ||
            "Client";
          const studioDisplayName = participants?.studio.displayName?.trim() || "Collectiv. Studio";
          const displayName = fromStudio
            ? m.authorName?.trim() || studioDisplayName
            : m.authorName?.trim() ||
              participants?.client.personName?.trim() ||
              participants?.client.businessName?.trim() ||
              "You";

          const bubbleClass = clientVisualEmphasis
            ? isMine
              ? "border border-zinc-200/90 bg-white text-burgundy/90 rounded-2xl rounded-br-md"
              : "border border-zinc-200 bg-zinc-100/80 text-burgundy/90 rounded-2xl rounded-bl-md"
            : isMine
              ? "border border-burgundy/20 bg-burgundy text-cream rounded-2xl rounded-br-md"
              : "border border-burgundy/15 bg-burgundy/[0.04] text-burgundy/90 rounded-2xl rounded-bl-md";

          return (
            <li
              key={m.id}
              className={`flex w-full list-none ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[min(100%,26rem)] items-end gap-2.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}
              >
                <MessageThreadAvatar
                  authorPhotoUrl={m.authorPhotoUrl}
                  fromStudio={fromStudio}
                  participants={participants}
                  clientLogoLabel={clientLogoLabel}
                  studioDisplayName={studioDisplayName}
                />
                <div className={`min-w-0 flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}>
                  <div
                    className={`flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-0.5 px-0.5 ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <span className="font-display text-[13px] leading-tight text-burgundy/85">
                      {displayName}
                    </span>
                    <time
                      dateTime={m.createdAt.toISOString()}
                      className="font-mono text-[10px] tabular-nums tracking-[0.04em] text-burgundy/45"
                    >
                      {m.createdAt.toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    {studioCanDeleteMessages ? (
                      <form action={deleteProjectMessage.bind(null, projectId, m.id)} className="inline">
                        <button
                          type="submit"
                          className="touch-manipulation font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-burgundy/40 underline decoration-burgundy/25 underline-offset-2 transition-colors hover:text-burgundy hover:decoration-burgundy/50"
                          aria-label="Delete this message from the thread"
                        >
                          Delete
                        </button>
                      </form>
                    ) : null}
                  </div>
                  <div className={`px-4 py-2.5 shadow-sm ${bubbleClass}`}>
                    <p
                      className={`m-0 whitespace-pre-wrap font-body text-sm leading-relaxed ${
                        clientVisualEmphasis || !isMine ? "text-burgundy/90" : "text-cream"
                      }`}
                    >
                      {m.body}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })
      )}
    </ul>
  );
}

export function ProjectFeedbackSection({
  projectId,
  messages,
  canPost = true,
  className = "",
  sectionId,
  clientVisualEmphasis = false,
  conversationParticipants = null,
  studioCanDeleteMessages = false,
  messagesThreadRole,
  feedbackDescription,
}: Props) {
  const descriptionText =
    feedbackDescription ??
    "Leave notes for the studio or reply in the same thread. Use this alongside sign-offs so nothing gets lost in email.";

  const threadRole = messagesThreadRole ?? (clientVisualEmphasis ? "client" : "studio");

  const composer = canPost ? (
    <ProjectMessageComposer
      projectId={projectId}
      variant={clientVisualEmphasis ? "clientEmphasis" : "studio"}
    />
  ) : null;

  if (clientVisualEmphasis) {
    return (
      <PortalSectionCard
        id={sectionId}
        headingId="feedback-heading"
        title="Feedback & messages"
        description={<p className="m-0">{descriptionText}</p>}
        variant="client"
        className={className}
      >
        <>
          <MessagesList
            projectId={projectId}
            messages={messages}
            clientVisualEmphasis
            studioCanDeleteMessages={studioCanDeleteMessages}
            participants={conversationParticipants}
            viewerRole={threadRole}
          />
          {composer}
        </>
      </PortalSectionCard>
    );
  }

  return (
    <section
      id={sectionId}
      className={`scroll-mt-28 border-t-cc border-solid border-[var(--cc-hairline-cream-edge)] pt-10 ${className}`}
      aria-labelledby="feedback-heading"
    >
      <h2 id="feedback-heading" className="font-display text-cc-h3 text-burgundy">
        Feedback &amp; messages
      </h2>
      <p className="mt-2 max-w-xl font-body text-sm text-burgundy/65">{descriptionText}</p>
      <div className="mt-8">
        <MessagesList
          projectId={projectId}
          messages={messages}
          clientVisualEmphasis={false}
          studioCanDeleteMessages={studioCanDeleteMessages}
          participants={conversationParticipants}
          viewerRole="studio"
        />
        {composer}
      </div>
    </section>
  );
}
