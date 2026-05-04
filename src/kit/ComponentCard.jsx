import { findComponent, GROUP_COLORS } from "./catalog";
import { useCustomComponents } from "../state/store";

// A unified visual representation of a kit component.
// Used both in the palette (compact) and on the canvas (with editable text).
//
// Variants:
//   - "palette" : compact tile with EN + KR + small body
//   - "canvas"  : larger tile, body editable on double-click
//   - "preview" : read-only, used in compare grid

export default function ComponentCard({
  componentId,
  text,
  variant = "palette",
  onTextChange,
  editing,
  onStartEdit,
  onEndEdit,
}) {
  const customs = useCustomComponents();
  const def = findComponent(componentId, customs);
  if (!def) return null;

  const body = text ?? def.defaultText;
  const colors = GROUP_COLORS[def.group] ?? GROUP_COLORS.custom;

  if (variant === "palette") {
    return <PaletteCard def={def} body={body} colors={colors} />;
  }

  // canvas / preview
  const compact = variant === "preview";
  return (
    <CanvasCard
      def={def}
      body={body}
      colors={colors}
      compact={compact}
      editable={variant === "canvas"}
      editing={editing}
      onStartEdit={onStartEdit}
      onEndEdit={onEndEdit}
      onTextChange={onTextChange}
    />
  );
}

/* ─── Palette card (left sidebar) ─────────────────────────────────────────── */
function PaletteCard({ def, body, colors }) {
  const visual = renderVisual(def, body);

  return (
    <div
      className="group select-none overflow-hidden rounded-card transition hover:shadow-cardHover"
      style={{
        background: colors.gradient,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Header strip */}
      <div className="flex items-center gap-2 px-2.5 py-2">
        <span
          className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md text-[13px]"
          style={{ background: colors.bg }}
        >
          {def.icon ?? "📦"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-semibold leading-tight text-ink-900">
            {def.label}
          </div>
          <div className="truncate text-[10px] leading-tight text-ink-500">
            {def.labelKo}
          </div>
        </div>
      </div>

      {/* Body preview */}
      <div
        className="mx-2 mb-2 rounded-md px-2 py-1.5 text-[11px] leading-snug text-ink-700"
        style={{ background: "rgba(255,255,255,0.7)" }}
      >
        {visual}
      </div>
    </div>
  );
}

/* ─── Canvas / Preview card ───────────────────────────────────────────────── */
function CanvasCard({
  def,
  body,
  colors,
  compact,
  editable,
  editing,
  onStartEdit,
  onEndEdit,
  onTextChange,
}) {
  return (
    <div
      className="select-none overflow-hidden rounded-card shadow-card"
      style={{
        background: "#fff",
        border: `1.5px solid ${colors.border}`,
        borderLeft: `4px solid ${colors.accent}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-2.5 py-1.5"
        style={{ background: colors.light }}
      >
        <span
          className="grid h-5 w-5 flex-shrink-0 place-items-center rounded text-[11px]"
          style={{ background: colors.bg }}
        >
          {def.icon ?? "📦"}
        </span>
        <div className={compact ? "text-[10px]" : "text-[11px]"}>
          <span className="font-semibold text-ink-900">{def.label}</span>
          <span className="ml-1 text-ink-500">{def.labelKo}</span>
        </div>
      </div>

      {/* Body */}
      <EditableBody
        def={def}
        body={body}
        colors={colors}
        compact={compact}
        editable={editable}
        editing={editing}
        onTextChange={onTextChange}
        onStartEdit={onStartEdit}
        onEndEdit={onEndEdit}
      />
    </div>
  );
}

/* ─── Editable body area ──────────────────────────────────────────────────── */
function EditableBody({
  def,
  body,
  colors,
  compact,
  editable,
  editing,
  onTextChange,
  onStartEdit,
  onEndEdit,
}) {
  const visual = renderVisual(def, body);

  if (editable && editing) {
    return (
      <textarea
        autoFocus
        defaultValue={body}
        rows={2}
        className="w-full resize-none border-t px-2.5 py-2 text-[12px] leading-snug text-ink-900 outline-none"
        style={{ borderColor: colors.border }}
        onBlur={(e) => {
          onTextChange?.(e.target.value);
          onEndEdit?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            onTextChange?.(e.currentTarget.value);
            onEndEdit?.();
          }
          if (e.key === "Escape") {
            onEndEdit?.();
          }
        }}
      />
    );
  }

  return (
    <div
      className={`${
        compact ? "px-2 py-1.5 text-[10px]" : "px-2.5 py-2 text-[12px]"
      } leading-snug text-ink-700`}
      onDoubleClick={() => editable && onStartEdit?.()}
      title={editable ? "Double-click to edit (더블클릭하여 수정)" : undefined}
      style={{ cursor: editable ? "default" : undefined }}
    >
      {visual}
    </div>
  );
}

/* ─── Distinct mini-visuals per component type ────────────────────────────── */
function renderVisual(def, body) {
  if (def.id === "rating-reviews") {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} style={{ color: "#f59e0b", fontSize: "12px" }}>
              ★
            </span>
          ))}
          <span style={{ color: "#d1d5db", fontSize: "12px" }}>★</span>
        </div>
        <span className="tabular-nums text-ink-700">{body}</span>
      </div>
    );
  }

  if (def.id === "mood-photo") {
    return (
      <div className="flex items-center gap-2.5">
        <div
          className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-lg text-[18px]"
          style={{
            background:
              "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)",
            border: "1px solid rgba(236,72,153,0.15)",
          }}
        >
          📸
        </div>
        <span>{body}</span>
      </div>
    );
  }

  if (def.id === "friend-visit") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5">
          <span
            className="inline-block h-5 w-5 rounded-full border-2 border-white"
            style={{ background: "#22c55e" }}
          />
          <span
            className="inline-block h-5 w-5 rounded-full border-2 border-white"
            style={{ background: "#6366f1" }}
          />
          <span
            className="inline-block h-5 w-5 rounded-full border-2 border-white"
            style={{ background: "#f59e0b" }}
          />
        </div>
        <span>{body}</span>
      </div>
    );
  }

  if (def.id === "mood-tag") {
    const chips = String(body)
      .split("·")
      .map((c) => c.trim())
      .filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1">
        {chips.map((c, i) => (
          <span
            key={i}
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              background: "rgba(236,72,153,0.1)",
              color: "#be185d",
              border: "1px solid rgba(236,72,153,0.2)",
            }}
          >
            {c}
          </span>
        ))}
      </div>
    );
  }

  if (def.id === "verified") {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className="grid h-4 w-4 place-items-center rounded-full text-[10px]"
          style={{ background: "#6366f1", color: "white" }}
        >
          ✓
        </span>
        <span className="font-medium" style={{ color: "#6366f1" }}>
          {body}
        </span>
      </div>
    );
  }

  if (def.id === "trending") {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 animate-pulse rounded-full"
          style={{ background: "#ef4444" }}
        />
        <span className="font-medium">{body}</span>
      </div>
    );
  }

  if (def.id === "price") {
    return (
      <span className="tabular-nums font-semibold" style={{ color: "#f59e0b" }}>
        {body}
      </span>
    );
  }

  if (def.id === "distance") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[12px]">📍</span>
        <span className="tabular-nums">{body}</span>
      </div>
    );
  }

  if (def.id === "waiting") {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: "#22c55e" }}
        />
        <span>{body}</span>
      </div>
    );
  }

  if (def.id === "saved-by-friends") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[12px]">🔖</span>
        <span>{body}</span>
      </div>
    );
  }

  if (def.id === "menu") {
    return (
      <div className="flex items-center gap-2">
        <span
          className="grid h-6 w-6 flex-shrink-0 place-items-center rounded text-[12px]"
          style={{ background: "rgba(245,158,11,0.12)" }}
        >
          🍽️
        </span>
        <span>{body}</span>
      </div>
    );
  }

  if (def.id === "blank-text" && !body) {
    return (
      <span className="italic text-ink-300">Type your idea… (직접 입력)</span>
    );
  }

  return <span>{body}</span>;
}
