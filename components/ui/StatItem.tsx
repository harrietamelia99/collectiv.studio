type Props = {
  value: string;
  label: string;
};

export function StatItem({ value, label }: Props) {
  return (
    <div className="cc-stat-item flex flex-col items-center text-center">
      <span className="font-display text-[clamp(1.85rem,4vw,3rem)] font-normal leading-none tracking-[-0.03em] text-burgundy tabular-nums">
        {value}
      </span>
      <span
        className="mt-2.5 block h-[var(--cc-stroke)] w-10 bg-gradient-to-r from-transparent via-burgundy/35 to-transparent md:mt-3 md:w-12"
        aria-hidden
      />
      <span className="cc-caption mt-3 text-burgundy/65 md:mt-3.5 md:tracking-[0.2em]">
        [ {label} ]
      </span>
    </div>
  );
}
