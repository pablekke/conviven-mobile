import { User } from "../../../types/user";

export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "error" | (string & object);

export interface UserShort {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
}

export interface ChatUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  secondaryPhotoUrls?: string[] | null;
  birthDate?: string | null;
  gender?: string | null;
}

export interface LastMessage {
  id: string;
  content: string;
  senderId: string;
  status: MessageStatus;
  createdAt: string;
}

export interface Conversation {
  id: string;
  otherUser: UserShort;
  otherUserFull?: ChatUser;
  lastMessage?: LastMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  liked: boolean;
}

export interface PaginatedMessagesResponse {
  messages: Message[];
  hasMore: boolean;
  oldestMessageId: string | null;
}

// UI Types (kept for compatibility)
export interface ChatPreview {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageStatus?: MessageStatus;
  time: string;
  unread: number;
  avatar: string;
  updatedAt?: string;
  userFullInfo?: UserShort;
  conversationId: string;
}

export type ChatMessage = Message & { timestamp: Date };

export interface Match {
  id: string;
  name: string;
  avatar: string;
  age?: number;
  hasConversation?: boolean;
}

export interface MatchItemResponse {
  active: boolean;
  user: User;
  score: number;
  photosCount: number;
  profileCompletionRate: number;
  lastActiveDays: number;
}

export interface MatchResponse {
  count: number;
  items: MatchItemResponse[];
}

// WebSocket Payload Types

export interface SendMessagePayload {
  recipientId: string;
  content: string;
}

export interface IncomingMessagePayload {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  liked: boolean;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WebSocketErrorDetails {
  field: string;
  message: string;
}

export interface WebSocketErrorPayload {
  error: string;
  details?: WebSocketErrorDetails[];
}

export type WebSocketConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";
