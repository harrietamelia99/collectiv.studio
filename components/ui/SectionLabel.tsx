type Props = {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
};

export function SectionLabel({ children, className = "", light }: Props) {
  return (
    <p
      className={`cc-section-label ${light ? "cc-section-label--light" : ""} ${className}`.trim()}
    >
      {children}
    </p>
  );
}
