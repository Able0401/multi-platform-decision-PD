import { useRef } from "react";
import { useStore, useCurrentParticipant } from "../state/store";
import { uid } from "../utils/id";
import { downloadElementPNG } from "../utils/exportUtils";

const APP_SUGGESTIONS = [
  "Naver Map (네이버맵)",
  "Instagram (인스타)",
  "KakaoTalk (카톡)",
  "Google Map (구글맵)",
  "Mango Plate (망고)",
  "Catch Table (캐치테이블)",
  "Naver Blog (블로그)",
  "YouTube",
  "Baemin (배민)",
  "Direct search (검색)",
];

const EMOTIONS = [
  { id: "excited", emoji: "😊", en: "Excited", ko: "설레는" },
  { id: "curious", emoji: "🤔", en: "Curious", ko: "궁금" },
  { id: "neutral", emoji: "😐", en: "Neutral", ko: "덤덤" },
  { id: "anxious", emoji: "😟", en: "Anxious", ko: "불안" },
  { id: "frustrated", emoji: "😤", en: "Frustrated", ko: "답답" },
  { id: "confident", emoji: "🙌", en: "Confident", ko: "확신" },
];

export default function Step2Timeline() {
  const { dispatch } = useStore();
  const participant = useCurrentParticipant();
  const railRef = useRef(null);

  const cards = participant?.step2.cards ?? [];

  const addCard = () => {
    dispatch({
      type: "S2_ADD_CARD",
      card: {
        id: uid("c"),
        app: "",
        sawWhat: "",
        emotion: "",
        switchReason: "",
      },
    });
    requestAnimationFrame(() => {
      if (railRef.current)
        railRef.current.scrollLeft = railRef.current.scrollWidth;
    });
  };

  const updateCard = (id, patch) =>
    dispatch({ type: "S2_UPDATE_CARD", id, patch });

  const removeCard = (id) => dispatch({ type: "S2_REMOVE_CARD", id });

  const moveCard = (id, dir) => {
    const idx = cards.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= cards.length) return;
    const next = [...cards];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    dispatch({ type: "S2_REORDER_CARDS", cards: next });
  };

  const handleExportPNG = async () => {
    if (!railRef.current) return;
    const filename = `mpdt_${participant.id}_journey_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.png`;
    await downloadElementPNG(filename, railRef.current);
  };

  return (
    <div className="flex h-full flex-col p-4">
      <section className="flex flex-1 flex-col overflow-hidden">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[13px] font-semibold text-ink-900">
              Journey Reconstruction
            </div>
            <div className="text-[11px] text-ink-500">
              여정 재구성 — 앱 카드를 추가하고, 본 것·감정·전환 이유를 적어주세요
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="btn-ghost" onClick={handleExportPNG}>
              Save PNG
            </button>
            <button className="btn-primary" onClick={addCard}>
              + Add app card (앱 카드 추가)
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          className="flex flex-1 items-stretch gap-2 overflow-x-auto rounded-card border border-ink-100 bg-white p-4"
        >
          {cards.length === 0 && (
            <div className="m-auto text-center text-[13px] text-ink-300">
              Click <span className="font-semibold text-ink-700">+ Add app card</span> to start.
              <br />
              <span className="text-[11px]">
                <span className="font-semibold text-ink-700">앱 카드 추가</span>를 눌러 시작하세요
              </span>
            </div>
          )}
          {cards.map((c, i) => (
            <Step2CardWithArrow
              key={c.id}
              index={i}
              total={cards.length}
              card={c}
              onChange={(patch) => updateCard(c.id, patch)}
              onRemove={() => removeCard(c.id)}
              onMove={(dir) => moveCard(c.id, dir)}
            />
          ))}
          {cards.length > 0 && (
            <button
              className="my-1 grid w-[80px] flex-shrink-0 place-items-center rounded-card border border-dashed border-ink-100 text-[12px] text-ink-300 hover:border-ink-300 hover:text-ink-700"
              onClick={addCard}
            >
              +<br />add
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function Step2CardWithArrow({ index, total, card, onChange, onRemove, onMove }) {
  const isLast = index === total - 1;
  return (
    <>
      <JourneyCard
        index={index}
        total={total}
        card={card}
        onChange={onChange}
        onRemove={onRemove}
        onMove={onMove}
      />
      {!isLast && <Arrow reason={card.switchReason} />}
    </>
  );
}

function JourneyCard({ index, total, card, onChange, onRemove, onMove }) {
  const isLast = index === total - 1;
  return (
    <div className="flex w-[260px] flex-shrink-0 flex-col gap-2 rounded-card border border-ink-100 bg-white p-3 shadow-card">
      <div className="flex items-center justify-between gap-1">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-300">
          Step {index + 1}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            className="grid h-5 w-5 place-items-center rounded text-ink-300 hover:bg-ink-50 hover:text-ink-700 disabled:opacity-30"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            title="Move left"
          >
            ‹
          </button>
          <button
            className="grid h-5 w-5 place-items-center rounded text-ink-300 hover:bg-ink-50 hover:text-ink-700 disabled:opacity-30"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            title="Move right"
          >
            ›
          </button>
          <button
            className="grid h-5 w-5 place-items-center rounded text-ink-300 hover:bg-ink-50 hover:text-ink-700"
            onClick={onRemove}
            title="Remove"
          >
            ×
          </button>
        </div>
      </div>

      {/* App name */}
      <div>
        <div className="label-bi-sub mb-1">
          App <span className="text-ink-300">앱</span>
        </div>
        <input
          className="input"
          list="app-suggestions"
          placeholder="e.g. Instagram"
          value={card.app}
          onChange={(e) => onChange({ app: e.target.value })}
        />
        <datalist id="app-suggestions">
          {APP_SUGGESTIONS.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>
      </div>

      {/* Saw what */}
      <div>
        <div className="label-bi-sub mb-1">
          What I saw <span className="text-ink-300">본 것</span>
        </div>
        <textarea
          className="input min-h-[56px] resize-none"
          placeholder="reviews, photos, friend's recommendation…"
          value={card.sawWhat}
          onChange={(e) => onChange({ sawWhat: e.target.value })}
        />
      </div>

      {/* Emotion */}
      <div>
        <div className="label-bi-sub mb-1">
          Emotion <span className="text-ink-300">감정</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {EMOTIONS.map((e) => {
            const active = card.emotion === e.id;
            return (
              <button
                key={e.id}
                onClick={() =>
                  onChange({ emotion: active ? "" : e.id })
                }
                className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] transition ${
                  active
                    ? "border-ink-900 bg-ink-900 text-white"
                    : "border-ink-100 bg-white text-ink-700 hover:border-ink-300"
                }`}
                title={`${e.en} (${e.ko})`}
              >
                <span className="text-[12px] leading-none">{e.emoji}</span>
                {e.ko}
              </button>
            );
          })}
        </div>
      </div>

      {/* Switch reason */}
      <div>
        <div className="label-bi-sub mb-1">
          {isLast ? (
            <>
              Final decision <span className="text-ink-300">최종 결정</span>
            </>
          ) : (
            <>
              Why switch? <span className="text-ink-300">다음 앱으로 넘어간 이유</span>
            </>
          )}
        </div>
        <textarea
          className="input min-h-[44px] resize-none"
          placeholder={
            isLast
              ? "I finally chose ___ because ___"
              : "별점은 봤는데 분위기가 안 보여서…"
          }
          value={card.switchReason}
          onChange={(e) => onChange({ switchReason: e.target.value })}
        />
      </div>
    </div>
  );
}

function Arrow({ reason }) {
  return (
    <div className="flex flex-shrink-0 flex-col items-center justify-center px-1">
      <div className="text-ink-300">→</div>
      {reason ? (
        <div className="mt-1 max-w-[100px] text-center text-[10px] leading-tight text-ink-500">
          {reason.length > 40 ? reason.slice(0, 40) + "…" : reason}
        </div>
      ) : (
        <div className="mt-1 max-w-[100px] text-center text-[10px] leading-tight text-ink-300 italic">
          (reason)
        </div>
      )}
    </div>
  );
}
