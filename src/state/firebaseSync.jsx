import { useEffect, useRef } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  db,
  PARTICIPANTS,
  WORKSHOP,
  WORKSHOP_GLOBAL,
} from "../firebase";

// Subscribes to Firestore + writes the current participant's data and the
// workshop globals on local change. Single hook called from StoreProvider.
//
// Conflict policy: last-write-wins, no merge logic. Single laptop per
// participant is the assumed setup.

export function useFirebaseSync(state, dispatch) {
  // 1) Subscribe to all participants
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, PARTICIPANTS),
      (snap) => {
        const participants = {};
        snap.forEach((d) => {
          participants[d.id] = d.data();
        });
        dispatch({ type: "SYNC_REMOTE_PARTICIPANTS", participants });
      },
      (err) => console.warn("[firebase] participants listener error:", err)
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Subscribe to workshop globals (custom components/emotions)
  useEffect(() => {
    const ref = doc(db, WORKSHOP, WORKSHOP_GLOBAL);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.data() ?? {};
        dispatch({
          type: "SYNC_REMOTE_GLOBALS",
          customComponents: Array.isArray(data.customComponents)
            ? data.customComponents
            : [],
          customEmotions: Array.isArray(data.customEmotions)
            ? data.customEmotions
            : [],
          topic: data.topic ?? "",
        });
      },
      (err) => console.warn("[firebase] globals listener error:", err)
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3) Write the current participant on changes (debounced)
  const lastParticipantWrite = useRef({});
  useEffect(() => {
    const pid = state.currentParticipantId;
    if (!pid) return;
    const data = state.participants[pid];
    if (!data) return;
    const json = JSON.stringify(data);
    if (lastParticipantWrite.current[pid] === json) return;

    const t = setTimeout(() => {
      lastParticipantWrite.current[pid] = json;
      const payload = { ...data, _updatedAt: serverTimestamp() };
      setDoc(doc(db, PARTICIPANTS, pid), payload).catch((err) =>
        console.warn("[firebase] participant write error:", err)
      );
    }, 400);
    return () => clearTimeout(t);
  }, [state.currentParticipantId, state.participants]);

  // 4) Write workshop globals on changes (debounced)
  const lastGlobalsWrite = useRef("");
  useEffect(() => {
    const data = {
      customComponents: state.customComponents,
      customEmotions: state.customEmotions,
      topic: state.topic,
    };
    const json = JSON.stringify(data);
    if (lastGlobalsWrite.current === json) return;

    const t = setTimeout(() => {
      lastGlobalsWrite.current = json;
      setDoc(doc(db, WORKSHOP, WORKSHOP_GLOBAL), {
        ...data,
        _updatedAt: serverTimestamp(),
      }).catch((err) =>
        console.warn("[firebase] globals write error:", err)
      );
    }, 400);
    return () => clearTimeout(t);
  }, [state.customComponents, state.customEmotions, state.topic]);
}
