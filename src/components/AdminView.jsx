import { useMemo, useState } from "react";
import { useStore } from "../state/store";
import ComponentCard from "../kit/ComponentCard";
import { downloadJSON } from "../utils/exportUtils";

export default function AdminView() {
  const { state, dispatch } = useStore();
  const [selected, setSelected] = useState(null);

  const participants = state.participants;
  const ids = Object.keys(participants).sort();

  const stickerRollup = useMemo(() => {
    const counts = {};
    for (const pid of ids) {
      const stickers = participants[pid]?.step4?.stickers ?? [];
      for (const s of stickers) {
        const key = `${s.targetParticipantId}:${s.targetItemId}`;
        counts[key] = (counts[key] ?? 0) + 1;
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
              관리자 — 모든 참여자 보기
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
              const stickersGiven = p.step4?.stickers?.length ?? 0;
              const stickersReceived = Object.entries(stickerRollup).reduce(
                (n, [key, c]) =>
                  key.startsWith(`${pid}:`) ? n + c : n,
                0
              );
              const active = selected === pid;
              return (
                <button
                  key={pid}
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
                    <Stat label="given" value={stickersGiven} />
                    <Stat label="★" value={stickersReceived} highlight />
                  </div>
                </button>
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
              stickerRollup={stickerRollup}
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
        highlight ? "bg-sticker/40 text-ink-900" : "bg-ink-50 text-ink-700"
      }`}
    >
      {value} {label}
    </span>
  );
}

function ParticipantDetail({ participant, stickerRollup }) {
  const cards = participant.step2?.cards ?? [];
  const items = participant.step3?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[15px] font-semibold text-ink-900">
          {participant.id}
        </div>
        <div className="text-[11px] text-ink-500">
          Started {participant.startedAt ? new Date(participant.startedAt).toLocaleString() : "—"}
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
              {items.map((it) => {
                const stickers =
                  Object.entries(stickerRollup).find(
                    ([k]) => k === `${participant.id}:${it.id}`
                  )?.[1] ?? 0;
                return (
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
                    {stickers > 0 && (
                      <div className="absolute -right-1 -top-1 rounded-full bg-sticker px-1.5 py-0.5 text-[10px] font-bold text-ink-900 shadow-card">
                        ★ {stickers}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
