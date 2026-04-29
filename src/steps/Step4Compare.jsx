import { useMemo, useRef } from "react";
import { useStore } from "../state/store";
import { uid } from "../utils/id";
import ComponentCard from "../kit/ComponentCard";
import { downloadElementPNG } from "../utils/exportUtils";
import { findComponent } from "../kit/catalog";

// Sentinel used as targetItemId when the sticker is for the canvas/UI as a whole,
// not a specific component on it.
export const CANVAS_STICKER_TARGET = "__canvas__";

export default function Step4Compare() {
  const { state, dispatch } = useStore();
  const gridRef = useRef(null);

  const voterId = state.currentParticipantId;
  const voter = voterId ? state.participants[voterId] : null;
  const participantIds = Object.keys(state.participants);

  const placedByVoter = voter?.step4.stickers ?? [];
  const placedCount = placedByVoter.length;

  // Aggregate sticker counts across all voters: { "<participantId>:<itemId|__canvas__>": [voterId,...] }
  const stickerMap = useMemo(() => {
    const map = {};
    for (const pid of participantIds) {
      const stickers = state.participants[pid]?.step4?.stickers ?? [];
      for (const s of stickers) {
        const key = `${s.targetParticipantId}:${s.targetItemId}`;
        (map[key] ??= []).push(pid);
      }
    }
    return map;
  }, [state.participants, participantIds]);

  // Component-level rollup: total sticker counts per componentId across all canvases
  const componentRollup = useMemo(() => {
    const counts = {};
    for (const pid of participantIds) {
      const items = state.participants[pid]?.step3?.items ?? [];
      for (const it of items) {
        const cnt = (stickerMap[`${pid}:${it.id}`] ?? []).length;
        if (cnt > 0) {
          counts[it.componentId] = (counts[it.componentId] ?? 0) + cnt;
        }
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [participantIds, state.participants, stickerMap]);

  // Canvas-level (UI as a whole) rollup
  const canvasRollup = useMemo(() => {
    const entries = [];
    for (const pid of participantIds) {
      const cnt = (stickerMap[`${pid}:${CANVAS_STICKER_TARGET}`] ?? []).length;
      if (cnt > 0) entries.push([pid, cnt]);
    }
    return entries.sort((a, b) => b[1] - a[1]);
  }, [participantIds, stickerMap]);

  const toggleSticker = (targetParticipantId, targetItemId) => {
    if (!voterId) return;
    const existing = placedByVoter.find(
      (s) =>
        s.targetParticipantId === targetParticipantId &&
        s.targetItemId === targetItemId
    );
    if (existing) {
      dispatch({ type: "S4_REMOVE_STICKER", id: existing.id });
      return;
    }
    dispatch({
      type: "S4_ADD_STICKER",
      sticker: {
        id: uid("st"),
        targetParticipantId,
        targetItemId,
      },
    });
  };

  const handleExportPNG = async () => {
    if (!gridRef.current) return;
    const filename = `mpdt_compare_${new Date()
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
    <div className="grid h-full grid-cols-[1fr_300px] gap-4 p-4">
      <section className="flex flex-col overflow-hidden">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[13px] font-semibold text-ink-900">
              Compare & Vote
            </div>
            <div className="text-[11px] text-ink-500">
              비교·투표 — Click a component or the whole UI to place a sticker
              (컴포넌트 또는 전체 UI에 스티커 부착)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <VoterPicker
              voterId={voterId}
              participantIds={participantIds}
              onChange={(id) =>
                dispatch({ type: "SELECT_PARTICIPANT", id })
              }
            />
            <StickerCounter placed={placedCount} />
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
                stickerMap={stickerMap}
                voterId={voterId}
                onToggleSticker={toggleSticker}
              />
            ))}
          </div>
        </div>
      </section>

      <aside className="card flex flex-col overflow-hidden">
        <div className="border-b border-ink-100 px-3 py-2.5">
          <div className="text-[13px] font-semibold text-ink-900">
            Top components
          </div>
          <div className="text-[11px] text-ink-500">
            가장 많이 선택된 요소
          </div>
        </div>
        <div className="overflow-y-auto p-3 space-y-1.5">
          {componentRollup.length === 0 && (
            <div className="text-[12px] text-ink-300">
              No stickers placed yet.
              <br />
              아직 스티커가 없어요.
            </div>
          )}
          {componentRollup.map(([cid, n], i) => {
            const def = findComponent(cid);
            return (
              <div
                key={cid}
                className="flex items-center justify-between rounded-md border border-ink-100 px-2.5 py-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-ink-50 text-[10px] font-bold text-ink-500">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-[12px] font-medium text-ink-900">
                      {def?.label ?? cid}
                    </div>
                    <div className="text-[10px] text-ink-500">
                      {def?.labelKo}
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-sticker/30 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-900">
                  {n}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-2 border-t border-ink-100 px-3 py-2.5">
          <div className="text-[13px] font-semibold text-ink-900">
            Top UIs (whole canvas)
          </div>
          <div className="text-[11px] text-ink-500">
            전체 UI 인기 순
          </div>
        </div>
        <div className="overflow-y-auto p-3 space-y-1.5">
          {canvasRollup.length === 0 && (
            <div className="text-[12px] text-ink-300">
              No UI stickers yet.
              <br />
              아직 UI 스티커가 없어요.
            </div>
          )}
          {canvasRollup.map(([pid, n], i) => (
            <div
              key={pid}
              className="flex items-center justify-between rounded-md border border-ink-100 px-2.5 py-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-ink-50 text-[10px] font-bold text-ink-500">
                  {i + 1}
                </span>
                <div className="text-[12px] font-medium text-ink-900 truncate">
                  {pid}
                </div>
              </div>
              <span className="rounded-full bg-sticker/30 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-900">
                ★ {n}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function VoterPicker({ voterId, participantIds, onChange }) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="label-bi-sub">Voter (투표자)</span>
      <select
        className="input !w-auto !py-1 !text-[12px]"
        value={voterId ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {participantIds.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
    </label>
  );
}

function StickerCounter({ placed }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-ink-50 px-2.5 py-1">
      <span className="text-[11px] text-ink-500">Stickers placed</span>
      <span className="rounded-full bg-sticker/40 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-900">
        ★ {placed}
      </span>
    </div>
  );
}

function ParticipantCanvasCard({
  participant,
  stickerMap,
  voterId,
  onToggleSticker,
}) {
  const items = participant.step3.items;
  const isCurrentVoter = participant.id === voterId;

  const canvasVoters =
    stickerMap[`${participant.id}:${CANVAS_STICKER_TARGET}`] ?? [];
  const youPlacedCanvas = canvasVoters.includes(voterId);

  return (
    <div className="card overflow-hidden">
      <div
        className={`flex items-center justify-between border-b border-ink-100 px-3 py-2 ${
          youPlacedCanvas ? "bg-sticker/20" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="rounded bg-ink-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {participant.id}
          </span>
          {isCurrentVoter && (
            <span className="text-[10px] text-accent">you (투표자)</span>
          )}
        </div>
        <button
          onClick={() =>
            onToggleSticker(participant.id, CANVAS_STICKER_TARGET)
          }
          title="Sticker the whole UI (전체 UI에 스티커)"
          className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold transition ${
            youPlacedCanvas
              ? "border-ink-900 bg-sticker text-ink-900"
              : "border-ink-100 bg-white text-ink-500 hover:border-ink-300 hover:text-ink-900"
          }`}
        >
          ★ overall
          {canvasVoters.length > 0 && (
            <span className="ml-0.5 rounded-full bg-ink-900 px-1.5 py-px text-[9px] tabular-nums text-white">
              {canvasVoters.length}
            </span>
          )}
        </button>
      </div>
      {items.length === 0 ? (
        <div className="grid h-32 place-items-center text-[11px] text-ink-300">
          (empty canvas)
        </div>
      ) : (
        <div className="space-y-2 p-2.5">
          {items.map((it) => {
            const stickerVoters =
              stickerMap[`${participant.id}:${it.id}`] ?? [];
            const youPlaced = stickerVoters.includes(voterId);
            return (
              <button
                key={it.id}
                onClick={() => onToggleSticker(participant.id, it.id)}
                className={`relative w-full cursor-pointer rounded-card text-left transition ${
                  youPlaced
                    ? "ring-2 ring-sticker"
                    : "hover:ring-1 hover:ring-accent/40"
                }`}
              >
                <ComponentCard
                  componentId={it.componentId}
                  text={it.text}
                  variant="preview"
                />
                {stickerVoters.length > 0 && (
                  <div className="absolute -right-1 -top-1 flex items-center gap-0.5 rounded-full bg-sticker px-1.5 py-0.5 text-[10px] font-bold text-ink-900 shadow-card">
                    ★ {stickerVoters.length}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
