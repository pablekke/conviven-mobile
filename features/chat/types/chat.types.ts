export type MessageStatus = "sent" | "delivered" | "read" | "pending" | "error";

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

// UI Types (kept for compatibility)
export interface ChatPreview {
  id: string;
  conversationId: string;
  name: string;
  lastMessage: string;
  lastMessageStatus?: MessageStatus;
  lastMessageSenderId?: string;
  time: string;
  unread: number;
  avatar: string;
  updatedAt?: string;
  userFullInfo?: ChatUser;
}

export type ChatMessage = Message & { timestamp: Date }; // UI adds timestamp as Date object

export interface Match {
  id: string;
  name: string;
  avatar: string;
  age?: number;
  hasConversation?: boolean;
}
