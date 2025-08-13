# HiveChat

A real-time chat application built with React, TypeScript, Firebase, and Zustand. Features authentication, media sharing, message editing, and real-time presence indicators.


![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

## Features

- **Real-time Messaging** — Instant message delivery with Firebase Firestore
- **Authentication** — Email/password sign up and login with Firebase Auth
- **Media Sharing** — Send images and files in conversations
- **Message Management** — Edit and delete sent messages
- **User Search** — Find and connect with other users
- **Online Status** — Real-time presence indicators
- **Dark Theme** — Sleek dark UI designed for extended use
- **Emoji Picker** — Rich emoji support in messages

## Tech Stack

- **React 18** + **TypeScript** — Type-safe component architecture
- **Firebase** — Auth, Firestore, and Cloud Storage
- **Zustand** — Lightweight state management
- **Tailwind CSS** — Utility-first styling
- **Vite** — Fast development server and builds
- **React Toastify** — Toast notifications

## Getting Started

```bash
git clone https://github.com/mrwick1/hive-chat.git
cd hive-chat
npm install
cp .env.example .env
# Add your Firebase config values to .env
npm run dev
```

### Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Create a **Firestore Database**
4. Enable **Cloud Storage**
5. Copy your config values to `.env`

## Architecture

The app uses Zustand for client-side state management with two stores: `userStore` for authentication state and `chatStore` for active conversations. Firebase Firestore provides real-time data synchronization through snapshot listeners, enabling instant message delivery without polling.

## License

MIT
