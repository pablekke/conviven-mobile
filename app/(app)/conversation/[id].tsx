import { ConversationHeader, MessageInput, MessagesList } from "@/features/chat/components";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChatConversation } from "@/features/chat/hooks";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";
import { useCallback } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

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

  const displayName = name!;
  const displayAvatar =
    avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563EB&color=fff`;

  // Actualizar StatusBar cuando esta pantalla está enfocada
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle("dark-content", true);
      return () => {};
    }, []),
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle="dark-content" />
      <ConversationHeader userName={displayName} userAvatar={displayAvatar} />

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
