import { findComponent } from "./catalog";
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
  const visual = renderVisual(def, body);

  if (variant === "palette") {
    return (
      <div className="group select-none rounded-card border border-ink-100 bg-white p-2.5 shadow-card transition hover:border-accent hover:shadow-cardHover">
        <div className="text-[11px] font-semibold leading-tight text-ink-900">
          {def.label}
        </div>
        <div className="mb-1.5 text-[10px] leading-tight text-ink-500">
          {def.labelKo}
        </div>
        <div className="rounded-md bg-ink-50 px-2 py-1.5 text-[11px] leading-snug text-ink-700">
          {visual}
        </div>
      </div>
    );
  }

  // canvas / preview
  const compact = variant === "preview";
  return (
    <div
      className={`select-none rounded-card border border-ink-100 bg-white shadow-card ${
        compact ? "p-2" : "p-3"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className={compact ? "text-[10px]" : "text-[11px]"}>
          <span className="font-semibold text-ink-900">{def.label}</span>
          <span className="ml-1 text-ink-500">{def.labelKo}</span>
        </div>
      </div>
      <EditableBody
        def={def}
        body={body}
        compact={compact}
        editable={variant === "canvas"}
        editing={editing}
        onTextChange={onTextChange}
        onStartEdit={onStartEdit}
        onEndEdit={onEndEdit}
      />
    </div>
  );
}

function EditableBody({
  def,
  body,
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
        className="mt-1.5 w-full resize-none rounded-md border border-accent bg-white px-2 py-1.5 text-[12px] leading-snug text-ink-900 outline-none focus:ring-2 focus:ring-accent/30"
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
      className={`mt-1.5 rounded-md bg-ink-50 ${
        compact ? "px-2 py-1.5 text-[10px]" : "px-2.5 py-2 text-[12px]"
      } leading-snug text-ink-700`}
      onDoubleClick={() => editable && onStartEdit?.()}
      title={editable ? "Double-click to edit (더블클릭하여 수정)" : undefined}
    >
      {visual}
    </div>
  );
}

// Distinct mini-visuals for some component types so the canvas feels rich,
// but still minimal/lo-fi enough to invite participation.
function renderVisual(def, body) {
  if (def.id === "rating-reviews") {
    return <span className="tabular-nums">{body}</span>;
  }
  if (def.id === "mood-photo") {
    return (
      <div className="flex items-center gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-gradient-to-br from-ink-100 to-ink-50 text-[14px]">
          ✦
        </div>
        <span>{body}</span>
      </div>
    );
  }
  if (def.id === "friend-visit") {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex -space-x-1.5">
          <span className="h-4 w-4 rounded-full border border-white bg-accent" />
          <span className="h-4 w-4 rounded-full border border-white bg-ink-300" />
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
            className="rounded-full border border-ink-100 bg-white px-1.5 py-0.5 text-[10px] text-ink-700"
          >
            {c}
          </span>
        ))}
      </div>
    );
  }
  if (def.id === "price") {
    return <span className="tabular-nums">{body}</span>;
  }
  if (def.id === "blank-text" && !body) {
    return <span className="italic text-ink-300">Type your idea… (직접 입력)</span>;
  }
  return <span>{body}</span>;
}
