export type HotelTheme = "mediterranean" | "cotswolds" | "city";

export type RoomItem = {
  image: string;
  name: string;
  type: string;
  price: string;
};

export const MEDITERRANEAN_ROOMS: RoomItem[] = [
  {
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
    name: "The Aegean Suite",
    type: "JUNIOR SUITE",
    price: "From €480 per night",
  },
  {
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    name: "Terrazza Bianca",
    type: "TERRACE SUITE",
    price: "From €620 per night",
  },
  {
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
    name: "The Marbella Room",
    type: "DELUXE KING",
    price: "From €340 per night",
  },
  {
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
    name: "Vista Marina",
    type: "SEA VIEW SUITE",
    price: "From €780 per night",
  },
];

export const COTSWOLDS_ROOMS: RoomItem[] = [
  {
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    name: "The Hayloft Suite",
    type: "SIGNATURE SUITE",
    price: "From £380 per night",
  },
  {
    image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&q=80",
    name: "Rose Cottage Room",
    type: "SUPERIOR DOUBLE",
    price: "From £220 per night",
  },
  {
    image: "https://images.unsplash.com/photo-1587985064135-0366536eab42?w=800&q=80",
    name: "The Manor Suite",
    type: "GRAND SUITE",
    price: "From £520 per night",
  },
  {
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80",
    name: "Wisteria Room",
    type: "GARDEN VIEW DOUBLE",
    price: "From £195 per night",
  },
];

export const CITY_ROOMS: RoomItem[] = [
  {
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
    name: "The Penthouse",
    type: "PENTHOUSE SUITE",
    price: "From £950 per night",
  },
  {
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
    name: "Executive Corner",
    type: "EXECUTIVE SUITE",
    price: "From £420 per night",
  },
  {
    image: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&q=80",
    name: "The Studio Loft",
    type: "LOFT ROOM",
    price: "From £280 per night",
  },
  {
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    name: "City View Suite",
    type: "PREMIER SUITE",
    price: "From £560 per night",
  },
];

export const AMENITY_ICONS = {
  sun: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  pool: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <path d="M2 12c2 0 2-4 4-4s2 4 4 4 2-4 4-4 2 4 4 4 2-4 4-4 2 4 4 4" />
      <path d="M2 18c2 0 2-4 4-4s2 4 4 4 2-4 4-4 2 4 4 4 2-4 4-4 2 4 4 4" />
    </svg>
  ),
  dining: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <path d="M8 3v8M5 3v5M11 3v5M8 11v10M16 3v18M19 3v8a3 3 0 0 1-3 3h0" />
    </svg>
  ),
  spa: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <path d="M12 3c3 4 6 6 6 10a6 6 0 0 1-12 0c0-4 3-6 6-10z" />
    </svg>
  ),
  concierge: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
    </svg>
  ),
  transport: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <path d="M5 17h14v-5H5v5zM5 9l2-4h10l2 4M7 17a1.5 1.5 0 1 0 0 .01M17 17a1.5 1.5 0 1 0 0 .01" />
    </svg>
  ),
  fire: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <path d="M12 22c4-3 6-6 6-10a6 6 0 0 0-10-4c-1 3-3 4-3 7a3 3 0 0 0 6 0c0-2-1-3-1-5 2 2 2 5 2 5z" />
    </svg>
  ),
  grounds: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <path d="M12 22V12M12 12C8 12 5 9 5 5c4 0 7 3 7 7M12 12c4 0 7-3 7-7-4 0-7 3-7 7" />
    </svg>
  ),
  dog: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <path d="M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM15 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 16c1-3 3-4 6-4s5 1 6 4" />
    </svg>
  ),
  tea: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <path d="M6 8h12v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V8zM18 10h1a2 2 0 0 1 0 4h-1M8 4v2M12 4v2M16 4v2" />
    </svg>
  ),
  bar: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <path d="M8 22h8M12 15V2M5 6h14" />
    </svg>
  ),
  cinema: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M7 9v6M11 9v6M15 9v6" />
    </svg>
  ),
  lounge: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <path d="M4 18v2h16v-2M6 10h12v8H6zM8 10V6h8v4" />
    </svg>
  ),
  valet: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <path d="M3 14h18M5 14l2-7h10l2 7M7 14a2 2 0 1 0 4 0M13 14a2 2 0 1 0 4 0" />
    </svg>
  ),
  shop: (
    <svg viewBox="0 0 24 24" className="hw-amenity__icon" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12L6 6zM6 6L5 3H2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    </svg>
  ),
} as const;

export type AmenityKey = keyof typeof AMENITY_ICONS;
