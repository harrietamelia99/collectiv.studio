import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { approveFaqSuggestion, rejectFaqSuggestion } from "@/app/portal/actions";
import { authOptions } from "@/lib/auth-options";
import { isStudioUser } from "@/lib/portal-access";
import { prisma } from "@/lib/prisma";
import { ctaButtonClasses } from "@/components/ui/Button";

export default async function FaqSuggestionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/portal/login");
  if (!isStudioUser(session.user.email)) redirect("/portal");

  const pending = await prisma.faqSuggestion.findMany({
    where: { status: "PENDING" },
    orderBy: [{ askCount: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="pb-8">
      <Link
        href="/portal"
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Studio dashboard
      </Link>
      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">Suggested FAQs</h1>
      <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-burgundy/70">
        When the same question is asked more than five times in site chat, it queues here. Approve with an answer to add
        it to the About page, or reject to dismiss.
      </p>

      <ul className="mt-10 flex flex-col gap-8">
        {pending.length === 0 ? (
          <li className="cc-portal-client-empty py-10 text-center">
            Nothing in the queue right now.
          </li>
        ) : (
          pending.map((s) => (
            <li
              key={s.id}
              className="rounded-cc-card border border-burgundy/12 bg-cream p-5 shadow-soft sm:p-6"
            >
              <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/45">
                Asked ~{s.askCount} times · sample wording
              </p>
              <p className="mt-2 font-body text-sm font-medium text-burgundy">&ldquo;{s.sampleQuestion}&rdquo;</p>

              <form action={approveFaqSuggestion.bind(null, s.id)} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                    FAQ question (edit if needed)
                  </span>
                  <input
                    type="text"
                    name="question"
                    required
                    maxLength={500}
                    defaultValue={s.sampleQuestion.slice(0, 500)}
                    className="w-full rounded-cc-card border border-burgundy/15 bg-white px-4 py-2.5 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                    Answer (published on About)
                  </span>
                  <textarea
                    name="answer"
                    required
                    rows={5}
                    maxLength={4000}
                    className="w-full rounded-cc-card border border-burgundy/15 bg-white px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
                    placeholder="Clear, on-brand answer for the site…"
                  />
                </label>
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="submit"
                    className={ctaButtonClasses({ variant: "burgundy", size: "sm", className: "px-5" })}
                  >
                    Approve & publish
                  </button>
                </div>
              </form>

              <form action={rejectFaqSuggestion.bind(null, s.id)} className="mt-4 border-t border-burgundy/10 pt-4">
                <button
                  type="submit"
                  className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/45 underline-offset-4 hover:text-burgundy hover:underline"
                >
                  Reject suggestion
                </button>
              </form>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
