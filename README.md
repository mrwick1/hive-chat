# HiveChat

A real-time chat application built with React, TypeScript, Firebase, and Zustand. Features user authentication, media sharing, message editing, emoji support, and live presence indicators.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## Features

- **Real-time Messaging** — Instant message delivery with Firebase Firestore snapshot listeners
- **Authentication** — Email/password sign up and login with Firebase Auth
- **Media Sharing** — Upload and send images in conversations via Cloud Storage
- **Message Management** — Edit and delete sent messages (15-minute edit window)
- **User Search** — Find and start conversations with other users
- **Online Presence** — Live status indicators (Online, Away, Offline) with colored dots
- **User Profiles** — Editable "about" section and avatar uploads
- **Block/Unblock** — Block users to prevent unwanted messages
- **Emoji Picker** — Rich emoji support in the message composer
- **Dark Theme** — Swiss Precision design language with sharp edges and monospaced accents
- **Toast Notifications** — Feedback for user actions via React Toastify

## Design Language

HiveChat uses the **Swiss Precision** design system:

- **Typography** — Space Grotesk (body) + JetBrains Mono (timestamps, status labels)
- **Colors** — `#0A0A0A` background, `#E8E8E8` foreground, `#0055FF` accent
- **Geometry** — Sharp corners (0 border-radius), 1px borders, 8px spacing grid
- **Icons** — Lucide React (tree-shaken SVG icons)

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn (via Corepack: `corepack enable`)
- A Firebase project with Auth, Firestore, and Storage enabled

### Setup

```bash
git clone https://github.com/mrwick1/hive-chat.git
cd hive-chat
yarn install
cp .env.example .env
```

Add your Firebase config values to `.env`:

```env
VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_project.appspot.com
VITE_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id
```

Then start the dev server:

```bash
yarn dev
```

### Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password provider)
3. Create a **Firestore Database**
4. Enable **Cloud Storage**
5. Copy your web app config values to `.env`

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start dev server |
| `yarn build` | Type-check and build for production |
| `yarn lint` | Run ESLint |
| `yarn preview` | Preview production build |

## Tech Stack

- **React 19** + **TypeScript 5.7** — Type-safe component architecture
- **Vite 6** — Fast development server and optimized builds
- **Firebase 10** — Authentication, Firestore (real-time DB), Cloud Storage
- **Zustand** — Lightweight client-side state management
- **Tailwind CSS 3** — Utility-first styling with Swiss Precision tokens
- **Lucide React** — Tree-shaken SVG icon library
- **Emoji Picker React** — Emoji selection component
- **React Toastify** — Toast notification system

## Project Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── Chat.tsx              # Container — Firebase listeners, send/edit/delete logic
│   │   ├── ChatHeader.tsx        # Avatar, name, status indicator, info toggle
│   │   ├── MessageList.tsx       # Message loop, date separators, auto-scroll
│   │   ├── MessageBubble.tsx     # Single message: text/image, timestamp, menu
│   │   ├── MessageContextMenu.tsx # Edit/Delete dropdown for own messages
│   │   └── ChatInput.tsx         # Text input, emoji picker, image upload
│   ├── detail/                   # User detail panel, block/unblock
│   ├── list/
│   │   ├── chatList/             # Chat list, search, add user dialog
│   │   └── userInfo/             # User profile display
│   ├── login/                    # Sign up and login forms
│   └── notification/             # Toast notification container
├── lib/
│   ├── firebase.ts               # Firebase SDK initialization
│   ├── userStore.ts              # Zustand store for auth state
│   ├── chatStore.ts              # Zustand store for active chat
│   └── upload.ts                 # Cloud Storage upload helper
├── types/
│   └── index.ts                  # Shared TypeScript interfaces
├── utils/
│   └── date.ts                   # Date formatting helpers
└── App.tsx                       # Root component with auth routing
```

## Architecture

The app uses Zustand for client-side state with two stores: `userStore` for authentication state and `chatStore` for the active conversation. Firebase Firestore provides real-time data synchronization through `onSnapshot` listeners, enabling instant message delivery without polling. User presence is tracked via window focus/blur events.

The chat interface is decomposed into focused components — `Chat.tsx` acts as a container that holds Firebase logic and state, while `ChatHeader`, `MessageList`, `MessageBubble`, `ChatInput`, and `MessageContextMenu` handle rendering through props.

## License

[MIT](LICENSE)
