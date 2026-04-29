import { useStore } from "../state/store";

// 4 short pages introducing the study before the participant starts.
// Content is grounded in the method's stated Design Goal, Study Goal, and
// Design Situation.

const PAGES = [
  {
    id: "welcome",
    eyebrow: { en: "Welcome", ko: "환영합니다" },
    title: ({ name }) => `Hi, ${name} 👋`,
    body: () => (
      <>
        <p>
          Thanks for joining this participatory design study about{" "}
          <strong>how people in their 20s discover places</strong> — restaurants,
          cafes — when their decision is spread across multiple apps.
        </p>
        <p className="mt-3 text-ink-500">
          참여해주셔서 감사해요. 이 스터디는{" "}
          <strong>20대가 식당·카페를 찾을 때 여러 앱을 옮겨다니며 결정하는 경험</strong>을
          이해하기 위한 것이에요.
        </p>
        <div className="mt-5 rounded-md border border-ink-100 bg-ink-50/60 p-3 text-[12px] leading-relaxed text-ink-700">
          You'll spend about <strong>~60 minutes</strong> walking through three
          activities. There are no right or wrong answers — we're trying to
          learn from what you actually do.
          <br />
          <span className="text-ink-500">
            약 60분 동안 세 가지 활동을 진행해요. 정답은 없어요 — 평소 하시는 그대로
            보여주시면 돼요.
          </span>
        </div>
      </>
    ),
  },
  {
    id: "design-goal",
    eyebrow: { en: "Design Goal", ko: "디자인 목표" },
    title: () => "What we're trying to design",
    body: () => (
      <>
        <p className="text-[13px] text-ink-500">
          무엇을 디자인하려고 하는가
        </p>
        <p className="mt-3">
          A new UX direction so that <strong>people in their 20s don't have
          to bounce between Naver Map, Instagram, and KakaoTalk</strong> when
          choosing where to eat or hang out — or at least an experience that
          makes that bouncing feel less broken.
        </p>
        <p className="mt-3 text-ink-500">
          20대가 장소를 찾을 때 <strong>네이버맵, 인스타그램, 카카오톡을
          오가지 않아도 되는</strong> — 혹은 그 분산된 경험을 보완해주는 — 새로운
          UX 방향을 찾고 있어요.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <AppMock label="Naver Map" emoji="🗺️" />
          <AppMock label="Instagram" emoji="📷" />
          <AppMock label="KakaoTalk" emoji="💬" />
        </div>
      </>
    ),
  },
  {
    id: "situation",
    eyebrow: { en: "Study Situation", ko: "스터디 상황" },
    title: () => "The moment we're studying",
    body: () => (
      <>
        <p className="text-[13px] text-ink-500">
          우리가 들여다보는 그 순간
        </p>
        <p className="mt-3">
          You probably do this without thinking: open Naver Map, jump to
          Instagram for the vibe, ask in a KakaoTalk group, maybe peek at a
          friend's saved list — and then still hesitate to commit.
        </p>
        <p className="mt-3 text-ink-500">
          별 생각 없이 하시잖아요 — 네이버맵 켰다가, 분위기는 인스타로 보고,
          단톡방에 물어보고, 친구가 저장한 곳 슬쩍 보고… 그러고도 결정을 못
          내리는 그 순간.
        </p>
        <div className="mt-5 rounded-md border border-ink-100 bg-accent-soft/60 p-3 text-[12px] leading-relaxed text-ink-700">
          We want to understand <strong>why you switch apps</strong>, where the
          decision gets stuck, and what information you actually need.
          <br />
          <span className="text-ink-500">
            왜 앱을 옮겨다니는지, 결정이 막히는 순간이 언제인지, 진짜로 필요한
            정보가 무엇인지를 이해하고 싶어요.
          </span>
        </div>
      </>
    ),
  },
  {
    id: "what-youll-do",
    eyebrow: { en: "What you'll do", ko: "오늘 하실 일" },
    title: () => "Three short activities",
    body: () => (
      <>
        <p className="text-[13px] text-ink-500">
          세 가지 짧은 활동
        </p>
        <ol className="mt-4 space-y-3">
          <ActivityRow
            n={1}
            en="Recall a recent search and lay it out as a timeline of apps you opened."
            ko="최근에 직접 장소를 찾았던 경험을 떠올려, 열었던 앱들을 타임라인으로 정리해요."
            tag="Journey · 여정 재구성"
          />
          <ActivityRow
            n={2}
            en="Build the ideal screen by dragging components onto a phone canvas. Make your own if you don't see what you need."
            ko="컴포넌트를 폰 캔버스에 드래그해서 이상적인 화면을 만들어요. 원하는 게 없으면 직접 만드셔도 돼요."
            tag="Canvas · 컴포넌트 조합"
          />
          <ActivityRow
            n={3}
            en="Compare the screens (yours and others') and put stickers on what really matters."
            ko="만든 화면들을 비교하면서, 진짜 중요한 곳에 스티커를 붙여요."
            tag="Compare · 비교·투표"
          />
        </ol>
        <div className="mt-5 rounded-md border border-ink-100 bg-ink-50/60 p-3 text-[12px] leading-relaxed text-ink-700">
          You can think aloud while you work — that helps us a lot. Ready when
          you are.
          <br />
          <span className="text-ink-500">
            만들면서 떠오르는 생각을 소리내어 말해주시면 정말 도움이 돼요. 준비되시면 시작해요.
          </span>
        </div>
      </>
    ),
  },
];

export default function IntroPages() {
  const { state, dispatch } = useStore();
  const idx = Math.max(0, Math.min(PAGES.length - 1, state.introStepIndex ?? 0));
  const page = PAGES[idx];
  const isFirst = idx === 0;
  const isLast = idx === PAGES.length - 1;
  const name = state.currentParticipantId ?? "";

  const goNext = () => {
    if (isLast) {
      dispatch({ type: "FINISH_INTRO" });
    } else {
      dispatch({ type: "SET_INTRO_STEP", index: idx + 1 });
    }
  };
  const goBack = () => {
    if (isFirst) {
      dispatch({ type: "EXIT_TO_ENTRY" });
    } else {
      dispatch({ type: "SET_INTRO_STEP", index: idx - 1 });
    }
  };

  return (
    <div className="flex h-full items-center justify-center bg-ink-50/30 p-10">
      <div className="card w-full max-w-2xl p-10">
        {/* Eyebrow + progress */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
              {page.eyebrow.en}
            </div>
            <div className="text-[10px] text-ink-500">{page.eyebrow.ko}</div>
          </div>
          <div className="flex items-center gap-1.5">
            {PAGES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx
                    ? "w-6 bg-ink-900"
                    : i < idx
                      ? "w-1.5 bg-ink-700"
                      : "w-1.5 bg-ink-100"
                }`}
              />
            ))}
            <span className="ml-2 text-[11px] tabular-nums text-ink-500">
              {idx + 1} / {PAGES.length}
            </span>
          </div>
        </div>

        {/* Title + body */}
        <h1 className="mt-5 text-[22px] font-semibold leading-tight text-ink-900">
          {page.title({ name })}
        </h1>
        <div className="mt-3 text-[14px] leading-relaxed text-ink-700">
          {page.body()}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button className="btn-ghost" onClick={goBack}>
            {isFirst ? "← Change name (이름 변경)" : "← Back (뒤로)"}
          </button>
          <button className="btn-primary !px-5 !py-2 !text-[13px]" onClick={goNext}>
            {isLast ? "Start study (시작하기) →" : "Next (다음) →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AppMock({ label, emoji }) {
  return (
    <div className="rounded-card border border-ink-100 bg-white p-3 shadow-card">
      <div className="text-[24px] leading-none">{emoji}</div>
      <div className="mt-1 text-[11px] font-medium text-ink-900">{label}</div>
    </div>
  );
}

function ActivityRow({ n, en, ko, tag }) {
  return (
    <li className="flex gap-3 rounded-md border border-ink-100 bg-white p-3">
      <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-ink-900 text-[12px] font-semibold text-white">
        {n}
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-accent">
          {tag}
        </div>
        <div className="mt-0.5 text-[13px] text-ink-900">{en}</div>
        <div className="mt-1 text-[11px] text-ink-500">{ko}</div>
      </div>
    </li>
  );
}
