import { T } from "@/lib/constants";

interface RestaurantInfo {
  name: string;
  tagline: string;
  cuisine: string;
}

interface StepRestaurantProps {
  info: RestaurantInfo;
  onChange: (field: keyof RestaurantInfo, value: string) => void;
  onNext: () => void;
}

export function StepRestaurant({ info, onChange, onNext }: StepRestaurantProps) {
  return (
    <div className="fu" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
      {/* Form */}
      <div>
        <h3 style={{ fontSize: 22, marginBottom: 6 }}>Tell us about your restaurant</h3>
        <p style={{ color: T.mist, fontSize: 14, marginBottom: 32 }}>
          This info will appear on your digital menu.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <label className="field-label">Restaurant Name *</label>
            <input
              className="field-input"
              placeholder="e.g. Casa Marina"
              value={info.name}
              onChange={(e) => onChange("name", e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Tagline</label>
            <input
              className="field-input"
              placeholder="e.g. Fresh Mediterranean cuisine by the sea"
              value={info.tagline}
              onChange={(e) => onChange("tagline", e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Cuisine Type</label>
            <input
              className="field-input"
              placeholder="e.g. Spanish tapas, Italian, Brunch café…"
              value={info.cuisine}
              onChange={(e) => onChange("cuisine", e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ marginTop: 36 }}
          disabled={!info.name.trim()}
          onClick={onNext}
        >
          Continue →
        </button>
      </div>

      {/* Live preview card */}
      <div style={{
        background: T.sand, border: `1px solid ${T.sandDark}`,
        padding: 40, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: T.ink, marginBottom: 8 }}>
          {info.name || "Your Restaurant"}
        </div>
        <p className="serif" style={{ fontStyle: "italic", color: T.mist, fontSize: 13 }}>
          {info.tagline || "Your beautiful tagline here"}
        </p>
        <div style={{ margin: "24px 0", width: 1, height: 32, background: T.sandDark }} />
        <div style={{
          width: 72, height: 72, border: `1px solid ${T.sandDark}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.mist, fontSize: 9, letterSpacing: "0.12em",
        }}>
          QR CODE
        </div>
        <p className="tag" style={{ marginTop: 12 }}>Scan to see menu</p>
      </div>
    </div>
  );
}
