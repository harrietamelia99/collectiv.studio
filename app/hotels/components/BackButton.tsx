"use client";

import Link from "next/link";

type Props = {
  href?: string;
  label?: string;
};

export function BackButton({ href = "/hotels", label = "← Back" }: Props) {
  return (
    <Link href={href} className="hw-back-fixed">
      {label}
    </Link>
  );
}
