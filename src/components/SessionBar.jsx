import { useEffect, useRef, useState } from "react";
import { useStore } from "../state/store";
import { downloadJSON } from "../utils/exportUtils";

const STEPS = [
  { id: 2, label: "Journey", subLabel: "여정 재구성", time: "20m" },
  { id: 3, label: "Canvas", subLabel: "컴포넌트 조합", time: "30m" },
  { id: 4, label: "Compare", subLabel: "비교·투표", time: "15m" },
];

export default function SessionBar() {
  const { state, dispatch } = useStore();
  const [newId, setNewId] = useState("");

  const participantIds = Object.keys(state.participants);
  const currentId = state.currentParticipantId;

  const handleStart = () => {
    if (!newId.trim()) return;
    dispatch({ type: "START_PARTICIPANT", id: newId });
    setNewId("");
  };

  const handleExportAll = () => {
    downloadJSON(
      `mpdt_session_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`,
      state
    );
  };

  const handleResetAll = () => {
    if (
      window.confirm(
        "Reset entire session? All participants will be removed. (전체 세션을 초기화하시겠어요?)"
      )
    ) {
      dispatch({ type: "RESET_ALL" });
    }
  };

  const handleDeleteParticipant = () => {
    if (!currentId) return;
    if (
      window.confirm(
        `Delete participant ${currentId}? (참여자 ${currentId}을 삭제하시겠어요?)`
      )
    ) {
      dispatch({ type: "DELETE_PARTICIPANT", id: currentId });
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-ink-900 text-white grid place-items-center text-[11px] font-semibold">
            MPDT
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-ink-900">
              Multi-Platform Decision Trace
            </div>
            <div className="text-[11px] text-ink-500">
              다중 플랫폼 결정 추적법
            </div>
          </div>
        </div>

        <div className="mx-2 h-6 w-px bg-ink-100" />

        {/* Participant control */}
        <div className="flex items-center gap-2">
          <span className="label-bi-sub">Participant (참여자)</span>
          {participantIds.length > 0 && (
            <select
              className="input !w-auto !py-1 !text-[12px]"
              value={currentId ?? ""}
              onChange={(e) =>
                dispatch({ type: "SELECT_PARTICIPANT", id: e.target.value })
              }
            >
              {participantIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          )}
          <input
            className="input !w-[110px] !py-1 !text-[12px]"
            placeholder="e.g. P01"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
          />
          <button className="btn-soft !py-1" onClick={handleStart}>
            + Start (시작)
          </button>
          {currentId && (
            <button
              className="btn-ghost !py-1 !text-[12px]"
              onClick={handleDeleteParticipant}
              title="Delete current participant"
            >
              Delete
            </button>
          )}
        </div>

        <div className="mx-2 h-6 w-px bg-ink-100" />

        {/* Step nav */}
        <nav className="flex items-center gap-1.5">
          {STEPS.map((s) => {
            const active = state.currentStep === s.id;
            return (
              <button
                key={s.id}
                disabled={!currentId}
                onClick={() => dispatch({ type: "SET_STEP", step: s.id })}
                className={`rounded-md px-3 py-1.5 text-left transition ${
                  active
                    ? "bg-ink-900 text-white"
                    : "text-ink-700 hover:bg-ink-50 disabled:opacity-40"
                }`}
              >
                <div className="text-[12px] font-semibold leading-tight">
                  Step {s.id} · {s.label}
                </div>
                <div
                  className={`text-[10px] leading-tight ${active ? "text-white/70" : "text-ink-500"}`}
                >
                  {s.subLabel} · {s.time}
                </div>
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Timer />
          <button className="btn-ghost" onClick={handleExportAll}>
            Export JSON
          </button>
          <button className="btn-ghost" onClick={handleResetAll}>
            Reset all
          </button>
        </div>
      </div>
    </header>
  );
}

function Timer() {
  const [running, setRunning] = useState(false);
  const [start, setStart] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useTick(() => {
    if (running && start != null) {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }
  }, running);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-1">
      <button
        className={`btn-ghost !py-1 !text-[12px] tabular-nums ${
          running ? "border-accent text-accent" : ""
        }`}
        onClick={() => {
          if (running) {
            setRunning(false);
          } else {
            setStart(Date.now() - elapsed * 1000);
            setRunning(true);
          }
        }}
        title="Start/pause timer"
      >
        {running ? "⏸" : "▶"} {mm}:{ss}
      </button>
      <button
        className="btn-ghost !py-1 !text-[12px]"
        onClick={() => {
          setRunning(false);
          setStart(null);
          setElapsed(0);
        }}
      >
        Reset
      </button>
    </div>
  );
}

function useTick(cb, active) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    if (!active) return;
    const i = setInterval(() => cbRef.current(), 1000);
    return () => clearInterval(i);
  }, [active]);
}
