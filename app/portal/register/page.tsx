import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create account | Client portal",
};

export default function PortalRegisterPage() {
  return (
    <div>
      <Link
        href="/"
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Back to site
      </Link>
      <h1 className="mt-6 border-l-4 border-burgundy pl-4 font-display text-cc-h2 tracking-[-0.03em] text-burgundy sm:pl-5">
        Create an account
      </h1>
      <p className="mt-4 max-w-md font-body text-sm font-medium leading-relaxed text-burgundy/80">
        You’ll get a project space to track progress, approve social posts, and share website branding assets with the
        studio. The studio is notified when you register; your projects appear here once they’ve assigned or invited
        you (use the same email they used for an invite).
      </p>
      <RegisterForm />
    </div>
  );
}
