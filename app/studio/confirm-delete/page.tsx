"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/constants";
import { useLang } from "@/contexts/LangContext";
import { Ornament } from "@/components/ui/Ornament";

type Step = "confirm" | "deleting" | "done" | "error";

export default function ConfirmDeletePage() {
  const router        = useRouter();
  const { t }         = useLang();
  const cd            = t.subscription.confirmDelete;
  const [step, setStep] = useState<Step>("confirm");
  const [errMsg, setErrMsg] = useState("");

  const handleDelete = async () => {
    setStep("deleting");
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        setErrMsg(body.error ?? cd.error);
        setStep("error");
        return;
      }
      setStep("done");
      setTimeout(() => router.push("/"), 4000);
    } catch {
      setErrMsg(cd.error);
      setStep("error");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${T.sand} 0%, ${T.cream} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, textAlign: "center",
    }}>
      <div style={{ maxWidth: 480 }}>

        {/* Icon circle */}
        <div style={{
          width: 72, height: 72,
          border: `1.5px solid ${step === "done" ? T.terracotta : "#C0392B44"}`,
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 36px", fontSize: 26,
          transition: "border-color 0.5s",
        }}>
          {step === "done"
            ? <span style={{ color: T.terracotta }}>✦</span>
            : step === "deleting"
              ? <span style={{ fontSize: 13, color: T.mist, letterSpacing: 3 }}>···</span>
              : <span style={{ color: "#C0392B", fontSize: 20 }}>⚠</span>
          }
        </div>

        {/* Confirm */}
        {step === "confirm" && (
          <>
            <p className="tag" style={{ color: "#C0392B", marginBottom: 10 }}>{cd.tag}</p>
            <Ornament />
            <h1 style={{ fontSize: 32, marginBottom: 20 }}>{cd.title}</h1>
            <p style={{ fontSize: 14, color: T.mist, lineHeight: 1.75, marginBottom: 40, maxWidth: 400, margin: "0 auto 40px" }}>
              {cd.desc}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <button
                onClick={handleDelete}
                style={{
                  fontSize: 11, letterSpacing: "0.08em", padding: "12px 28px",
                  border: "1px solid #C0392B", color: "#C0392B",
                  background: "transparent", cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#C0392B11"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}
              >
                {cd.btn}
              </button>
              <button
                className="btn-primary"
                style={{ fontSize: 11, padding: "12px 28px" }}
                onClick={() => router.push("/studio/subscription")}
              >
                {cd.cancel}
              </button>
            </div>
          </>
        )}

        {/* Deleting */}
        {step === "deleting" && (
          <>
            <p className="tag" style={{ marginBottom: 10 }}>{cd.tag}</p>
            <Ornament />
            <h1 style={{ fontSize: 32, marginBottom: 16 }}>{cd.deleting}</h1>
          </>
        )}

        {/* Done */}
        {step === "done" && (
          <>
            <p className="tag" style={{ marginBottom: 10 }}>{cd.tag}</p>
            <Ornament />
            <h1 style={{ fontSize: 32, marginBottom: 16 }}>{cd.title}</h1>
            <p style={{ fontSize: 14, color: T.mist, lineHeight: 1.75 }}>{cd.done}</p>
          </>
        )}

        {/* Error */}
        {step === "error" && (
          <>
            <p className="tag" style={{ color: "#C0392B", marginBottom: 10 }}>{cd.tag}</p>
            <Ornament />
            <h1 style={{ fontSize: 32, marginBottom: 16 }}>{cd.title}</h1>
            <p style={{ fontSize: 14, color: "#C0392B", marginBottom: 32, lineHeight: 1.75 }}>{errMsg || cd.error}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <button className="btn-primary" style={{ fontSize: 11 }}
                onClick={() => setStep("confirm")}>
                {cd.cancel}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
