import Link from "next/link";
import type { RoomItem } from "../data";
import { RevealSection } from "./RevealSection";
import { RoomCard } from "./RoomCard";

type Props = {
  heading?: string;
  rooms: RoomItem[];
};

export function RoomShowcase({ heading = "Rooms & Suites", rooms }: Props) {
  return (
    <RevealSection>
      <section className="hw-section" style={{ paddingBottom: 48, paddingTop: 80 }}>
        <h2 className="hw-rooms__heading">{heading}</h2>
        <div className="hw-rooms__scroll">
          {rooms.map((room) => (
            <RoomCard key={room.name} {...room} />
          ))}
        </div>
      </section>
    </RevealSection>
  );
}

export function ExperienceFooter() {
  return (
    <footer className="hw-footer-row">
      <Link href="/hotels" className="hw-footer-row__back">
        ← All Experiences
      </Link>
    </footer>
  );
}
