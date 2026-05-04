import { useMemo, useState } from "react";
import { useStore } from "../state/store";
import ComponentCard from "../kit/ComponentCard";
import { downloadJSON } from "../utils/exportUtils";
import { doc, deleteDoc } from "firebase/firestore";
import { db, PARTICIPANTS } from "../firebase";

export default function AdminView() {
  const { state, dispatch } = useStore();
  const [selected, setSelected] = useState(null);

  const participants = state.participants;
  const ids = Object.keys(participants).sort();

  // Aggregate discussion counts
  const discussionCounts = useMemo(() => {
    const counts = {};
    for (const pid of ids) {
      const discussions = participants[pid]?.step4?.discussions ?? [];
      counts[pid] = {
        given: discussions.length,
        received: 0,
      };
      for (const d of discussions) {
        if (!counts[d.targetParticipantId]) {
          counts[d.targetParticipantId] = { given: 0, received: 0 };
        }
        counts[d.targetParticipantId].received++;
      }
    }
    return counts;
  }, [ids, participants]);

  const exportEverything = () => {
    downloadJSON(
      `mpdt_admin_export_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.json`,
      state
    );
  };

  const handleDeleteParticipant = async (pid) => {
    const p = participants[pid];
    const journey = p?.step2?.cards?.length ?? 0;
    const items = p?.step3?.items?.length ?? 0;
    const memos = p?.step2?.memos?.length ?? 0;
    const discussions = p?.step4?.discussions?.length ?? 0;

    const confirmMsg = `정말로 "${pid}" 참여자를 삭제하시겠습니까?\n\nDelete participant "${pid}"?\n\nData to be deleted:\n- Journey cards: ${journey}\n- Canvas items: ${items}\n- Memos: ${memos}\n- Discussions: ${discussions}`;

    if (!window.confirm(confirmMsg)) return;

    // Delete from Firestore
    try {
      await deleteDoc(doc(db, PARTICIPANTS, pid));
    } catch (err) {
      console.warn("[firebase] delete participant error:", err);
    }

    // Delete from local state
    dispatch({ type: "DELETE_PARTICIPANT", id: pid });

    // If we were viewing this participant, clear selection
    if (selected === pid) setSelected(null);
  };

  const handleClearParticipantData = async (pid, dataType) => {
    const labels = {
      journey: "여정 카드 (Journey cards)",
      canvas: "캔버스 아이템 (Canvas items)",
      memos: "메모 (Memos)",
      discussions: "논의 (Discussions)",
      all: "모든 데이터 (All data)",
    };

    if (
      !window.confirm(
        `"${pid}"의 ${labels[dataType]}를 삭제하시겠습니까?\nDelete ${labels[dataType]} for "${pid}"?`
      )
    )
      return;

    const p = { ...participants[pid] };

    switch (dataType) {
      case "journey":
        p.step2 = { ...p.step2, cards: [] };
        break;
      case "canvas":
        p.step3 = { ...p.step3, items: [] };
        break;
      case "memos":
        p.step2 = { ...p.step2, memos: [] };
        break;
      case "discussions":
        p.step4 = { ...p.step4, discussions: [] };
        break;
      case "all":
        p.step2 = { cards: [], memos: [] };
        p.step3 = { items: [] };
        p.step4 = { discussions: [] };
        break;
    }

    // We need to temporarily set this participant as current to dispatch a patch
    dispatch({ type: "SELECT_PARTICIPANT", id: pid });
    dispatch({ type: "PATCH_PARTICIPANT", patch: p });
  };

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/95 px-5 py-2.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-white text-[11px] font-semibold">
            A
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-ink-900">
              Admin · All Participants
            </div>
            <div className="text-[11px] text-ink-500">
              관리자 — 모든 참여자 보기 · 삭제 가능
            </div>
          </div>
          <span className="ml-2 rounded-full bg-ink-50 px-2 py-0.5 text-[11px] tabular-nums text-ink-700">
            {ids.length} participants
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn-ghost" onClick={exportEverything}>
              Export JSON
            </button>
            <button
              className="btn-ghost"
              onClick={() => dispatch({ type: "EXIT_TO_ENTRY" })}
            >
              Exit admin (나가기)
            </button>
          </div>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-[280px_1fr] overflow-hidden">
        {/* Participant list */}
        <aside className="overflow-y-auto border-r border-ink-100 bg-white p-3">
          {ids.length === 0 && (
            <div className="rounded-md border border-dashed border-ink-100 p-4 text-center text-[12px] text-ink-300">
              No participants yet.
              <br />
              아직 참여자가 없습니다.
            </div>
          )}
          <div className="space-y-1.5">
            {ids.map((pid) => {
              const p = participants[pid];
              const journey = p.step2?.cards?.length ?? 0;
              const items = p.step3?.items?.length ?? 0;
              const memos = p.step2?.memos?.length ?? 0;
              const discussionsGiven =
                discussionCounts[pid]?.given ?? 0;
              const discussionsReceived =
                discussionCounts[pid]?.received ?? 0;
              const active = selected === pid;
              return (
                <div key={pid} className="group/participant relative">
                  <button
                    onClick={() => setSelected(pid)}
                    className={`block w-full rounded-md border px-2.5 py-2 text-left transition ${
                      active
                        ? "border-accent bg-accent-soft"
                        : "border-ink-100 bg-white hover:border-ink-300"
                    }`}
                  >
                    <div className="text-[13px] font-semibold text-ink-900 truncate">
                      {pid}
                    </div>
                    <div className="text-[10px] text-ink-500">
                      {p.startedAt
                        ? new Date(p.startedAt).toLocaleString()
                        : ""}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-ink-500">
                      <Stat label="journey" value={journey} />
                      <Stat label="items" value={items} />
                      <Stat label="memos" value={memos} />
                      <Stat
                        label="💬"
                        value={discussionsGiven}
                      />
                      <Stat
                        label="received"
                        value={discussionsReceived}
                        highlight
                      />
                    </div>
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteParticipant(pid);
                    }}
                    className="absolute right-1.5 top-1.5 hidden h-5 w-5 items-center justify-center rounded-full border border-red-200 bg-red-50 text-[11px] text-red-500 shadow-sm group-hover/participant:flex hover:bg-red-100 hover:text-red-700 transition"
                    title={`Delete participant "${pid}" (참여자 삭제)`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Detail */}
        <section className="overflow-y-auto p-5">
          {!selected ? (
            <div className="grid h-full place-items-center text-center text-[13px] text-ink-300">
              Pick a participant on the left.
              <br />
              왼쪽에서 참여자를 선택하세요.
            </div>
          ) : (
            <ParticipantDetail
              participant={participants[selected]}
              discussionCounts={discussionCounts}
              onDeleteParticipant={() =>
                handleDeleteParticipant(selected)
              }
              onClearData={(dataType) =>
                handleClearParticipantData(selected, dataType)
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 tabular-nums ${
        highlight ? "bg-accent/20 text-accent" : "bg-ink-50 text-ink-700"
      }`}
    >
      {value} {label}
    </span>
  );
}

function ParticipantDetail({
  participant,
  discussionCounts,
  onDeleteParticipant,
  onClearData,
}) {
  const cards = participant.step2?.cards ?? [];
  const memos = participant.step2?.memos ?? [];
  const items = participant.step3?.items ?? [];
  const discussions = participant.step4?.discussions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[15px] font-semibold text-ink-900">
            {participant.id}
          </div>
          <div className="text-[11px] text-ink-500">
            Started{" "}
            {participant.startedAt
              ? new Date(participant.startedAt).toLocaleString()
              : "—"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Data management buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onClearData("journey")}
              className="rounded-md border border-ink-100 px-2 py-1 text-[10px] text-ink-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition"
              title="Clear journey cards (여정 카드 삭제)"
            >
              🗑 Journey
            </button>
            <button
              onClick={() => onClearData("canvas")}
              className="rounded-md border border-ink-100 px-2 py-1 text-[10px] text-ink-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition"
              title="Clear canvas items (캔버스 아이템 삭제)"
            >
              🗑 Canvas
            </button>
            <button
              onClick={() => onClearData("memos")}
              className="rounded-md border border-ink-100 px-2 py-1 text-[10px] text-ink-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition"
              title="Clear memos (메모 삭제)"
            >
              🗑 Memos
            </button>
            <button
              onClick={() => onClearData("discussions")}
              className="rounded-md border border-ink-100 px-2 py-1 text-[10px] text-ink-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition"
              title="Clear discussions (논의 삭제)"
            >
              🗑 Discussions
            </button>
          </div>
          <div className="h-5 w-px bg-ink-100" />
          <button
            onClick={() => onClearData("all")}
            className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-medium text-red-600 hover:bg-red-100 transition"
            title="Clear all data (모든 데이터 삭제)"
          >
            🗑 All Data
          </button>
          <button
            onClick={onDeleteParticipant}
            className="rounded-md border border-red-300 bg-red-500 px-2.5 py-1 text-[10px] font-medium text-white hover:bg-red-600 transition"
            title="Delete this participant (참여자 삭제)"
          >
            ✕ Delete Participant
          </button>
        </div>
      </div>

      {/* Journey */}
      <section>
        <SectionHeader en="Journey Timeline" ko="여정 재구성" />
        {cards.length === 0 ? (
          <Empty />
        ) : (
          <div className="flex flex-wrap gap-2">
            {cards.map((c, i) => (
              <div
                key={c.id}
                className="w-[260px] rounded-card border border-ink-100 bg-white p-3 shadow-card"
              >
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-300">
                  Step {i + 1}
                </div>
                <Field label="App / 앱" value={c.app} />
                <Field label="Saw / 본 것" value={c.sawWhat} />
                <Field label="Emotion / 감정" value={c.emotion} />
                <Field
                  label={
                    i === cards.length - 1
                      ? "Final / 최종 결정"
                      : "Why switch / 전환 이유"
                  }
                  value={c.switchReason}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Memos */}
      {memos.length > 0 && (
        <section>
          <SectionHeader en="Memos" ko="메모" />
          <div className="flex flex-wrap gap-2">
            {memos.map((memo) => {
              const colorMap = {
                yellow: "bg-yellow-100 border-yellow-300",
                blue: "bg-blue-100 border-blue-300",
                green: "bg-green-100 border-green-300",
                pink: "bg-pink-100 border-pink-300",
                purple: "bg-purple-100 border-purple-300",
              };
              const cls =
                colorMap[memo.color] ?? "bg-yellow-100 border-yellow-300";
              return (
                <div
                  key={memo.id}
                  className={`w-[200px] rounded-lg border p-2.5 ${cls}`}
                >
                  <div className="text-[11px] whitespace-pre-wrap break-words">
                    {memo.text || (
                      <span className="text-ink-300 italic">(empty memo)</span>
                    )}
                  </div>
                  <div className="mt-1 text-[8px] text-ink-400 tabular-nums text-right">
                    {new Date(memo.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Canvas */}
      <section>
        <SectionHeader en="Ideal Screen Canvas" ko="이상적인 화면" />
        {items.length === 0 ? (
          <Empty />
        ) : (
          <div className="rounded-card border border-ink-100 bg-white p-4">
            <div
              className="relative overflow-hidden rounded-[16px] bg-ink-50/40"
              style={{ width: 440, height: 880 }}
            >
              {items.map((it) => (
                <div
                  key={it.id}
                  style={{
                    position: "absolute",
                    left: it.x,
                    top: it.y,
                    width: it.w ?? 240,
                    zIndex: it.z ?? 1,
                  }}
                >
                  <ComponentCard
                    componentId={it.componentId}
                    text={it.text}
                    variant="preview"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Discussions */}
      <section>
        <SectionHeader en="Discussions" ko="논의" />
        {discussions.length === 0 ? (
          <Empty />
        ) : (
          <div className="space-y-2">
            {discussions.map((d) => (
              <div
                key={d.id}
                className="rounded-md border border-ink-100 bg-ink-50/40 px-3 py-2"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] text-ink-400">→</span>
                  <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                    {d.targetParticipantId}
                  </span>
                  <span className="text-[9px] text-ink-300 tabular-nums ml-auto">
                    {new Date(d.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-[12px] text-ink-700 whitespace-pre-wrap break-words">
                  {d.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeader({ en, ko }) {
  return (
    <div className="mb-2">
      <div className="text-[13px] font-semibold text-ink-900">{en}</div>
      <div className="text-[11px] text-ink-500">{ko}</div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="mt-1.5">
      <div className="text-[10px] uppercase tracking-wide text-ink-300">
        {label}
      </div>
      <div className="mt-0.5 whitespace-pre-wrap break-words text-[12px] text-ink-900">
        {value || <span className="text-ink-300">—</span>}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-md border border-dashed border-ink-100 p-3 text-center text-[12px] text-ink-300">
      (no data)
    </div>
  );
}
