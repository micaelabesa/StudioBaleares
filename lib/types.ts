export type Plan = "free" | "pro";

export interface MenuItem {
  name: string;
  desc: string;
  price: string;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface GeneratedMenu {
  restaurantName: string;
  tagline: string;
  categories: MenuCategory[];
}

export interface PaletteEntry {
  primary: string;
  bg: string;
  name: string;
  proOnly?: boolean;
}
