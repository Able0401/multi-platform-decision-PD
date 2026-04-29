import { useState } from "react";
import { useStore } from "../state/store";
import { safeParticipantId } from "../firebase";

export default function NameEntry() {
  const { dispatch } = useStore();
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase() === "admin") {
      dispatch({ type: "ENTER_ADMIN" });
      return;
    }
    const id = safeParticipantId(trimmed);
    if (!id) return;
    dispatch({ type: "START_PARTICIPANT", id });
  };

  return (
    <div className="flex h-full items-center justify-center bg-ink-50/30 p-10">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md p-8 text-center"
      >
        <div className="mb-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-ink-900 text-[12px] font-semibold text-white">
          MPDT
        </div>
        <div className="mt-2 text-[16px] font-semibold text-ink-900">
          Multi-Platform Decision Trace
        </div>
        <div className="mt-1 text-[12px] text-ink-500">
          다중 플랫폼 결정 추적법
        </div>

        <div className="mt-7 text-left">
          <label className="text-[12px] font-medium text-ink-900">
            Your name <span className="text-ink-500">(이름)</span>
          </label>
          <input
            autoFocus
            className="input mt-1.5 text-[14px]"
            placeholder="e.g. Hyun Seung Moon"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary mt-3 w-full !py-2 !text-[13px]"
            disabled={!name.trim()}
          >
            Start (시작) →
          </button>
        </div>

      </form>
    </div>
  );
}
