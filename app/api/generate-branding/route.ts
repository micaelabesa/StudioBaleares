import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type BrandColor = {
  name: string;
  hex:  string;
  role: "primary" | "secondary" | "accent" | "neutral";
};

export type BrandKit = {
  paletteName:  string;
  colors:       BrandColor[];
  fonts:        { heading: string; body: string };
  tagline:      string;
  descriptors:  string[];
  logoInitials: string;
};

export async function POST(req: NextRequest) {
  const { venueName, venueType, keywords, colorDirection } = await req.json() as {
    venueName:      string;
    venueType:      string;
    keywords:       string;
    colorDirection: string;
  };

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are a Mediterranean hospitality branding expert. Create a professional mini brand kit in JSON.

Venue: "${venueName}"
Type: ${venueType}
Aesthetic keywords: ${keywords}
Color direction: ${colorDirection}

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "paletteName": "evocative 2-3 word palette name",
  "colors": [
    { "name": "color name", "hex": "#XXXXXX", "role": "primary" },
    { "name": "color name", "hex": "#XXXXXX", "role": "secondary" },
    { "name": "color name", "hex": "#XXXXXX", "role": "accent" },
    { "name": "color name", "hex": "#XXXXXX", "role": "neutral" }
  ],
  "fonts": {
    "heading": "choose one of: Playfair Display, Lora, Cormorant Garamond",
    "body": "choose one of: Jost, Montserrat"
  },
  "tagline": "evocative tagline, max 7 words",
  "descriptors": ["word1", "word2", "word3", "word4", "word5"],
  "logoInitials": "1-2 uppercase characters from the venue name"
}

Color palette rules by direction:
- warm: terracotta, amber, dusty rose, warm sand
- cool: sea blue, teal, sage, muted aqua
- natural: olive green, moss, stone, earth
- monochrome: charcoal, warm off-white, warm gray, linen`;

  try {
    const result = await model.generateContent(prompt);
    const text   = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const kit = JSON.parse(jsonMatch[0]) as BrandKit;
    return NextResponse.json({ kit });
  } catch (err) {
    console.error("Branding generation error:", err);
    return NextResponse.json({ error: "Failed to generate brand kit" }, { status: 500 });
  }
}
