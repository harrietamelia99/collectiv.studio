import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Plain layout wrappers (no scroll-based opacity). Framer “whileInView” was leaving pages blank
 * in some browsers and embedded previews when IntersectionObserver never fired.
 */
export function MotionSection({
  children,
  className = "",
  ...rest
}: {
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"section">, "className" | "children">) {
  return (
    <section className={className} {...rest}>
      {children}
    </section>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function StaggerList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
