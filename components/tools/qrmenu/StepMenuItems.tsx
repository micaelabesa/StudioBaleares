import { T } from "@/lib/constants";
import type { MenuCategory, MenuItem } from "@/lib/types";

interface StepMenuItemsProps {
  categories: MenuCategory[];
  activePrimary: string;
  onAddCategory: () => void;
  onUpdateCategoryName: (ci: number, val: string) => void;
  onAddItem: (ci: number) => void;
  onRemoveItem: (ci: number, ii: number) => void;
  onUpdateItem: (ci: number, ii: number, field: keyof MenuItem, val: string) => void;
  hasItems: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function StepMenuItems({
  categories, activePrimary,
  onAddCategory, onUpdateCategoryName,
  onAddItem, onRemoveItem, onUpdateItem,
  hasItems, onBack, onNext,
}: StepMenuItemsProps) {
  return (
    <div className="fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
        <div>
          <h3 style={{ fontSize: 22, marginBottom: 6 }}>Add your menu items</h3>
          <p style={{ color: T.mist, fontSize: 14 }}>
            Add categories and items. AI will enhance your descriptions.
          </p>
        </div>
        <button className="btn-ghost" onClick={onAddCategory}>+ Category</button>
      </div>

      {categories.map((cat, ci) => (
        <div key={ci} style={{ marginBottom: 44 }}>
          {/* Category name */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{ width: 3, height: 22, background: activePrimary, flexShrink: 0 }} />
            <input
              value={cat.category}
              onChange={(e) => onUpdateCategoryName(ci, e.target.value)}
              style={{
                fontFamily: "'Playfair Display', serif", fontSize: 19, color: T.ink,
                border: "none", borderBottom: `1px solid ${T.sandDark}`,
                background: "transparent", outline: "none", padding: "3px 0", flex: 1,
              }}
            />
          </div>

          {/* Items */}
          {cat.items.map((item, ii) => (
            <div key={ii} style={{
              display: "grid", gridTemplateColumns: "1fr 2fr 90px 32px",
              gap: 10, marginBottom: 10, padding: 14,
              background: T.white, border: `1px solid ${T.sandDark}`,
            }}>
              <input
                className="field-input"
                style={{ background: "transparent", border: "none", borderBottom: `1px solid ${T.sandDark}`, padding: "6px 0" }}
                placeholder="Item name"
                value={item.name}
                onChange={(e) => onUpdateItem(ci, ii, "name", e.target.value)}
              />
              <input
                className="field-input"
                style={{ background: "transparent", border: "none", borderBottom: `1px solid ${T.sandDark}`, padding: "6px 0" }}
                placeholder="Description (AI will improve)"
                value={item.desc}
                onChange={(e) => onUpdateItem(ci, ii, "desc", e.target.value)}
              />
              <input
                className="field-input"
                style={{ background: "transparent", border: "none", borderBottom: `1px solid ${T.sandDark}`, padding: "6px 0" }}
                placeholder="€0.00"
                value={item.price}
                onChange={(e) => onUpdateItem(ci, ii, "price", e.target.value)}
              />
              <button
                onClick={() => onRemoveItem(ci, ii)}
                style={{ color: T.mist, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ×
              </button>
            </div>
          ))}

          <button
            className="btn-ghost"
            style={{ fontSize: 10, padding: "5px 14px", marginTop: 6 }}
            onClick={() => onAddItem(ci)}
          >
            + Add item
          </button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 14, marginTop: 40 }}>
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={onNext} disabled={!hasItems}>
          Continue to Style →
        </button>
      </div>
    </div>
  );
}
