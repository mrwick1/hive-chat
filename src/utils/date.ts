import { Timestamp } from "firebase/firestore";
import { Message } from "../types";

export const formatDate = (timestamp: Timestamp): string => {
  const messageDate = timestamp.toDate();
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  const isToday =
    messageDate.getDate() === today.getDate() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getFullYear() === today.getFullYear();

  const isYesterday =
    messageDate.getDate() === yesterday.getDate() &&
    messageDate.getMonth() === yesterday.getMonth() &&
    messageDate.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  else if (isYesterday) return "Yesterday";
  else if (messageDate.getFullYear() === today.getFullYear())
    return messageDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  else
    return messageDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
};

export const isDifferentDay = (
  currentMessage: Message,
  previousMessage?: Message
): boolean => {
  if (!previousMessage) return true;
  const currentDate = currentMessage.createdAt.toDate();
  const previousDate = previousMessage.createdAt.toDate();
  return (
    currentDate.getFullYear() !== previousDate.getFullYear() ||
    currentDate.getMonth() !== previousDate.getMonth() ||
    currentDate.getDate() !== previousDate.getDate()
  );
};
