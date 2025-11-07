import { useLocalSearchParams } from "expo-router";

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Spinner from "@/components/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ConversationHeader, MessageInput, MessagesList } from "@/features/chat/components";
import { useChatConversation } from "@/features/chat/hooks";

export default function ConversationScreen() {
  const {
    id: userId,
    name,
    avatar,
  } = useLocalSearchParams<{
    id: string;
    name?: string;
    avatar?: string;
  }>();
  const { colors } = useTheme();
  const { user } = useAuth();

  const { messages, loading, sending, sendMessage } = useChatConversation(userId || "");

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  // Determinar el avatar y nombre del usuario
  const displayName = name ?? "Usuario";
  const displayAvatar =
    avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563EB&color=fff`;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ConversationHeader userName={displayName} userAvatar={displayAvatar} isOnline={false} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.messagesContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Spinner
                  size={52}
                  color={colors.conviven.blue}
                  trackColor="rgba(37, 99, 235, 0.15)"
                  thickness={5}
                />
              </View>
            ) : (
              <MessagesList messages={messages} currentUserId={user?.id ?? ""} />
            )}
          </View>
        </TouchableWithoutFeedback>

        <MessageInput key={userId} onSend={handleSendMessage} sending={sending} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
