import { useRef, useState } from "react";
import {
  useStore,
  useCurrentParticipant,
  useCustomEmotions,
} from "../state/store";
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
  const customEmotions = useCustomEmotions();
  const railRef = useRef(null);

  const cards = participant?.step2.cards ?? [];

  const allEmotions = [...EMOTIONS, ...customEmotions];

  const handleAddEmotion = (emotion) => {
    dispatch({ type: "ADD_CUSTOM_EMOTION", emotion });
  };

  const handleRemoveEmotion = (id) => {
    dispatch({ type: "REMOVE_CUSTOM_EMOTION", id });
  };

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
              emotions={allEmotions}
              onChange={(patch) => updateCard(c.id, patch)}
              onRemove={() => removeCard(c.id)}
              onMove={(dir) => moveCard(c.id, dir)}
              onAddEmotion={handleAddEmotion}
              onRemoveEmotion={handleRemoveEmotion}
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

function Step2CardWithArrow({
  index,
  total,
  card,
  emotions,
  onChange,
  onRemove,
  onMove,
  onAddEmotion,
  onRemoveEmotion,
}) {
  const isLast = index === total - 1;
  return (
    <>
      <JourneyCard
        index={index}
        total={total}
        card={card}
        emotions={emotions}
        onChange={onChange}
        onRemove={onRemove}
        onMove={onMove}
        onAddEmotion={onAddEmotion}
        onRemoveEmotion={onRemoveEmotion}
      />
      {!isLast && <Arrow reason={card.switchReason} />}
    </>
  );
}

function JourneyCard({
  index,
  total,
  card,
  emotions,
  onChange,
  onRemove,
  onMove,
  onAddEmotion,
  onRemoveEmotion,
}) {
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
          placeholder="Type any app or pick from list (직접 입력 가능)"
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
      <EmotionPicker
        emotions={emotions}
        value={card.emotion}
        onChange={(emotion) => onChange({ emotion })}
        onAddEmotion={onAddEmotion}
        onRemoveEmotion={onRemoveEmotion}
      />

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

function EmotionPicker({
  emotions,
  value,
  onChange,
  onAddEmotion,
  onRemoveEmotion,
}) {
  const [adding, setAdding] = useState(false);
  const [emoji, setEmoji] = useState("✨");
  const [labelKo, setLabelKo] = useState("");

  const builtInIds = new Set(EMOTIONS.map((e) => e.id));

  const submit = () => {
    const ko = labelKo.trim();
    if (!ko) return;
    const id = `custom_emotion_${ko}`;
    onAddEmotion?.({
      id,
      emoji: emoji.trim() || "✨",
      en: ko,
      ko,
    });
    onChange?.(id);
    setAdding(false);
    setLabelKo("");
    setEmoji("✨");
  };

  return (
    <div>
      <div className="label-bi-sub mb-1">
        Emotion <span className="text-ink-300">감정</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {emotions.map((e) => {
          const active = value === e.id;
          const isCustom = !builtInIds.has(e.id);
          return (
            <span key={e.id} className="group/emo relative inline-flex">
              <button
                onClick={() => onChange(active ? "" : e.id)}
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
              {isCustom && (
                <button
                  onClick={() => onRemoveEmotion?.(e.id)}
                  className={`absolute -right-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full border border-ink-100 bg-white text-[8px] text-ink-500 group-hover/emo:flex hover:text-ink-900`}
                  title="Remove custom emotion (감정 삭제)"
                >
                  ×
                </button>
              )}
            </span>
          );
        })}
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 rounded-full border border-dashed border-ink-100 px-1.5 py-0.5 text-[10px] text-ink-500 hover:border-accent hover:text-accent"
            title="Add custom emotion (감정 추가)"
          >
            + 감정 추가
          </button>
        ) : (
          <div className="mt-1 flex w-full items-center gap-1 rounded-md border border-ink-100 bg-ink-50/50 p-1">
            <input
              className="w-7 rounded border border-ink-100 bg-white px-1 py-0.5 text-center text-[12px] outline-none focus:border-accent"
              value={emoji}
              maxLength={3}
              onChange={(ev) => setEmoji(ev.target.value)}
              title="Emoji"
            />
            <input
              autoFocus
              className="flex-1 rounded border border-ink-100 bg-white px-1.5 py-0.5 text-[10px] outline-none focus:border-accent"
              placeholder="감정 (e.g. 짜증)"
              value={labelKo}
              onChange={(ev) => setLabelKo(ev.target.value)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter") submit();
                if (ev.key === "Escape") {
                  setAdding(false);
                  setLabelKo("");
                }
              }}
            />
            <button
              className="rounded bg-ink-900 px-1.5 py-0.5 text-[10px] text-white disabled:opacity-30"
              onClick={submit}
              disabled={!labelKo.trim()}
            >
              ✓
            </button>
            <button
              className="rounded px-1 py-0.5 text-[10px] text-ink-500 hover:text-ink-900"
              onClick={() => {
                setAdding(false);
                setLabelKo("");
              }}
            >
              ✕
            </button>
          </div>
        )}
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
