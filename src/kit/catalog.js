// Component catalog for the Step 3 kit.
// Each entry has: id, label (EN), labelKo (KR), defaultText, group
//
// "defaultText" is the human-readable mock content the card shows when first dropped.
// Participants can double-click to edit the text.

export const COMPONENT_CATALOG = [
  {
    id: "rating-reviews",
    label: "Rating & Reviews",
    labelKo: "별점·리뷰수",
    group: "trust",
    defaultText: "★ 4.3 · 1,284 reviews",
  },
  {
    id: "mood-photo",
    label: "Mood Photo",
    labelKo: "분위기 사진",
    group: "vibe",
    defaultText: "Insta-style photo",
  },
  {
    id: "friend-visit",
    label: "Friend Visited",
    labelKo: "친구 방문 뱃지",
    group: "social",
    defaultText: "지수, 민준 visited",
  },
  {
    id: "mood-tag",
    label: "Mood / Situation Tag",
    labelKo: "무드·상황 태그",
    group: "vibe",
    defaultText: "조용한 · 혼자 · 데이트",
  },
  {
    id: "distance",
    label: "Distance & Walk Time",
    labelKo: "거리·도보 시간",
    group: "logistics",
    defaultText: "320m · walk 5min",
  },
  {
    id: "waiting",
    label: "Waiting Status",
    labelKo: "웨이팅 여부",
    group: "logistics",
    defaultText: "No wait · 웨이팅 없음",
  },
  {
    id: "price",
    label: "Price Range",
    labelKo: "가격대",
    group: "logistics",
    defaultText: "₩₩ · 12–18k",
  },
  {
    id: "review-snippet",
    label: "Review Snippet",
    labelKo: "리뷰 발췌",
    group: "trust",
    defaultText: "“혼자 가서 책 읽기 좋아요”",
  },
  {
    id: "last-visit",
    label: "Last Visit Time",
    labelKo: "최근 방문 시간",
    group: "social",
    defaultText: "Visited 3 days ago",
  },
  {
    id: "blank-text",
    label: "Custom Note",
    labelKo: "직접 입력",
    group: "custom",
    defaultText: "",
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
