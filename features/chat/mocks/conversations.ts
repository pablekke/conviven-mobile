import { Conversation } from "../types/chat.types";

export const mockConversations: Conversation[] = [
  {
    id: "conv-2",
    otherUser: {
      id: "user-federico",
      firstName: "Federico",
      lastName: "",
      photoUrl: "https://i.pravatar.cc/300?img=12",
    },
    lastMessage: {
      id: "msg-3",
      content: "Bueno sigamos buscando...",
      senderId: "user-federico",
      status: "delivered",
      createdAt: "2023-10-27T08:12:00Z",
    },
    unreadCount: 1,
    createdAt: "2023-10-26T10:00:00Z",
    updatedAt: "2023-10-27T08:12:00Z",
  },
  {
    id: "conv-3",
    otherUser: {
      id: "user-fernanda",
      firstName: "Fernanda",
      lastName: "",
      photoUrl: "https://i.pravatar.cc/300?img=47",
    },
    lastMessage: {
      id: "msg-6",
      content: "¡Sí! Me parece ideal",
      senderId: "user-fernanda",
      status: "read",
      createdAt: "2023-10-27T10:30:00Z",
    },
    unreadCount: 0,
    createdAt: "2023-10-27T09:00:00Z",
    updatedAt: "2023-10-27T10:30:00Z",
  },
  {
    id: "conv-4",
    otherUser: {
      id: "user-agustin",
      firstName: "Agustin",
      lastName: "",
      photoUrl: "https://i.pravatar.cc/300?img=33",
    },
    lastMessage: {
      id: "msg-9",
      content: "Perfecto, nos vemos!",
      senderId: "me",
      status: "read",
      createdAt: "2023-10-27T11:15:00Z",
    },
    unreadCount: 0,
    createdAt: "2023-10-27T10:45:00Z",
    updatedAt: "2023-10-27T11:15:00Z",
  },
];
