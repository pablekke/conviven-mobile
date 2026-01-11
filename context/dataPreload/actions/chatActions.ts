import { getCachedValue } from "../../../services/resilience/cache";
import { preloadChatAvatars, createTimeoutPromise } from "../utils";
import { ChatService } from "@/features/chat/services/chatService";
import { chatService, } from "../../../features/chat/services";
import { ChatPreview } from "../../../features/chat/types";
import { DataPreloadState } from "../types";
import React from "react";

export const loadChatsAction = async (
  setState: React.Dispatch<React.SetStateAction<DataPreloadState>>,
  forceRefresh: boolean = false,
  silent: boolean = false,
) => {
  try {
    if (!forceRefresh) {
      const cachedData = await getCachedValue<any[]>("/messages/me/conversations");
      if (cachedData && Array.isArray(cachedData)) {
        const mappedChats = cachedData
          .filter(conv => conv.lastMessage)
          .map(conv => ChatService.mapResponseToPreview(conv));

        setState(prev => ({
          ...prev,
          chats: mappedChats,
          chatsLoading: false,
          chatsError: null,
          chatsLastUpdated: Date.now(),
        }));
        preloadChatAvatars(mappedChats).catch(() => {});

        // Background refresh
        chatService
          .getConversations(true)
          .then(conversations => {
            setState(prev => ({
              ...prev,
              chats: conversations,
              chatsLastUpdated: Date.now(),
            }));
            preloadChatAvatars(conversations).catch(() => {});
          })
          .catch(error => {
            console.error("Error refreshing chats in background:", error);
          });
        return;
      }
    }

    if (!silent) {
      setState(prev => ({ ...prev, chatsLoading: true, chatsError: null }));
    }

    const timeoutPromise = createTimeoutPromise("Chats timeout", 15000);

    const conversations = (await Promise.race([
      chatService.getConversations(forceRefresh),
      timeoutPromise,
    ])) as ChatPreview[];

    setState(prev => ({
      ...prev,
      chats: conversations,
      chatsLoading: false,
      chatsError: null,
      chatsLastUpdated: Date.now(),
    }));

    preloadChatAvatars(conversations).catch(() => {});
  } catch (error) {
    console.error("Error precargando chats:", error);
    if (!silent) {
      setState(prev => ({
        ...prev,
        chats: [],
        chatsLoading: false,
        chatsError: error instanceof Error ? error : new Error("Error desconocido"),
        chatsLastUpdated: null,
      }));
    }
  }
};
