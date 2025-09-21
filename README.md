# Late • On • Time • Pizza

Manage meeting groups and allocate pizza slices based on lateness. Modern UI built with React + TypeScript + Vite, custom CSS styling, framer-motion animations, and dark mode.

## Features

-   Groups, members, meetings, and running pizza balances
-   Lateness → slices via rule (ceil/log). 1 pizza = 6 slices
-   Meeting editor with quick +1/+5 and apply-to-all
-   Admin corrections (+/− slices) with reason
-   PizzaGauge component with ticks and smooth fill
-   Firebase Auth (email/password + Google sign-in) + Firestore or demo local storage
-   Beautiful glassmorphism UI with amber/orange theming

## Quick start (demo mode)

1. Copy `.env.example` to `.env` and keep PLACEHOLDER values to run in demo mode.
2. Install deps and run the dev server.

```sh
# macOS / zsh examples
npm i
npm run dev
```

Open http://localhost:5173 and click "Continue with Demo Mode" to try the app without authentication.

## Firebase setup (optional)

-   Create a Firebase project and enable Firestore, Storage, Authentication
-   Enable Email/Password and Google sign-in providers in Authentication
-   Fill `.env` with your Firebase web config keys
-   Deploy security rules from `firebase/firestore.rules` when you wire Firestore

## Authentication

The app supports two modes:

-   **Demo Mode**: Local storage data, no authentication required
-   **Firebase Mode**: Real authentication with email/password or Google sign-in

When Firebase is configured, users can:

-   Sign up with email and password
-   Sign in with existing email/password
-   Sign in with Google OAuth
-   Switch between authenticated and demo modes

## Tech

-   React 19, Vite 7, TypeScript 5
-   Pure CSS with glassmorphism effects and custom animations
-   framer-motion animations, lucide-react icons
-   React Router 7
-   Firebase 11 (Auth, Firestore, Analytics, Storage)

## Testing

-   Vitest for unit tests (pizza math). Run with `npm test` (after installing dev dependency `vitest`).

## Notes

-   Some features are marked PLACEHOLDER to keep the repo runnable without your credentials.
-   Replace the pizza PNG data URI in `src/components/PizzaGauge.tsx` when you add a real asset.
    You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:
