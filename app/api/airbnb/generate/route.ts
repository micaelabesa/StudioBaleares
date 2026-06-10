// app/api/airbnb/generate/route.ts
//
// Recibe los datos del paso 2 y devuelve:
//   - welcomeNote mejorado (poético, cálido)
//   - rules mejoradas (idioma hospitalario, no prohibitivo)
//   - recommendations enriquecidas (1 frase evocadora por lugar)
//
// La API key nunca sale del servidor.

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { WelcomeGuideData } from "@/types/airbnb";

export async function POST(req: NextRequest) {
  const anthropic = new Anthropic();
  const body = (await req.json()) as WelcomeGuideData;
  const { info, content, style } = body;

  const lang    = style.language === "es" ? "Spanish" : "English";
  const isSpain = style.language === "es";

  const prompt = `You are a luxury hospitality copywriter specialising in Mediterranean short-term rentals.
Rewrite the following Airbnb welcome guide content to sound warm, elegant and editorial.
Write everything in ${lang}.
Return ONLY valid JSON — no markdown fences, no explanation.

Property: "${info.propertyName}" (${info.propertyType}) in ${info.city}, hosted by ${info.hostName}.

Welcome note (raw): "${content.welcomeNote || `Welcome to ${info.propertyName}!`}"

House rules (raw list):
${content.rules.map((r, i) => `${i + 1}. ${r.text}`).join("\n") || "No smoking. Respect quiet hours after 22:00. No parties."}

Local recommendations (raw):
${content.recommendations.map(r => `- ${r.name} (${r.type}): ${r.description}`).join("\n") || "None provided."}

Return exactly this JSON shape:
{
  "welcomeNote": "2–3 warm, elegant sentences welcoming the guest",
  "rules": [
    { "id": "<same id as input>", "text": "rewritten rule in ${lang}, hospitable tone, positive framing" }
  ],
  "recommendations": [
    { "id": "<same id>", "name": "<same name>", "type": "<same type>", "description": "one evocative sentence in ${lang}" }
  ]
}

Rules count must match exactly: ${content.rules.length} rules.
Recommendations count must match: ${content.recommendations.length} recommendations.
${isSpain ? "Use Spanish (Spain), not Latin American Spanish." : ""}`;

  try {
    const message = await anthropic.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages:   [{ role: "user", content: prompt }],
    });

    const raw   = (message.content[0] as { text: string }).text;
    const clean = raw.replace(/```json|```/g, "").trim();
    const data  = JSON.parse(clean);

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("Claude API error:", err);
    // Graceful fallback — devuelve el contenido original sin mejorar
    return NextResponse.json({
      ok: true,
      data: {
        welcomeNote:     content.welcomeNote,
        rules:           content.rules,
        recommendations: content.recommendations,
      },
    });
  }
}
