import { ChatPreview } from "../../features/chat/types";
import { Image } from "react-native";

export const preloadChatAvatars = async (chats: ChatPreview[]) => {
  const avatarUrls = chats
    .map(chat => chat.avatar)
    .filter(
      (url): url is string => !!url && url.trim().length > 0 && !url.includes("ui-avatars.com"),
    );

  const preloadPromises = avatarUrls.map(url => Image.prefetch(url).catch(() => {}));
  await Promise.allSettled(preloadPromises);
};

export const createTimeoutPromise = (errorMessage: string, ms: number = 5000) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });
};
