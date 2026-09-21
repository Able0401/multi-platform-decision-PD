import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3lvTJ7BDfJu4-IhPOiczRPx7-_J_KGmE",
  authDomain: "mpdt-demo-able0401.firebaseapp.com",
  projectId: "mpdt-demo-able0401",
  storageBucket: "mpdt-demo-able0401.firebasestorage.app",
  messagingSenderId: "686735906277",
  appId: "1:686735906277:web:263549020d80882402cb0c",
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
