import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDM7yJo55287dt9InWcrFvv7_JNMgjTXtU",
  authDomain: "multi-platform-decision-pd.firebaseapp.com",
  projectId: "multi-platform-decision-pd",
  storageBucket: "multi-platform-decision-pd.firebasestorage.app",
  messagingSenderId: "568377592330",
  appId: "1:568377592330:web:368f6c0c0b819ff3082df3",
  measurementId: "G-ZZHT9W16W9",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Firestore layout used by this prototype:
//   participants/{participantId}                 ← per-participant session doc
//   workshop/global                              ← shared customComponents + customEmotions

export const PARTICIPANTS = "participants";
export const WORKSHOP = "workshop";
export const WORKSHOP_GLOBAL = "global";

export function safeParticipantId(name) {
  // Firestore doc IDs cannot contain '/' and a few control chars; trim + collapse spaces.
  return name.trim().replace(/\s+/g, " ").replace(/[\/\.\#\[\]]/g, "_").slice(0, 200);
}
