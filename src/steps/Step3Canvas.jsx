import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  useStore,
  useCurrentParticipant,
  useCustomComponents,
} from "../state/store";
import {
  COMPONENT_CATALOG,
  GROUP_LABELS,
  GROUP_COLORS,
  findComponent,
} from "../kit/catalog";
import ComponentCard from "../kit/ComponentCard";
import { uid } from "../utils/id";
import { downloadElementPNG } from "../utils/exportUtils";

const CANVAS_WIDTH = 440;
const CANVAS_HEIGHT = 880;
const GRID_X = 55;
const GRID_Y = 55;
const FALLBACK_WIDTH = 220;
const FALLBACK_HEIGHT = 55;
const MIN_ITEM_WIDTH = 110;
const MAX_ITEM_WIDTH = CANVAS_WIDTH;

function snap(val, step) {
  return Math.round(val / step) * step;
}

export default function Step3Canvas() {
  const { dispatch } = useStore();
  const participant = useCurrentParticipant();
  const customs = useCustomComponents();
  const canvasRef = useRef(null);
  const canvasFrameRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [activeDrag, setActiveDrag] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const items = participant?.step3.items ?? [];

  const grouped = useMemo(() => {
    const groups = {};
    for (const c of COMPONENT_CATALOG) {
      (groups[c.group] ??= []).push(c);
    }
    for (const c of customs) {
      (groups[c.group] ??= []).push(c);
    }
    return groups;
  }, [customs]);

  const handleDragStart = (e) => {
    setActiveDrag(e.active.data.current);
  };

  const handleDragEnd = (e) => {
    setActiveDrag(null);
    const { active, over, delta } = e;
    const data = active.data.current;
    if (!data) return;

    const droppedOnCanvas = over?.id === "canvas";

    if (data.type === "palette-item") {
      if (!droppedOnCanvas) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const dragRect = active.rect.current.translated;
      if (!dragRect) return;
      const def = findComponent(data.componentId, customs);
      if (!def) return;
      const w = def.defaultWidth ?? FALLBACK_WIDTH;
      const h = def.defaultHeight ?? FALLBACK_HEIGHT;
      const x = clamp(snap(dragRect.left - canvasRect.left, GRID_X), 0, CANVAS_WIDTH - w);
      const y = clamp(snap(dragRect.top - canvasRect.top, GRID_Y), 0, CANVAS_HEIGHT - h);
      dispatch({
        type: "S3_ADD_ITEM",
        item: {
          id: uid("it"),
          componentId: def.id,
          text: def.defaultText,
          x,
          y,
          w,
          h,
          z: items.length + 1,
        },
      });
      return;
    }

    if (data.type === "canvas-item") {
      const it = items.find((x) => x.id === data.id);
      if (!it) return;
      const w = it.w ?? FALLBACK_WIDTH;
      const h = it.h ?? FALLBACK_HEIGHT;
      const newX = clamp(snap(it.x + delta.x, GRID_X), 0, CANVAS_WIDTH - w);
      const newY = clamp(snap(it.y + delta.y, GRID_Y), 0, CANVAS_HEIGHT - h);
      dispatch({
        type: "S3_UPDATE_ITEM",
        id: it.id,
        patch: { x: newX, y: newY, z: items.length + 1 },
      });
    }
  };

  const handleClearCanvas = () => {
    if (!items.length) return;
    if (!window.confirm("Clear canvas? (캔버스를 비우시겠어요?)")) return;
    items.forEach((it) =>
      dispatch({ type: "S3_REMOVE_ITEM", id: it.id })
    );
  };

  const handleExportPNG = async () => {
    if (!canvasFrameRef.current) return;
    const filename = `mpdt_${participant.id}_canvas_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.png`;
    await downloadElementPNG(filename, canvasFrameRef.current);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid h-full grid-cols-[320px_1fr] gap-4 p-4">
        {/* PALETTE */}
        <aside className="card flex flex-col overflow-hidden">
          <div className="border-b border-ink-100 px-3 py-2.5">
            <div className="text-[13px] font-semibold text-ink-900">
              Component Kit
            </div>
            <div className="text-[11px] text-ink-500">컴포넌트 키트 — 드래그하여 캔버스에 추가</div>
          </div>
          <div className="border-b border-ink-100 p-3">
            <CreateComponentForm
              onCreate={(component) =>
                dispatch({ type: "ADD_CUSTOM_COMPONENT", component })
              }
            />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-5">
            {Object.entries(grouped).map(([groupId, comps]) => {
              const grpColor = GROUP_COLORS[groupId] ?? GROUP_COLORS.custom;
              const grpLabel = GROUP_LABELS[groupId];
              return (
                <div key={groupId}>
                  {/* Group header */}
                  <div
                    className="mb-2 flex items-center gap-1.5 rounded-md px-2 py-1"
                    style={{ background: grpColor.bg }}
                  >
                    <span className="text-[12px]">{grpLabel?.icon ?? "📦"}</span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: grpColor.accent }}
                    >
                      {grpLabel?.en ?? groupId}
                    </span>
                    <span className="text-[10px] text-ink-400">
                      {grpLabel?.ko ?? ""}
                    </span>
                  </div>

                  {/* Widget grid: 2 columns, items span 1 or 2 cols */}
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: "1fr 1fr",
                    }}
                  >
                    {comps.map((c) => {
                      const isCustom = !COMPONENT_CATALOG.some(
                        (x) => x.id === c.id
                      );
                      const span = c.colSpan ?? 1;
                      return (
                        <div
                          key={c.id}
                          style={{
                            gridColumn: span === 2 ? "1 / -1" : "auto",
                          }}
                        >
                          <PaletteDraggable
                            componentId={c.id}
                            removable={isCustom}
                            onRemove={() => {
                              if (
                                window.confirm(
                                  "Remove this custom component? Items on canvases using it will be removed too. (이 컴포넌트를 삭제하시겠어요? 캔버스에 올린 항목도 함께 삭제됩니다.)"
                                )
                              ) {
                                dispatch({
                                  type: "REMOVE_CUSTOM_COMPONENT",
                                  id: c.id,
                                });
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* CANVAS */}
        <section className="flex flex-col items-center justify-start overflow-auto py-4">
          <div
            className="mb-3 flex items-center justify-between gap-2"
            style={{ width: CANVAS_WIDTH + 24 }}
          >
            <div>
              <div className="text-[13px] font-semibold text-ink-900">
                Ideal Screen Canvas
              </div>
              <div className="text-[11px] text-ink-500">
                이상적인 화면 — 드래그해서 배치, 더블클릭으로 수정, 우하단 모서리로 크기 조절
              </div>
            </div>
            <div className="flex gap-1">
              <button className="btn-ghost" onClick={handleClearCanvas}>
                Clear
              </button>
              <button className="btn-primary" onClick={handleExportPNG}>
                Save PNG
              </button>
            </div>
          </div>

          <div
            ref={canvasFrameRef}
            className="rounded-[28px] border border-ink-100 bg-white p-3 shadow-card"
            style={{ width: CANVAS_WIDTH + 24 }}
          >
            <div className="mb-2 flex items-center justify-between px-2 text-[10px] text-ink-500">
              <span>{participant.id}</span>
              <span className="tabular-nums">9:41</span>
              <span>● ● ●</span>
            </div>
            <CanvasDroppable canvasRef={canvasRef}>
              {items.map((it) => (
                <CanvasItem
                  key={it.id}
                  item={it}
                  def={findComponent(it.componentId, customs)}
                  editing={editingId === it.id}
                  onStartEdit={() => setEditingId(it.id)}
                  onEndEdit={() => setEditingId(null)}
                  onTextChange={(text) =>
                    dispatch({
                      type: "S3_UPDATE_ITEM",
                      id: it.id,
                      patch: { text },
                    })
                  }
                  onResizeCommit={(w, h) =>
                    dispatch({
                      type: "S3_UPDATE_ITEM",
                      id: it.id,
                      patch: { w, h },
                    })
                  }
                  onRemove={() =>
                    dispatch({ type: "S3_REMOVE_ITEM", id: it.id })
                  }
                />
              ))}
              {items.length === 0 && (
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <div className="text-[28px] mb-2 opacity-30">📱</div>
                    <div className="text-[12px] text-ink-300">
                      Drag components here
                      <br />
                      여기로 드래그
                    </div>
                  </div>
                </div>
              )}
            </CanvasDroppable>
          </div>
        </section>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag?.type === "palette-item" && (
          <div
            style={{
              width:
                findComponent(activeDrag.componentId, customs)?.defaultWidth ??
                FALLBACK_WIDTH,
              opacity: 0.9,
            }}
          >
            <ComponentCard
              componentId={activeDrag.componentId}
              variant="canvas"
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function PaletteDraggable({ componentId, removable, onRemove }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${componentId}`,
    data: { type: "palette-item", componentId },
  });
  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.4 : 1, cursor: "grab" }}
      className="group/pal relative"
    >
      <div {...listeners} {...attributes}>
        <ComponentCard componentId={componentId} variant="palette" />
      </div>
      {removable && (
        <button
          onClick={onRemove}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full border border-ink-100 bg-white text-[12px] text-ink-500 shadow-card group-hover/pal:flex hover:text-ink-900"
          title="Delete custom component (사용자 컴포넌트 삭제)"
        >
          ×
        </button>
      )}
    </div>
  );
}

function CreateComponentForm({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [labelEn, setLabelEn] = useState("");
  const [labelKo, setLabelKo] = useState("");
  const [defaultText, setDefaultText] = useState("");

  const reset = () => {
    setLabelEn("");
    setLabelKo("");
    setDefaultText("");
    setOpen(false);
  };

  const handleSave = () => {
    const en = labelEn.trim();
    if (!en) return;
    onCreate({
      id: uid("custom"),
      label: en,
      labelKo: labelKo.trim() || en,
      group: "custom",
      icon: "✏️",
      defaultText: defaultText.trim(),
      defaultWidth: 220,
      defaultHeight: 110,
      colSpan: 2,
      rowSpan: 1,
    });
    reset();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-ink-100 py-2 text-[12px] text-ink-500 hover:border-accent hover:text-accent"
      >
        + Create new component (직접 만들기)
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-ink-100 bg-ink-50/40 p-2.5">
      <div className="text-[11px] font-semibold text-ink-900">
        New component <span className="font-normal text-ink-500">새 컴포넌트</span>
      </div>
      <input
        autoFocus
        className="input !text-[12px]"
        placeholder="Label EN (e.g. Owner Reply)"
        value={labelEn}
        onChange={(e) => setLabelEn(e.target.value)}
      />
      <input
        className="input !text-[12px]"
        placeholder="라벨 한국어 (예: 사장님 답변)"
        value={labelKo}
        onChange={(e) => setLabelKo(e.target.value)}
      />
      <textarea
        className="input min-h-[44px] resize-none !text-[12px]"
        placeholder="Default text (선택)"
        value={defaultText}
        onChange={(e) => setDefaultText(e.target.value)}
      />
      <div className="flex justify-end gap-1.5">
        <button className="btn-ghost !py-1 !text-[12px]" onClick={reset}>
          Cancel
        </button>
        <button
          className="btn-primary !py-1 !text-[12px]"
          onClick={handleSave}
          disabled={!labelEn.trim()}
        >
          Add (추가)
        </button>
      </div>
    </div>
  );
}

function CanvasDroppable({ canvasRef, children }) {
  const { setNodeRef } = useDroppable({ id: "canvas" });
  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        if (canvasRef) canvasRef.current = el;
      }}
      className="relative overflow-hidden rounded-[16px] bg-ink-50/40"
      style={{ 
        width: CANVAS_WIDTH, 
        height: CANVAS_HEIGHT,
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_X}px ${GRID_Y}px`,
      }}
    >
      {children}
    </div>
  );
}

function CanvasItem({
  item,
  def,
  editing,
  onStartEdit,
  onEndEdit,
  onTextChange,
  onResizeCommit,
  onRemove,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `canvas-${item.id}`,
      data: { type: "canvas-item", id: item.id },
      disabled: editing,
    });

  const baseW = item.w ?? def?.defaultWidth ?? FALLBACK_WIDTH;
  const baseH = item.h ?? def?.defaultHeight ?? FALLBACK_HEIGHT;
  const [draftW, setDraftW] = useState(null); 
  const [draftH, setDraftH] = useState(null); 
  const isResizing = draftW != null || draftH != null;
  const displayedW = draftW ?? baseW;
  const displayedH = draftH ?? baseH;

  const handleResizePointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = baseW;
    const startH = baseH;
    let lastW = startW;
    let lastH = startH;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const maxAllowedW = Math.min(MAX_ITEM_WIDTH, CANVAS_WIDTH - item.x);
      const maxAllowedH = Math.min(CANVAS_HEIGHT, CANVAS_HEIGHT - item.y);
      lastW = clamp(snap(startW + dx, GRID_X), MIN_ITEM_WIDTH, maxAllowedW);
      lastH = clamp(snap(startH + dy, GRID_Y), GRID_Y, maxAllowedH);
      setDraftW(lastW);
      setDraftH(lastH);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      onResizeCommit?.(lastW, lastH);
      setDraftW(null);
      setDraftH(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Cleanup safety: if the component unmounts mid-resize, drop our listeners.
  useEffect(() => {
    return () => { setDraftW(null); setDraftH(null); };
  }, []);

  const style = {
    position: "absolute",
    left: item.x,
    top: item.y,
    width: displayedW,
    height: displayedH,
    transform:
      transform && !isResizing
        ? `translate3d(${snap(transform.x, GRID_X)}px, ${snap(transform.y, GRID_Y)}px, 0)`
        : undefined,
    zIndex: isDragging || isResizing ? 50 : item.z ?? 1,
    transition: isDragging ? "none" : "transform 0.1s ease-out, left 0.2s ease-out, top 0.2s ease-out",
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div
        {...(!editing && !isResizing ? listeners : {})}
        {...(!editing && !isResizing ? attributes : {})}
        style={{ cursor: editing ? "text" : isResizing ? "ew-resize" : "grab" }}
      >
        <ComponentCard
          componentId={item.componentId}
          text={item.text}
          variant="canvas"
          editing={editing}
          onStartEdit={onStartEdit}
          onEndEdit={onEndEdit}
          onTextChange={onTextChange}
          h={displayedH}
        />
      </div>

      {!editing && (
        <div
          onPointerDown={handleResizePointerDown}
          className="absolute -bottom-1 -right-1 hidden h-4 w-4 cursor-nwse-resize items-center justify-center rounded-sm border border-ink-100 bg-white text-[9px] text-ink-500 shadow-card group-hover:flex hover:text-ink-900"
          title="Drag to resize (크기 조절)"
        >
          ↘
        </div>
      )}

      {!editing && (
        <button
          className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full border border-ink-100 bg-white text-[12px] text-ink-500 shadow-card group-hover:flex hover:text-ink-900"
          onClick={onRemove}
          onPointerDown={(e) => e.stopPropagation()}
          title="Delete (삭제)"
        >
          ×
        </button>
      )}

      {/* Width/Height indicator while resizing */}
      {isResizing && (
        <div className="pointer-events-none absolute -bottom-5 right-0 rounded bg-ink-900 px-1.5 py-0.5 text-[10px] tabular-nums text-white whitespace-nowrap">
          {Math.round(displayedW)} x {Math.round(displayedH)}
        </div>
      )}
    </div>
  );
}
