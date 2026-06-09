"use client";

import Link from "next/link";

export function PoweredByCredit() {
  return (
    <Link href="/" className="hw-credit" aria-label="Built by Collectiv. Studio">
      Powered by Collectiv. Studio
    </Link>
  );
}
