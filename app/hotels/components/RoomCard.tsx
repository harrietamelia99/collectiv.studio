import Image from "next/image";
import type { RoomItem } from "../data";

type Props = RoomItem;

export function RoomCard({ image, name, type, price }: Props) {
  return (
    <article className="hw-room-card">
      <div className="hw-room-card__image-wrap">
        <Image
          src={image}
          alt={name}
          fill
          className="hw-room-card__image"
          sizes="(max-width: 768px) 78vw, 340px"
          loading="lazy"
        />
      </div>
      <div className="hw-room-card__body">
        <h3 className="hw-room-card__name">{name}</h3>
        <p className="hw-room-card__type">{type}</p>
        <p className="hw-room-card__price">{price}</p>
      </div>
    </article>
  );
}
