import { MessageStatus } from "../enums";

export { MessageStatus };

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export interface LocationInfo {
  neighborhood: {
    id: string;
    name: string;
  };
  city: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  };
}

export interface ProfileAttributes {
  about?: string;
  occupation?: string;
  interests?: string[];
  [key: string]: unknown;
}

export interface SearchPreferencesAttributes {
  ageMin?: number;
  ageMax?: number;
  maxDistance?: number;
  [key: string]: unknown;
}

export interface SearchFiltersAttributes {
  gender?: Gender[];
  hasPhoto?: boolean;
  [key: string]: unknown;
}

export interface ConversationUser {
  id: string;
  email: string;
  historicalEmail: string | null;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: string;
  desirabilityRating: number;
  role: string;
  status: string;
  location: LocationInfo | null;
  profile: ProfileAttributes | null;
  preferences: SearchPreferencesAttributes | null;
  filters: SearchFiltersAttributes | null;
  photoUrl: string | null;
  secondaryPhotoUrls: string[];
  lastLoginAt: Date | null;
  discardedAt: Date | null;
}

export interface ConversationLastMessage {
  id: string;
  content: string;
  senderId: string;
  status: MessageStatus;
  createdAt: string;
}

export interface ConversationResponse {
  id: string;
  otherUser: ConversationUser;
  lastMessage: ConversationLastMessage;
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

export type ChatMessage = Message & { timestamp: Date };

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
  userFullInfo?: ConversationUser;
}

export interface Match {
  id: string;
  name: string;
  avatar: string;
  age?: number;
  hasConversation?: boolean;
}

export interface MatchNotification {
  type: "NEW_MATCH";
  matchId: string;
  userId: string;
  matchedUserId: string;
  timestamp: Date;
}
