import { useStore } from "../state/store";
import { downloadJSON } from "../utils/exportUtils";

const STEPS = [
  { id: 2, label: "Journey", subLabel: "여정 재구성", time: "20m" },
  { id: 3, label: "Canvas", subLabel: "컴포넌트 조합", time: "30m" },
  { id: 4, label: "Compare", subLabel: "비교·투표", time: "15m" },
];

export default function SessionBar() {
  const { state, dispatch } = useStore();
  const currentId = state.currentParticipantId;

  const handleExport = () => {
    if (!currentId) return;
    const data = state.participants[currentId];
    downloadJSON(
      `mpdt_${currentId}_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.json`,
      data
    );
  };

  const handleEnd = () => {
    if (
      window.confirm(
        "End this session and return to name entry? Data is already saved. (세션을 종료하고 이름 입력 화면으로 돌아갈까요? 데이터는 이미 저장되어 있습니다.)"
      )
    ) {
      dispatch({ type: "EXIT_TO_ENTRY" });
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-ink-900 text-[11px] font-semibold text-white">
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

        {/* Current participant indicator */}
        <div className="flex items-center gap-1.5">
          <span className="label-bi-sub">Participant</span>
          <span className="rounded-full bg-ink-900 px-2 py-0.5 text-[11px] font-semibold text-white">
            {currentId}
          </span>
        </div>

        <div className="mx-2 h-6 w-px bg-ink-100" />

        {/* Step nav */}
        <nav className="flex items-center gap-1.5">
          {STEPS.map((s) => {
            const active = state.currentStep === s.id;
            return (
              <button
                key={s.id}
                onClick={() => dispatch({ type: "SET_STEP", step: s.id })}
                className={`rounded-md px-3 py-1.5 text-left transition ${
                  active
                    ? "bg-ink-900 text-white"
                    : "text-ink-700 hover:bg-ink-50"
                }`}
              >
                <div className="text-[12px] font-semibold leading-tight">
                  {s.label}
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
          <button className="btn-ghost" onClick={handleExport}>
            Export JSON
          </button>
          <button className="btn-ghost" onClick={handleEnd}>
            End session (종료)
          </button>
        </div>
      </div>
    </header>
  );
}
