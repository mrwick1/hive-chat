import { Timestamp } from "firebase/firestore";

export interface User {
  username: string;
  email: string;
  avatar: string;
  about: string;
  id: string;
  status: string;
  blocked: string[];
}

export interface Message {
  senderId: string | undefined;
  text: string;
  img?: string;
  createdAt: Timestamp;
  editable: boolean;
}

export interface ChatData {
  chatId: string;
  lastMessage: string;
  isSeen: boolean;
  updatedAt: number;
}

export interface UserChatsData {
  chats: ChatData[];
}

export interface ChatItem {
  username: string;
  receiverId: string;
  chatId: string;
  lastMessage: string;
  updatedAt: number;
  user: User;
  isSeen: boolean;
}
