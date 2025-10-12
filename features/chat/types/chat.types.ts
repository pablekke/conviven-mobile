import { MessageStatus } from "../enums";

export interface ChatPreview {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageStatus?: MessageStatus;
  time: string;
  unread: number;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: MessageStatus;
  deliveredAt?: Date;
  readAt?: Date;
  timestamp: Date;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: Date;
}
