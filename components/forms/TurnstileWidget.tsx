"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";
import { turnstileSiteKey } from "@/lib/turnstile-public";

type Props = {
  onToken: (token: string) => void;
  onExpire?: () => void;
  className?: string;
};

export function TurnstileWidget({ onToken, onExpire, className }: Props) {
  const siteKey = turnstileSiteKey();
  const ref = useRef<TurnstileInstance | null>(null);

  if (!siteKey) return null;

  return (
    <div className={className}>
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        options={{ theme: "light", size: "flexible" }}
        onSuccess={onToken}
        onExpire={() => {
          ref.current?.reset();
          onExpire?.();
        }}
        onError={() => {
          ref.current?.reset();
          onExpire?.();
        }}
      />
    </div>
  );
}
