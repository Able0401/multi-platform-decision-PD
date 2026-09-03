# Multi-Platform Decision — Participatory Design Toolkit

A browser-based participatory design (PD) study toolkit built for a user-centered design study on **how people in their 20s discover and decide on places** (restaurants, cafes) when the decision is spread across multiple apps — Naver Map, Instagram, KakaoTalk, and more.

Built as a study prototype for the **User-Centered Design (UCD)** course at KAIST Industrial Design (Spring 2026).

## Motivation

Choosing where to eat rarely happens in one app. A typical journey bounces between Instagram (discovery), Naver Map (reviews, distance), KakaoTalk (group negotiation), and back again. Each hop loses context, and the overall experience "works" only because users manually stitch it together. This study uses participatory design to understand that fragmented journey from the inside — and to co-create a UX direction that makes the bouncing less broken.

## What the toolkit does

Participants complete three structured activities (~60 minutes total) in a guided, bilingual (EN/KO) web interface:

| Step | Activity | What participants do |
|---|---|---|
| 1 | **Guided intro** | Four short pages grounding the session in the design goal, study goal, and design situation |
| 2 | **Journey timeline** | Reconstruct a recent real decision as a card timeline — which app, what they did there, why they switched — with inline memos |
| 3 | **Design canvas** | Compose their "ideal" decision experience from component cards (search, reviews, group chat, map…) plus custom components and emotion tags |
| 4 | **Compare & discuss** | Review their timeline against their ideal canvas and record structured discussion notes on the gaps |

A separate **admin view** lets the researcher set the session topic, inject custom components/emotions mid-session, and watch all participants' artifacts live.

## Architecture

- **React + Vite**, Tailwind-style utility CSS
- **Firebase Firestore** for real-time multi-participant sync (`src/state/firebaseSync.js`); every action is mirrored so the researcher sees artifacts as they are created
- **localStorage** session persistence so a dropped connection or refresh doesn't lose participant work
- Single-page state machine (`src/state/store.jsx`): `entry → intro → participant (steps 2–4)`, with `admin` as a parallel mode

## Running locally

```bash
npm install
npm run dev
```

Add your own Firebase project config in `src/firebase.js` (the committed config is scoped to the study instance).

## Study context

This prototype was used to run in-person PD sessions; the resulting timelines, canvases, and discussion notes were analyzed as part of a four-study sequence in the UCD course. The study artifacts themselves (participant data) are not part of this repository.

## Author

Hyun Seung Moon — Ph.D. student, KAIST Industrial Design (AI Experience Lab)
[hyunseungmoon.net](https://hyunseungmoon.net) · [GitHub](https://github.com/Able0401)
