import { T } from "@/lib/constants";

interface StepIndicatorProps {
  steps: string[];
  current: number;       // 1-based
  activePrimary: string;
  onStepClick: (n: number) => void;
}

export function StepIndicator({ steps, current, activePrimary, onStepClick }: StepIndicatorProps) {
  return (
    <div style={{ display: "flex", maxWidth: 540, marginBottom: 52 }}>
      {steps.map((label, i) => {
        const n       = i + 1;
        const done    = n < current;
        const active  = n === current;
        const last    = i === steps.length - 1;
        const align   = i === 0 ? "flex-start" : last ? "flex-end" : "center";

        return (
          <div key={i} style={{ flex: 1, position: "relative" }}>
            {!last && (
              <div className="step-conn" style={{ background: done ? activePrimary : T.sandDark }} />
            )}
            <div
              style={{ display: "flex", flexDirection: "column", alignItems: align, cursor: done ? "pointer" : "default" }}
              onClick={() => done && onStepClick(n)}
            >
              <div style={{
                width: 24, height: 24, marginBottom: 7,
                border: `1.5px solid ${done || active ? activePrimary : T.sandDark}`,
                background: done ? activePrimary : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 500,
                color: done ? T.white : active ? activePrimary : T.mist,
              }}>
                {done ? "✓" : n}
              </div>
              <span style={{
                fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                color: active ? activePrimary : T.mist,
              }}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
