import { createContext, useContext, useEffect, useReducer } from "react";
import { useFirebaseSync } from "./firebaseSync";

const STORAGE_KEY = "mpdt_session_v1";

const blankParticipant = (id) => ({
  id,
  startedAt: new Date().toISOString(),
  step2: { cards: [] },
  step3: { items: [] },
  step4: { stickers: [] },
});

const initialState = {
  mode: "entry", // "entry" | "intro" | "participant" | "admin"
  currentParticipantId: null,
  currentStep: 2,
  introStepIndex: 0,
  participants: {},
  customComponents: [],
  customEmotions: [],
};

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.customComponents)) parsed.customComponents = [];
      if (!Array.isArray(parsed.customEmotions)) parsed.customEmotions = [];
      // Always boot to the entry screen — name re-entry is intentional per session.
      parsed.mode = "entry";
      parsed.currentParticipantId = null;
      parsed.introStepIndex = 0;
      return parsed;
    }
  } catch (e) {
    console.warn("failed to parse stored state", e);
  }
  return initialState;
}

function reducer(state, action) {
  switch (action.type) {
    case "REPLACE_STATE":
      return action.state;

    case "START_PARTICIPANT": {
      const id = action.id.trim();
      if (!id) return state;
      const participants = { ...state.participants };
      if (!participants[id]) participants[id] = blankParticipant(id);
      const introCompleted = !!participants[id].introCompleted;
      return {
        ...state,
        mode: introCompleted ? "participant" : "intro",
        currentParticipantId: id,
        currentStep: 2,
        introStepIndex: 0,
        participants,
      };
    }

    case "SET_INTRO_STEP":
      return { ...state, introStepIndex: action.index };

    case "FINISH_INTRO": {
      const pid = state.currentParticipantId;
      if (!pid) return state;
      const cur = state.participants[pid];
      if (!cur) return state;
      return {
        ...state,
        mode: "participant",
        introStepIndex: 0,
        participants: {
          ...state.participants,
          [pid]: { ...cur, introCompleted: true },
        },
      };
    }

    case "ENTER_ADMIN":
      return { ...state, mode: "admin", currentParticipantId: null };

    case "EXIT_TO_ENTRY":
      return {
        ...state,
        mode: "entry",
        currentParticipantId: null,
        introStepIndex: 0,
      };

    case "SYNC_REMOTE_PARTICIPANTS": {
      // Replace participants from Firestore but keep the current editor's local
      // copy untouched to avoid round-trip flicker on their own edits.
      const merged = { ...action.participants };
      const cid = state.currentParticipantId;
      if (cid && state.participants[cid]) {
        merged[cid] = state.participants[cid];
      }
      return { ...state, participants: merged };
    }

    case "SYNC_REMOTE_GLOBALS": {
      return {
        ...state,
        customComponents: action.customComponents ?? state.customComponents,
        customEmotions: action.customEmotions ?? state.customEmotions,
      };
    }

    case "SELECT_PARTICIPANT":
      return { ...state, currentParticipantId: action.id };

    case "DELETE_PARTICIPANT": {
      const participants = { ...state.participants };
      delete participants[action.id];
      const ids = Object.keys(participants);
      return {
        ...state,
        participants,
        currentParticipantId:
          state.currentParticipantId === action.id
            ? ids[0] ?? null
            : state.currentParticipantId,
      };
    }

    case "SET_STEP":
      return { ...state, currentStep: action.step };

    case "RESET_ALL":
      return initialState;

    case "PATCH_PARTICIPANT": {
      const pid = state.currentParticipantId;
      if (!pid) return state;
      const current = state.participants[pid];
      if (!current) return state;
      return {
        ...state,
        participants: {
          ...state.participants,
          [pid]: { ...current, ...action.patch },
        },
      };
    }

    // STEP 2 actions
    case "S2_ADD_CARD": {
      const pid = state.currentParticipantId;
      if (!pid) return state;
      const cur = state.participants[pid];
      const cards = [...cur.step2.cards, action.card];
      return {
        ...state,
        participants: {
          ...state.participants,
          [pid]: { ...cur, step2: { ...cur.step2, cards } },
        },
      };
    }
    case "S2_UPDATE_CARD": {
      const pid = state.currentParticipantId;
      const cur = state.participants[pid];
      const cards = cur.step2.cards.map((c) =>
        c.id === action.id ? { ...c, ...action.patch } : c
      );
      return {
        ...state,
        participants: {
          ...state.participants,
          [pid]: { ...cur, step2: { ...cur.step2, cards } },
        },
      };
    }
    case "S2_REMOVE_CARD": {
      const pid = state.currentParticipantId;
      const cur = state.participants[pid];
      const cards = cur.step2.cards.filter((c) => c.id !== action.id);
      return {
        ...state,
        participants: {
          ...state.participants,
          [pid]: { ...cur, step2: { ...cur.step2, cards } },
        },
      };
    }
    case "S2_REORDER_CARDS": {
      const pid = state.currentParticipantId;
      const cur = state.participants[pid];
      return {
        ...state,
        participants: {
          ...state.participants,
          [pid]: { ...cur, step2: { ...cur.step2, cards: action.cards } },
        },
      };
    }

    // STEP 3 actions
    case "S3_ADD_ITEM": {
      const pid = state.currentParticipantId;
      const cur = state.participants[pid];
      const items = [...cur.step3.items, action.item];
      return {
        ...state,
        participants: {
          ...state.participants,
          [pid]: { ...cur, step3: { ...cur.step3, items } },
        },
      };
    }
    case "S3_UPDATE_ITEM": {
      const pid = state.currentParticipantId;
      const cur = state.participants[pid];
      const items = cur.step3.items.map((it) =>
        it.id === action.id ? { ...it, ...action.patch } : it
      );
      return {
        ...state,
        participants: {
          ...state.participants,
          [pid]: { ...cur, step3: { ...cur.step3, items } },
        },
      };
    }
    case "S3_REMOVE_ITEM": {
      const pid = state.currentParticipantId;
      const cur = state.participants[pid];
      const items = cur.step3.items.filter((it) => it.id !== action.id);
      return {
        ...state,
        participants: {
          ...state.participants,
          [pid]: { ...cur, step3: { ...cur.step3, items } },
        },
      };
    }

    // CUSTOM COMPONENT actions (workshop-wide catalog additions by participants)
    case "ADD_CUSTOM_COMPONENT": {
      return {
        ...state,
        customComponents: [...state.customComponents, action.component],
      };
    }
    case "REMOVE_CUSTOM_COMPONENT": {
      const cid = action.id;
      const customComponents = state.customComponents.filter(
        (c) => c.id !== cid
      );
      // First pass: collect orphaned item ids across every canvas
      const orphaned = new Set();
      for (const p of Object.values(state.participants)) {
        for (const it of p.step3.items) {
          if (it.componentId === cid) orphaned.add(it.id);
        }
      }
      // Second pass: drop those items + any sticker (any voter) targeting them
      const participants = {};
      for (const [pid, p] of Object.entries(state.participants)) {
        const items = p.step3.items.filter((it) => it.componentId !== cid);
        const stickers = p.step4.stickers.filter(
          (s) => !orphaned.has(s.targetItemId)
        );
        participants[pid] = {
          ...p,
          step3: { ...p.step3, items },
          step4: { ...p.step4, stickers },
        };
      }
      return { ...state, customComponents, participants };
    }

    // CUSTOM EMOTION actions (workshop-wide emotion catalog additions)
    case "ADD_CUSTOM_EMOTION": {
      // Avoid duplicates by id
      if (state.customEmotions.some((e) => e.id === action.emotion.id)) {
        return state;
      }
      return {
        ...state,
        customEmotions: [...state.customEmotions, action.emotion],
      };
    }
    case "REMOVE_CUSTOM_EMOTION": {
      return {
        ...state,
        customEmotions: state.customEmotions.filter(
          (e) => e.id !== action.id
        ),
      };
    }

    // STEP 4 actions (stickers placed by current voter on any participant's item)
    case "S4_ADD_STICKER": {
      const pid = state.currentParticipantId;
      const cur = state.participants[pid];
      const stickers = [...cur.step4.stickers, action.sticker];
      return {
        ...state,
        participants: {
          ...state.participants,
          [pid]: { ...cur, step4: { ...cur.step4, stickers } },
        },
      };
    }
    case "S4_REMOVE_STICKER": {
      const pid = state.currentParticipantId;
      const cur = state.participants[pid];
      const stickers = cur.step4.stickers.filter((s) => s.id !== action.id);
      return {
        ...state,
        participants: {
          ...state.participants,
          [pid]: { ...cur, step4: { ...cur.step4, stickers } },
        },
      };
    }

    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("failed to persist state", e);
    }
  }, [state]);

  // Bidirectional sync with Firestore (listen + debounced writes)
  useFirebaseSync(state, dispatch);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useCustomComponents() {
  const { state } = useStore();
  return state.customComponents;
}

export function useCustomEmotions() {
  const { state } = useStore();
  return state.customEmotions;
}

export function useCurrentParticipant() {
  const { state } = useStore();
  if (!state.currentParticipantId) return null;
  return state.participants[state.currentParticipantId] ?? null;
}
