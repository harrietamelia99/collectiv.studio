"use client";

type Props = {
  number: string;
  title: string;
  tagline: string;
  backgroundImage: string;
  href: string;
  onNavigate: () => void;
};

export function PortalCard({ number, title, tagline, backgroundImage, onNavigate }: Props) {
  return (
    <div
      className="portal-card"
      role="link"
      tabIndex={0}
      onClick={onNavigate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNavigate();
        }
      }}
    >
      <div
        className="portal-card__bg"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="portal-card__overlay" />
      <div className="portal-card__content">
        <span className="portal-card__number">{number}</span>
        <h2 className="portal-card__title">{title}</h2>
        <p className="portal-card__tagline">{tagline}</p>
        <div className="portal-card__divider" />
        <span className="portal-card__cta">Enter Experience →</span>
      </div>
    </div>
  );
}
