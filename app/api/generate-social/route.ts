import { NextRequest, NextResponse } from "next/server";

export interface GeneratedPost {
  captions: {
    short:  string;
    medium: string;
    long:   string;
  };
  hashtags: string[];
  cta: string;
}

export async function POST(req: NextRequest) {
  const { name, cuisine, topic, context, tone } = await req.json();

  let post: GeneratedPost;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{
          role: "user",
          content: `You are a Mediterranean hospitality social media expert. Generate Instagram captions for this restaurant post.

Restaurant: ${name}
Cuisine: ${cuisine || "Mediterranean"}
Post topic: ${topic}
Tone: ${tone}
Extra context: ${context || "none"}

Rules:
- Write in the same language the topic is written in
- Tone "${tone}": elegant=poetic & refined, warm=friendly & inviting, minimal=clean & bold
- Use relevant emojis naturally (not excessively)
- Hashtags: mix of popular and niche, relevant to Mediterranean hospitality

Return ONLY valid JSON, no markdown:
{
  "captions": {
    "short": "punchy caption under 60 characters",
    "medium": "engaging caption 80-130 characters with 1-2 emojis",
    "long": "storytelling caption 160-230 characters that evokes the experience"
  },
  "hashtags": ["hashtag1","hashtag2","hashtag3","hashtag4","hashtag5","hashtag6","hashtag7","hashtag8"],
  "cta": "one short call to action sentence"
}`,
        }],
      }),
    });

    const data  = await res.json();
    const raw   = (data.content?.[0]?.text as string) ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();
    post        = JSON.parse(clean) as GeneratedPost;

  } catch {
    // Fallback
    post = {
      captions: {
        short:  `${topic} — ${name} ✦`,
        medium: `Every dish tells a story. Tonight, it's ${topic}. Come taste the Mediterranean. 🌿`,
        long:   `There are flavours that take you somewhere else entirely. At ${name}, ${topic} is more than a dish — it's a moment worth savouring. Join us. 🍋✨`,
      },
      hashtags: ["#MediterraneanFood", "#RestaurantLife", "#FoodPhotography", "#LocalEats", "#ChefSpecial", "#FoodLovers", "#DineOut", "#Hospitality"],
      cta: "Reserve your table tonight",
    };
  }

  return NextResponse.json({ post });
}
