import "./App.css";
import { StoreProvider, useStore } from "./state/store";
import SessionBar from "./components/SessionBar";
import NameEntry from "./components/NameEntry";
import IntroPages from "./components/IntroPages";
import AdminView from "./components/AdminView";
import Step2Timeline from "./steps/Step2Timeline";
import Step3Canvas from "./steps/Step3Canvas";
import Step4Discussion from "./steps/Step4Compare";

function StepView() {
  const { state } = useStore();
  switch (state.currentStep) {
    case 2:
      return <Step2Timeline />;
    case 3:
      return <Step3Canvas />;
    case 4:
      return <Step4Discussion />;
    default:
      return <Step2Timeline />;
  }
}

function ParticipantShell() {
  const { state } = useStore();
  return (
    <div className="flex h-full flex-col">
      <SessionBar />
      {state.topic && (
        <div className="border-b border-accent/20 bg-accent/5 px-5 py-2.5">
          <div className="mx-auto flex max-w-[1400px] items-center gap-2 text-accent">
            <span className="text-[16px]">🎯</span>
            <span className="text-[14px] font-semibold tracking-wide">
              {state.topic}
            </span>
          </div>
        </div>
      )}
      <main className="flex-1 overflow-auto">
        <StepView />
      </main>
    </div>
  );
}

function Shell() {
  const { state } = useStore();
  if (state.mode === "admin") return <AdminView />;
  if (state.mode === "intro" && state.currentParticipantId)
    return <IntroPages />;
  if (state.mode === "participant" && state.currentParticipantId)
    return <ParticipantShell />;
  return <NameEntry />;
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
