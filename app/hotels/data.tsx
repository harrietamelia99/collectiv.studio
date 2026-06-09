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

export type AmenityKey =
  | "sun"
  | "pool"
  | "dining"
  | "spa"
  | "concierge"
  | "transport"
  | "fire"
  | "grounds"
  | "dog"
  | "tea"
  | "bar"
  | "cinema"
  | "lounge"
  | "valet"
  | "shop";
