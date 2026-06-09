"use client";

// app/studio/success/page.tsx
//
// Fix del polling post-Stripe:
// — Antes: llamaba a refreshPlan() del contexto, que usaba el cliente browser
//   con la sesión cacheada en memoria → leía el plan viejo durante varios segundos.
// — Ahora: hace fetch a /api/stripe/plan que lee con supabaseAdmin (service role)
//   directamente en servidor → siempre devuelve el valor real de Supabase.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudio } from "@/contexts/StudioContext";
import { useLang } from "@/contexts/LangContext";
import { T } from "@/lib/constants";
import { Ornament } from "@/components/ui/Ornament";

export default function SuccessPage() {
  const router                    = useRouter();
  const { refreshPlan }           = useStudio();
  const { t }                     = useLang();
  const [confirmed, setConfirmed] = useState(false);
  const [attempts, setAttempts]   = useState(0);
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        // Lee el plan desde el servidor con service role — sin caché
        const res  = await fetch("/api/stripe/plan", { cache: "no-store" });
        const data = await res.json() as { plan?: string };

        if (data.plan === "pro") {
          // Actualiza el contexto global para que el resto de la app lo sepa
          await refreshPlan();
          setConfirmed(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
      } catch (err) {
        console.warn("Poll error:", err);
      }

      setAttempts((a) => {
        const next = a + 1;
        // Tras 12 intentos (24 s) redirigir de todas formas
        if (next >= 12 && intervalRef.current) {
          clearInterval(intervalRef.current);
          router.push("/studio/qrmenu");
        }
        return next;
      });
    };

    // Primera llamada inmediata
    poll();
    // Luego cada 2 segundos
    intervalRef.current = setInterval(poll, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cuando se confirma, redirigir tras 3 s
  useEffect(() => {
    if (!confirmed) return;
    const t = setTimeout(() => router.push("/studio/qrmenu"), 3000);
    return () => clearTimeout(t);
  }, [confirmed, router]);

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${T.sand} 0%, ${T.cream} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, textAlign: "center",
    }}>
      <div style={{ maxWidth: 440 }}>

        {/* Icono central */}
        <div style={{
          width: 72, height: 72,
          border: `1.5px solid ${confirmed ? T.terracotta : T.sandDark}`,
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 36px", fontSize: 28,
          transition: "border-color 0.5s",
        }}>
          {confirmed
            ? <span style={{ color: T.terracotta }}>✦</span>
            : <span style={{ fontSize: 13, color: T.mist, letterSpacing: 3 }}>···</span>
          }
        </div>

        {/* Estado: esperando */}
        {!confirmed && (
          <>
            <p className="tag" style={{ marginBottom: 10 }}>{t.success.processingTag}</p>
            <Ornament />
            <h1 style={{ fontSize: 32, marginBottom: 14 }}>{t.success.processingTitle}</h1>
            <p style={{ color: T.mist, fontSize: 14, marginBottom: 8 }}>
              {t.success.processingBody}
            </p>
            {attempts > 5 && (
              <p style={{ color: T.mist, fontSize: 12, marginBottom: 32 }}>
                {t.success.processingLong}
              </p>
            )}
            <button
              className="btn-ghost"
              style={{ fontSize: 10, marginTop: 24 }}
              onClick={() => router.push("/studio/qrmenu")}
            >
              {t.success.processingSkip}
            </button>
          </>
        )}

        {/* Estado: confirmado */}
        {confirmed && (
          <>
            <p className="tag" style={{ marginBottom: 10 }}>{t.success.tag}</p>
            <Ornament />
            <h1 style={{ fontSize: 36, marginBottom: 16 }}>{t.success.title}</h1>
            <p className="serif" style={{
              fontStyle: "italic", color: T.mist,
              fontSize: 18, lineHeight: 1.8, marginBottom: 40,
            }}>
              {t.success.subtitle}
            </p>
            <div style={{
              display: "flex", flexDirection: "column", gap: 10,
              textAlign: "left", maxWidth: 280, margin: "0 auto 40px",
            }}>
              {t.success.features.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ color: T.terracotta }}>✓</span>
                  <span style={{ fontSize: 14, color: T.inkLight }}>{f}</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={() => router.push("/studio/qrmenu")}>
              {t.success.btn}
            </button>
            <p style={{ marginTop: 16, fontSize: 11, color: T.mist }}>
              {t.success.redirect}
            </p>
          </>
        )}

      </div>
    </div>
  );
}
