"use client";

import { useState } from "react";
import type { HotelTheme } from "../data";

type Props = {
  theme: HotelTheme;
  property: string;
  fromPrice: string;
};

export function MockBookingPanel({ theme, property, fromPrice }: Props) {
  const [guests, setGuests] = useState(2);
  const [submitted, setSubmitted] = useState(false);

  return (
    <aside className={`hw-booking hw-booking--${theme}`} aria-label="Booking demo">
      <div className="hw-booking__header">
        <span className="hw-booking__label">Book direct</span>
        <span className="hw-booking__property">{property}</span>
      </div>

      <div className="hw-booking__fields">
        <div className="hw-booking__field">
          <span className="hw-booking__field-label">Check in</span>
          <span className="hw-booking__field-value">14 Jun 2026</span>
        </div>
        <div className="hw-booking__field">
          <span className="hw-booking__field-label">Check out</span>
          <span className="hw-booking__field-value">17 Jun 2026</span>
        </div>
        <div className="hw-booking__field hw-booking__field--guests">
          <span className="hw-booking__field-label">Guests</span>
          <div className="hw-booking__stepper">
            <button
              type="button"
              className="hw-booking__step"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              aria-label="Fewer guests"
            >
              −
            </button>
            <span className="hw-booking__field-value">{guests}</span>
            <button
              type="button"
              className="hw-booking__step"
              onClick={() => setGuests((g) => Math.min(6, g + 1))}
              aria-label="More guests"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <p className="hw-booking__from">{fromPrice}</p>

      <button
        type="button"
        className="hw-booking__btn"
        onClick={() => setSubmitted(true)}
      >
        {submitted ? "3 rooms available" : "Check availability"}
      </button>

      <p className="hw-booking__note">
        Demo widget — we integrate Cloudbeds, Mews, Little Hotelier &amp; more
      </p>
    </aside>
  );
}
