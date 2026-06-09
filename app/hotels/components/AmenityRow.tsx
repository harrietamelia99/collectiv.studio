import { AMENITY_ICONS, type AmenityKey } from "../data";

export type AmenityItem = {
  key: AmenityKey;
  label: string;
};

type Props = {
  items: readonly AmenityItem[];
};

export function AmenityRow({ items }: Props) {
  return (
    <section className="hw-amenities">
      <div className="hw-amenities__grid">
        {items.map((item) => (
          <div key={item.label} className="hw-amenity">
            {AMENITY_ICONS[item.key]}
            <span className="hw-amenity__label">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
