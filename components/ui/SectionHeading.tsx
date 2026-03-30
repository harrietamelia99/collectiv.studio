type Props = {
  as?: "h1" | "h2" | "h3";
  id?: string;
  children: React.ReactNode;
  className?: string;
  light?: boolean;
  /** Default center - avoids relying on parent text-align (easy to lose in the cascade). */
  align?: "center" | "left";
};

const tierClass: Record<NonNullable<Props["as"]>, string> = {
  h1: "text-cc-h1",
  h2: "text-cc-h2",
  h3: "text-cc-h3",
};

export function SectionHeading({
  as: Tag = "h2",
  id,
  children,
  className = "",
  light,
  align = "center",
}: Props) {
  const alignClass = align === "left" ? "text-left" : "text-center";
  return (
    <Tag
      id={id}
      className={`cc-no-heading-hover font-display font-normal ${tierClass[Tag]} ${light ? "text-cream" : "text-burgundy"} ${alignClass} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
