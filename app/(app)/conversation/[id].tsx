import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { GlassBackground } from "@/components/GlassBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChatConversation } from "@/features/chat/hooks";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useCallback, useState } from "react";
import Spinner from "@/components/Spinner";
import {
  ConversationHeader,
  MessageInput,
  MessagesList,
  PartnerProfileOverlay,
} from "@/features/chat/components";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
  Text,
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

  const { messages, loading, sending, sendMessage, error, refreshMessages } = useChatConversation(
    userId || "",
    name,
    avatar,
  );

  const [isProfileVisible, setIsProfileVisible] = useState(false);

  if (error) {
    console.error("ConversationScreen Error:", error);
  }

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  const handleRetry = async () => {
    try {
      await refreshMessages();
    } catch (error) {
      console.error("Error al reintentar:", error);
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <GlassBackground intensity={90} />
      <StatusBar barStyle="dark-content" />
      <ConversationHeader
        userName={displayName}
        userAvatar={displayAvatar}
        onProfilePress={() => setIsProfileVisible(true)}
      />

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
            ) : error ? (
              <View style={styles.loadingContainer}>
                <View style={styles.errorContainer}>
                  <Text style={styles.errorTitle}>
                    Error: {error.message || "Error al cargar mensajes"}
                  </Text>
                  <Text style={styles.errorSubtitle}>Revisa tu conexión a internet</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <MessagesList messages={messages} currentUserId={user?.id ?? ""} />
            )}
          </View>
        </TouchableWithoutFeedback>

        <MessageInput key={userId} onSend={handleSendMessage} sending={sending} />
      </KeyboardAvoidingView>

      <PartnerProfileOverlay
        isVisible={isProfileVisible}
        onClose={() => setIsProfileVisible(false)}
        userId={userId || ""}
      />
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
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorTitle: {
    color: "#ef4444",
    textAlign: "center",
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    color: "#666",
    textAlign: "center",
    fontFamily: "Inter-Regular",
    fontSize: 14,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
  },
});
