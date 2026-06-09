import type { ReactNode } from "react";
import type { HotelTheme } from "../data";
import { BackButton } from "./BackButton";
import { HotelCustomCursor } from "./HotelCustomCursor";
import { PoweredByCredit } from "./PoweredByCredit";

type Props = {
  theme: HotelTheme;
  children: ReactNode;
};

export function HotelExperienceShell({ theme, children }: Props) {
  return (
    <div className={`hotel-world hotel-world--${theme}`}>
      <HotelCustomCursor />
      {children}
      <BackButton />
      <PoweredByCredit />
    </div>
  );
}
