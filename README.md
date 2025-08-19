# HiveChat

A real-time chat application built with React, TypeScript, Firebase, and Zustand. Features user authentication, media sharing, message editing, emoji support, and live presence indicators.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

<!-- ![HiveChat Screenshot](docs/screenshot.png) -->

## Features

- **Real-time Messaging** — Instant message delivery with Firebase Firestore snapshot listeners
- **Authentication** — Email/password sign up and login with Firebase Auth
- **Media Sharing** — Upload and send images in conversations via Cloud Storage
- **Message Management** — Edit and delete sent messages
- **User Search** — Find and start conversations with other users
- **Online Presence** — Live status indicators (Online, Away, Offline)
- **User Profiles** — Editable "about" section and avatar uploads
- **Block/Unblock** — Block users to prevent unwanted messages
- **Emoji Picker** — Rich emoji support in the message composer
- **Dark Theme** — Sleek dark UI with custom Tailwind color palette
- **Toast Notifications** — Feedback for user actions via React Toastify

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Auth, Firestore, and Storage enabled

### Setup

```bash
git clone https://github.com/mrwick1/hive-chat.git
cd hive-chat
npm install
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
npm run dev
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
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Tech Stack

- **React 18** + **TypeScript** — Type-safe component architecture
- **Firebase** — Authentication, Firestore (real-time DB), Cloud Storage
- **Zustand** — Lightweight client-side state management
- **Tailwind CSS** — Utility-first styling with custom dark theme
- **Vite** — Fast development server and optimized builds
- **React Toastify** — Toast notification system
- **Emoji Picker React** — Emoji selection component

## Project Structure

```
src/
├── components/
│   ├── chat/           # Main chat interface, messages, emoji picker
│   ├── detail/         # User detail panel, block/unblock
│   ├── list/
│   │   ├── chatList/   # Chat list, search, add user dialog
│   │   └── userInfo/   # User profile display
│   ├── login/          # Sign up and login forms
│   └── notification/   # Toast notification container
├── lib/
│   ├── firebase.ts     # Firebase SDK initialization
│   ├── userStore.ts    # Zustand store for auth state
│   ├── chatStore.ts    # Zustand store for active chat
│   └── upload.ts       # Cloud Storage upload helper
└── App.tsx             # Root component with auth routing
```

## Architecture

The app uses Zustand for client-side state with two stores: `userStore` for authentication state and `chatStore` for the active conversation. Firebase Firestore provides real-time data synchronization through `onSnapshot` listeners, enabling instant message delivery without polling. User presence is tracked via window focus/blur events.

## License

[MIT](LICENSE)
