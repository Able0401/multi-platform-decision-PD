import { useEffect, useMemo, useRef, useState } from "react";
import { useStore, useCustomComponents } from "../state/store";
import { uid } from "../utils/id";
import ComponentCard from "../kit/ComponentCard";
import { downloadElementPNG } from "../utils/exportUtils";
import { findComponent } from "../kit/catalog";

export default function Step4Discussion() {
  const { state, dispatch } = useStore();
  const gridRef = useRef(null);

  const currentId = state.currentParticipantId;
  const participantIds = Object.keys(state.participants);

  const [discussionInput, setDiscussionInput] = useState("");

  // Aggregate discussion comments across all participants
  const allDiscussions = useMemo(() => {
    const items = [];
    for (const pid of participantIds) {
      const discussions =
        state.participants[pid]?.step4?.discussions ?? [];
      for (const d of discussions) {
        items.push({ ...d, authorId: pid });
      }
    }
    // Sort by time
    items.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return items;
  }, [state.participants, participantIds]);

  const addDiscussion = (targetParticipantId, text) => {
    if (!currentId || !text.trim()) return;
    dispatch({
      type: "S4_ADD_DISCUSSION",
      discussion: {
        id: uid("disc"),
        targetParticipantId,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      },
    });
  };

  const removeDiscussion = (id) => {
    dispatch({ type: "S4_REMOVE_DISCUSSION", id });
  };

  const handleExportPNG = async () => {
    if (!gridRef.current) return;
    const filename = `mpdt_discussion_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.png`;
    await downloadElementPNG(filename, gridRef.current);
  };

  if (participantIds.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="card max-w-md p-6 text-center text-[13px] text-ink-500">
          No participants yet. (참여자가 없습니다.)
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <section className="flex flex-col overflow-hidden">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[13px] font-semibold text-ink-900">
              Discussion
            </div>
            <div className="text-[11px] text-ink-500">
              논의 — 다른 참여자의 캔버스에 의견을 남겨주세요
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md bg-ink-50 px-2.5 py-1">
              <span className="text-[11px] text-ink-500">Viewing as</span>
              <span className="rounded-full bg-ink-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                {currentId}
              </span>
            </div>
            <button className="btn-ghost" onClick={handleExportPNG}>
              Save PNG
            </button>
          </div>
        </div>

        <div
          ref={gridRef}
          className="flex-1 overflow-auto rounded-card border border-ink-100 bg-white p-4"
        >
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {participantIds.map((pid) => (
              <ParticipantCanvasCard
                key={pid}
                participant={state.participants[pid]}
                currentUserId={currentId}
                allDiscussions={allDiscussions}
                onAddDiscussion={(text) => addDiscussion(pid, text)}
                onRemoveDiscussion={removeDiscussion}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ParticipantCanvasCard({
  participant,
  currentUserId,
  allDiscussions,
  onAddDiscussion,
  onRemoveDiscussion,
}) {
  const items = participant.step3.items;
  const isCurrentUser = participant.id === currentUserId;
  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState("");

  // Discussions targeting this participant
  const discussions = allDiscussions.filter(
    (d) => d.targetParticipantId === participant.id
  );

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAddDiscussion(text);
    setText("");
    setShowInput(false);
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-ink-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {participant.id}
          </span>
          {isCurrentUser && (
            <span className="text-[10px] text-accent">you (나)</span>
          )}
        </div>
        <button
          onClick={() => setShowInput(!showInput)}
          className="flex items-center gap-1 rounded-full border border-ink-100 bg-white px-2 py-0.5 text-[10px] font-semibold text-ink-500 hover:border-accent hover:text-accent transition"
          title="Add discussion (의견 추가)"
        >
          💬 의견
        </button>
      </div>

      {items.length === 0 ? (
        <div className="grid h-32 place-items-center text-[11px] text-ink-300">
          (empty canvas)
        </div>
      ) : (
        <MiniCanvas items={items} />
      )}

      {/* Discussion input */}
      {showInput && (
        <div className="border-t border-ink-100 p-2.5">
          <textarea
            autoFocus
            className="input min-h-[48px] resize-none !text-[11px]"
            placeholder="의견을 남겨주세요... (Leave your comment...)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <div className="mt-1.5 flex justify-end gap-1">
            <button
              className="btn-ghost !py-0.5 !text-[10px]"
              onClick={() => {
                setShowInput(false);
                setText("");
              }}
            >
              Cancel
            </button>
            <button
              className="btn-primary !py-0.5 !text-[10px]"
              onClick={handleSubmit}
              disabled={!text.trim()}
            >
              Post (등록)
            </button>
          </div>
        </div>
      )}

      {/* Discussion comments for this canvas */}
      {discussions.length > 0 && (
        <div className="border-t border-ink-100 bg-ink-50/30 p-2 space-y-1.5">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-ink-400 px-0.5">
            💬 {discussions.length} comments
          </div>
          {discussions.map((d) => (
            <div
              key={d.id}
              className="group/comment relative rounded-md bg-white border border-ink-100 px-2 py-1.5"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-semibold text-ink-700">
                  {d.authorId}
                </span>
                <span className="text-[8px] text-ink-300 tabular-nums">
                  {new Date(d.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="text-[10px] text-ink-700 whitespace-pre-wrap break-words">
                {d.text}
              </div>
              {d.authorId === currentUserId && (
                <button
                  onClick={() => onRemoveDiscussion(d.id)}
                  className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full border border-ink-100 bg-white text-[9px] text-ink-400 shadow-card group-hover/comment:flex hover:text-ink-900"
                  title="Delete comment (삭제)"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Scaled-down exact replica of the original canvas ────────────────────── */

const CANVAS_WIDTH = 440;
const CANVAS_HEIGHT = 880;
const FALLBACK_WIDTH = 220;
const FALLBACK_HEIGHT = 55;

function MiniCanvas({ items }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const customs = useCustomComponents();

  // Observe the container width to calculate scale factor
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const scale = containerWidth > 0 ? containerWidth / CANVAS_WIDTH : 0.5;
  const scaledHeight = CANVAS_HEIGHT * scale;

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden bg-ink-50/40"
      style={{ height: scaledHeight }}
    >
      <div
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "relative",
        }}
      >
        {items.map((it) => {
          const def = findComponent(it.componentId, customs);
          const w = it.w ?? def?.defaultWidth ?? FALLBACK_WIDTH;
          const h = it.h ?? def?.defaultHeight ?? FALLBACK_HEIGHT;
          return (
            <div
              key={it.id}
              style={{
                position: "absolute",
                left: `${it.x}px`,
                top: `${it.y}px`,
                width: `${w}px`,
                height: `${h}px`,
                zIndex: it.z ?? 1,
              }}
            >
              <ComponentCard
                componentId={it.componentId}
                text={it.text}
                variant="preview"
                h={h}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
