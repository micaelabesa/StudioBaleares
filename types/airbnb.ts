// types/airbnb.ts

export type PropertyType = "Airbnb" | "Villa" | "B&B" | "Hotel boutique" | "Apartamento";
export type PdfPalette   = "terracotta" | "sea" | "noir";
export type DocLanguage  = "en" | "es";

// ── Step 1 ────────────────────────────────────────────────────────────────────
export interface PropertyInfo {
  propertyName: string;
  hostName:     string;
  propertyType: PropertyType;
  city:         string;
  checkIn:      string;   // "15:00"
  checkOut:     string;   // "11:00"
  wifiName:     string;
  wifiPassword: string;
}

// ── Step 2 ────────────────────────────────────────────────────────────────────
export interface HouseRule {
  id:   string;
  text: string;
}

export interface LocalRec {
  id:          string;
  name:        string;
  type:        string;   // "Restaurant", "Bar", "Beach", "Market"…
  description: string;
}

export interface EmergencyContact {
  id:    string;
  label: string;   // "Host", "General Emergencies", "Nearest Hospital"…
  value: string;   // phone / address
}

export interface ContentData {
  welcomeNote:   string;          // texto libre que la IA mejora
  rules:         HouseRule[];
  recommendations: LocalRec[];
  emergency:     EmergencyContact[];
}

// ── Step 3 ────────────────────────────────────────────────────────────────────
export interface StyleData {
  palette:  PdfPalette;
  language: DocLanguage;
}

// ── Combined ──────────────────────────────────────────────────────────────────
export interface WelcomeGuideData {
  info:    PropertyInfo;
  content: ContentData;
  style:   StyleData;
}
