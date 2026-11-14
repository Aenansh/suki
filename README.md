# Suki 🐰

Suki is a shame-free, gamified sugar-intake tracker for iOS and Android, built with React Native and Expo. It helps users manage sugar intake without turning an over-limit day into a failure. Instead of a punitive habit app, Suki focuses on recovery, actionable next steps, and Suki Points as a positive resource to manage rather than a forbidden thing.

The app is intentionally local-first in v1: there is no backend, no user accounts, and no cloud sync. Optional AI features are powered by a Google Gemini API key that the user provides on-device.

## What the project is

Suki exists to solve a specific problem: most sugar trackers feel like punishment or break a streak on a bad day. Suki changes that by combining:

- no-guilt recovery flow for over-limit days
- always-actionable craving support via SOS flows
- gamified Suki Points for earning and redemption
- a warm, encouraging tone instead of shame-based copy

This is an app for people who want practical sugar awareness without all-or-nothing failure loops.

## Current implementation status

The repository already includes a substantial working foundation for the app. The features below are implemented in the code now:

### Core app and onboarding

- Expo Router app structure with onboarding screens and tab navigation
- first-run onboarding for daily limit, goal, and optional Gemini API key
- splash/loading flow with local DB initialization and onboarding gate
- settings screen for app preferences and Gemini API key management

### Sugar tracking

- daily sugar logging workflow
- food + quantity entry flow
- sugar estimation via Google Gemini when an API key is configured
- frequent-pick caching to avoid repeated AI calls for common foods
- manual fallback experience when AI is unavailable or the key is missing
- entry editing and deletion within the supported window

### Recovery and motivation

- over-limit recovery flow instead of guilt-heavy failure screens
- SOS craving mode with a lightweight swap suggestion flow
- 10-minute breathing/timer flow to help users ride out cravings
- streak logic that does not punish a user for going over budget
- Suki Points system with daily earning and redemption logic

### History and progression

- history view with month calendar and recent 7-day trends
- daily summary calculations based on budget-relevant entries
- badge checks and progression milestones
- local persistent state using SQLite + Zustand

### Technical implementation

- React Native + Expo app built with TypeScript
- `expo-sqlite` for structured local storage
- `expo-secure-store` for the Gemini API key only
- AsyncStorage for lightweight preferences
- Zustand for local state management
- optional Gemini integration for food estimates and craving swaps

## What is still left to implement / outstanding work

The repository is not a finished, production-ready app yet. The major remaining work includes:

- photo-based food logging / image recognition
- reminder notifications
- release packaging and verification for Android and iOS
- expanded test coverage and validation across edge cases
- ongoing maintenance of the pinned Gemini model version as Google updates/deprecates models
- polish and hardening for edge conditions in DB state, onboarding flows, and offline behavior

The project intentionally does not have a v1 backend, user auth, social features, or full macro tracking. The product scope remains focused on sugar awareness, no-guilt tracking, and local-first behavior.

## Tech stack

- React Native + Expo SDK
- Expo Router
- TypeScript
- Zustand
- `expo-sqlite`
- `expo-secure-store`
- AsyncStorage
- Google Gemini API (optional, BYO key)
- Jest + jest-expo

## Run locally

### Install

```bash
npm install
```

### Start the app

```bash
npx expo start
```

You can also use the platform shortcuts:

```bash
npm run android
npm run ios
npm run web
```

### Gemini API key

AI-powered sugar estimation and swap suggestions require a valid Gemini API key. The app allows users to enter and manage that key in Settings or onboarding. If no key is set, the app gracefully falls back to manual inputs and offline-safe suggestions.

## Testing and linting

```bash
npm test
npm run lint
```

## Data and privacy

Suki v1 is local-first and stores app data on-device. There is no Suki-hosted backend or user account system in the current version. When AI features are used, the relevant food or craving text is sent to the Google Gemini API for that request.

## Contributing

This project is open-source and intentionally product-focused on supportive, non-punitive habit tracking. If you contribute, keep the core philosophy in mind: no guilt, concrete next steps, and positive reinforcement over punishment.
