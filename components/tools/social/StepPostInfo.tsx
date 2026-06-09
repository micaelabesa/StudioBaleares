import { T } from "@/lib/constants";

interface PostInfo {
  name:    string;
  cuisine: string;
  topic:   string;
  context: string;
}

interface StepPostInfoProps {
  info:         PostInfo;
  onChange:     (field: keyof PostInfo, val: string) => void;
  onNext:       () => void;
  onLoadMenu:   () => void;
  loadingMenu:  boolean;
  isLoggedIn:   boolean;
}

const TOPIC_SUGGESTIONS = [
  "New seasonal dish", "Weekend brunch", "Chef's special",
  "Happy hour", "Private dining", "Customer review highlight",
];

export function StepPostInfo({ info, onChange, onNext, onLoadMenu, loadingMenu, isLoggedIn }: StepPostInfoProps) {
  return (
    <div className="fu" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
      <div>
        <h3 style={{ fontSize: 22, marginBottom: 6 }}>What&apos;s this post about?</h3>
        <p style={{ color: T.mist, fontSize: 14, marginBottom: 32 }}>
          The AI will craft captions based on your info. The visual post shows your restaurant name and featured item.
        </p>

        {/* Load from menu */}
        {isLoggedIn && (
          <div style={{
            padding: "14px 18px", marginBottom: 28,
            background: T.sand, border: `1px solid ${T.sandDark}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: T.ink }}>
                Import from your QR menu
              </p>
              <p style={{ fontSize: 11, color: T.mist, marginTop: 2 }}>
                Pre-fills restaurant name and palette
              </p>
            </div>
            <button
              className="btn-ghost"
              style={{ fontSize: 10, padding: "5px 14px", whiteSpace: "nowrap" }}
              onClick={onLoadMenu}
              disabled={loadingMenu}
            >
              {loadingMenu ? "Loading…" : "Load →"}
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label className="field-label">Restaurant name *</label>
            <input
              className="field-input"
              placeholder="e.g. Casa Marina"
              value={info.name}
              onChange={(e) => onChange("name", e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Cuisine type</label>
            <input
              className="field-input"
              placeholder="e.g. Mediterranean tapas"
              value={info.cuisine}
              onChange={(e) => onChange("cuisine", e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">What to feature * — shown in the post image</label>
            <input
              className="field-input"
              placeholder="e.g. Truffle pasta, Sunday brunch, Valentine's menu…"
              value={info.topic}
              onChange={(e) => onChange("topic", e.target.value)}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {TOPIC_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => onChange("topic", s)}
                  style={{
                    fontSize: 10, padding: "4px 10px",
                    background: info.topic === s ? T.terracotta : T.sand,
                    color: info.topic === s ? "#fff" : T.inkLight,
                    border: `1px solid ${info.topic === s ? T.terracotta : T.sandDark}`,
                    cursor: "pointer", letterSpacing: "0.06em",
                    transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">
              Caption context
              <span style={{ fontWeight: 400, color: T.mist, marginLeft: 6, textTransform: "none", letterSpacing: 0 }}>
                (optional · used by AI for captions only, not shown in the image)
              </span>
            </label>
            <textarea
              className="field-input"
              placeholder="e.g. Available this weekend only, 20% off, paired with local wine, gluten-free option…"
              value={info.context}
              onChange={(e) => onChange("context", e.target.value)}
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ marginTop: 32 }}
          onClick={onNext}
          disabled={!info.name.trim() || !info.topic.trim()}
        >
          Continue →
        </button>
      </div>

      {/* Right: preview card */}
      <div style={{
        background: T.sand, border: `1px solid ${T.sandDark}`,
        padding: 40, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
      }}>
        <div style={{
          width: 56, height: 56, background: T.terracotta, borderRadius: 4,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
        }}>
          <span style={{ color: "#fff", fontSize: 24 }}>✦</span>
        </div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: T.ink, marginBottom: 8 }}>
          {info.name || "Your Restaurant"}
        </p>
        <p className="serif" style={{ fontStyle: "italic", color: T.mist, fontSize: 13, marginBottom: 20 }}>
          {info.topic || "Your featured post"}
        </p>
        <div style={{ width: 32, height: 1, background: T.sandDark, margin: "0 auto 16px" }} />
        <p className="tag">AI will write 3 caption options</p>
      </div>
    </div>
  );
}
