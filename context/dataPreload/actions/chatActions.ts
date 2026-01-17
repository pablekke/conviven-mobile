import { getCachedValue } from "../../../services/resilience/cache";
import { preloadChatAvatars, createTimeoutPromise } from "../utils";
import { chatService } from "../../../features/chat/services";
import { ChatPreview } from "../../../features/chat/types";
import { DataPreloadState } from "../types";
import React from "react";

export const loadChatsAction = async (
  setState: React.Dispatch<React.SetStateAction<DataPreloadState>>,
  forceRefresh: boolean = false,
) => {
  try {
    if (!forceRefresh) {
      const cachedChats = await getCachedValue<ChatPreview[]>("/messages/me/conversations");
      if (cachedChats && Array.isArray(cachedChats)) {
        setState(prev => ({
          ...prev,
          chats: [...cachedChats].sort((a, b) => {
            const dateA = new Date(a.updatedAt || 0).getTime();
            const dateB = new Date(b.updatedAt || 0).getTime();
            return dateB - dateA;
          }),
          chatsLoading: false,
          chatsError: null,
          chatsLastUpdated: Date.now(),
        }));
        preloadChatAvatars(cachedChats).catch(() => {});

        // Background refresh
        chatService
          .getConversations()
          .then(conversations => {
            // Aseguramos orden cronológico en el background switch
            const sorted = [...conversations].sort((a, b) => {
              const dateA = new Date(a.updatedAt || 0).getTime();
              const dateB = new Date(b.updatedAt || 0).getTime();
              return dateB - dateA;
            });
            setState(prev => ({
              ...prev,
              chats: sorted,
              chatsLastUpdated: Date.now(),
            }));
            preloadChatAvatars(sorted).catch(() => {});
          })
          .catch(error => {
            console.error("Error refreshing chats in background:", error);
          });
        return;
      }
    }
    setState(prev => ({ ...prev, chatsLoading: true, chatsError: null }));

    const timeoutPromise = createTimeoutPromise("Chats timeout", 5000);

    const conversations = (await Promise.race([
      chatService.getConversations(),
      timeoutPromise,
    ])) as ChatPreview[];

    const sorted = [...conversations].sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();
      return dateB - dateA;
    });

    setState(prev => ({
      ...prev,
      chats: sorted,
      chatsLoading: false,
      chatsError: null,
      chatsLastUpdated: Date.now(),
    }));

    preloadChatAvatars(conversations).catch(() => {});
  } catch (error) {
    console.error("Error precargando chats:", error);
    setState(prev => ({
      ...prev,
      chats: [],
      chatsLoading: false,
      chatsError: error instanceof Error ? error : new Error("Error desconocido"),
      chatsLastUpdated: null,
    }));
  }
};
