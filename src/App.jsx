import "./App.css";
import { StoreProvider, useStore } from "./state/store";
import SessionBar from "./components/SessionBar";
import Step2Timeline from "./steps/Step2Timeline";
import Step3Canvas from "./steps/Step3Canvas";
import Step4Compare from "./steps/Step4Compare";

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-10">
      <div className="card max-w-lg p-8 text-center">
        <div className="text-[15px] font-semibold text-ink-900">
          Start a participant session
        </div>
        <div className="mt-1 text-[13px] text-ink-500">
          참여자를 시작해주세요
        </div>
        <div className="mt-4 text-[12px] leading-relaxed text-ink-500">
          Enter a participant ID (e.g. <code>P01</code>) in the top bar and
          press <span className="font-semibold text-ink-900">Start</span>.
          <br />
          상단 바에 참여자 ID를 입력하고{" "}
          <span className="font-semibold text-ink-900">시작</span>을 누르세요.
        </div>
      </div>
    </div>
  );
}

function StepView() {
  const { state } = useStore();
  if (!state.currentParticipantId) return <EmptyState />;
  switch (state.currentStep) {
    case 2:
      return <Step2Timeline />;
    case 3:
      return <Step3Canvas />;
    case 4:
      return <Step4Compare />;
    default:
      return <EmptyState />;
  }
}

function Shell() {
  return (
    <div className="flex h-full flex-col">
      <SessionBar />
      <main className="flex-1 overflow-auto">
        <StepView />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
