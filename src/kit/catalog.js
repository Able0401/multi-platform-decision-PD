// Component catalog for the Step 3 kit.
// Each entry: id, label (EN), labelKo (KR), group, defaultText, defaultWidth (px)
//
// defaultText: visible mock content when first dropped — participants edit by double-click.
// defaultWidth: initial card width in px on the canvas. The resize handle on each item lets
//   participants adjust afterwards. Widths are varied to avoid the "all-the-same" feel.

export const COMPONENT_CATALOG = [
  // TRUST
  {
    id: "rating-reviews",
    label: "Rating & Reviews",
    labelKo: "별점·리뷰수",
    group: "trust",
    defaultText: "★ 4.3 · 1,284 reviews",
    defaultWidth: 200,
  },
  {
    id: "review-snippet",
    label: "Review Snippet",
    labelKo: "리뷰 발췌",
    group: "trust",
    defaultText: "“혼자 가서 책 읽기 좋아요”",
    defaultWidth: 320,
  },
  {
    id: "owner-reply",
    label: "Owner Reply",
    labelKo: "사장님 답변",
    group: "trust",
    defaultText: "💬 “답변 빠르게 해드려요” — 사장님",
    defaultWidth: 320,
  },
  {
    id: "verified",
    label: "Verified",
    labelKo: "인증 매장",
    group: "trust",
    defaultText: "✓ Verified",
    defaultWidth: 140,
  },

  // VIBE
  {
    id: "mood-photo",
    label: "Mood Photo",
    labelKo: "분위기 사진",
    group: "vibe",
    defaultText: "Insta-style photo",
    defaultWidth: 280,
  },
  {
    id: "mood-tag",
    label: "Mood / Situation Tag",
    labelKo: "무드·상황 태그",
    group: "vibe",
    defaultText: "조용한 · 혼자 · 데이트",
    defaultWidth: 240,
  },
  {
    id: "music",
    label: "Music",
    labelKo: "음악",
    group: "vibe",
    defaultText: "🎵 Lo-fi · 잔잔",
    defaultWidth: 180,
  },
  {
    id: "lighting",
    label: "Lighting",
    labelKo: "조명",
    group: "vibe",
    defaultText: "💡 Warm · 어둡지 않은",
    defaultWidth: 200,
  },
  {
    id: "outdoor-seating",
    label: "Outdoor Seating",
    labelKo: "야외석",
    group: "vibe",
    defaultText: "🌿 야외석 있음",
    defaultWidth: 180,
  },

  // SOCIAL
  {
    id: "friend-visit",
    label: "Friend Visited",
    labelKo: "친구 방문 뱃지",
    group: "social",
    defaultText: "지수, 민준 visited",
    defaultWidth: 220,
  },
  {
    id: "last-visit",
    label: "Last Visit Time",
    labelKo: "최근 방문 시간",
    group: "social",
    defaultText: "Visited 3 days ago",
    defaultWidth: 200,
  },
  {
    id: "saved-by-friends",
    label: "Saved by Friends",
    labelKo: "친구가 저장한 곳",
    group: "social",
    defaultText: "Saved by 4 friends",
    defaultWidth: 240,
  },
  {
    id: "trending",
    label: "Trending",
    labelKo: "지금 핫한",
    group: "social",
    defaultText: "🔥 Trending this week",
    defaultWidth: 220,
  },
  {
    id: "group-size",
    label: "Group Size",
    labelKo: "권장 인원",
    group: "social",
    defaultText: "👥 1–4 people",
    defaultWidth: 180,
  },

  // LOGISTICS
  {
    id: "distance",
    label: "Distance & Walk Time",
    labelKo: "거리·도보 시간",
    group: "logistics",
    defaultText: "320m · walk 5min",
    defaultWidth: 220,
  },
  {
    id: "waiting",
    label: "Waiting Status",
    labelKo: "웨이팅 여부",
    group: "logistics",
    defaultText: "No wait · 웨이팅 없음",
    defaultWidth: 200,
  },
  {
    id: "price",
    label: "Price Range",
    labelKo: "가격대",
    group: "logistics",
    defaultText: "₩₩ · 12–18k",
    defaultWidth: 160,
  },
  {
    id: "operating-hours",
    label: "Operating Hours",
    labelKo: "영업 시간",
    group: "logistics",
    defaultText: "🕒 Open · ~22:00",
    defaultWidth: 220,
  },
  {
    id: "reservations",
    label: "Reservations",
    labelKo: "예약 가능",
    group: "logistics",
    defaultText: "📅 Reservations OK",
    defaultWidth: 220,
  },
  {
    id: "parking",
    label: "Parking",
    labelKo: "주차",
    group: "logistics",
    defaultText: "🅿️ 무료 주차",
    defaultWidth: 180,
  },
  {
    id: "menu",
    label: "Menu Highlights",
    labelKo: "메뉴 하이라이트",
    group: "logistics",
    defaultText: "📋 시그니처: 들기름 파스타",
    defaultWidth: 280,
  },

  // CUSTOM (always last)
  {
    id: "blank-text",
    label: "Custom Note",
    labelKo: "직접 입력",
    group: "custom",
    defaultText: "",
    defaultWidth: 240,
  },
];

export const GROUP_LABELS = {
  trust: { en: "Trust", ko: "신뢰" },
  vibe: { en: "Vibe", ko: "분위기" },
  social: { en: "Social", ko: "사회적" },
  logistics: { en: "Logistics", ko: "현실 정보" },
  custom: { en: "Custom", ko: "직접 입력" },
};

export function findComponent(id, customComponents = []) {
  return (
    COMPONENT_CATALOG.find((c) => c.id === id) ??
    customComponents.find((c) => c.id === id)
  );
}
