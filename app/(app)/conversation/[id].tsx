import {
  ConversationHeader,
  MessageInput,
  MessageInputHandles,
  MessagesList,
} from "@/features/chat/components";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useChatConversation } from "@/features/chat/hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassBackground } from "@/components";
import { BlurView } from "expo-blur";

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
  useAuth();
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const messageInputRef = useRef<MessageInputHandles>(null);
  const isIOS26Plus = Platform.OS === "ios" && parseFloat(Platform.Version as string) >= 26;

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const { messages, loading, sending, sendMessage, loadMore, hasMore, isLoadingMore } =
    useChatConversation(userId || "");

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

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle("dark-content", true);
      return () => {};
    }, []),
  );

  return (
    <View style={styles.container}>
      <GlassBackground />
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <ConversationHeader
          userName={displayName}
          userAvatar={displayAvatar}
          topInset={insets.top}
        />

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <View style={styles.messagesWrapper}>
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
                <MessagesList
                  messages={messages}
                  loadMore={loadMore}
                  hasMore={hasMore}
                  isLoadingMore={isLoadingMore}
                />
              )}
            </View>
          </View>

          <BlurView
            intensity={80}
            tint="light"
            style={[
              styles.inputWrapper,
              // eslint-disable-next-line react-native/no-inline-styles
              { paddingBottom: isKeyboardVisible ? 10 : isIOS26Plus ? 35 : 0 },
            ]}
          >
            <TouchableWithoutFeedback onPress={() => messageInputRef.current?.focus()}>
              <View style={styles.inputDump}>
                <View
                  style={[
                    styles.inputActiveContainer,
                    { paddingBottom: Math.max(insets.bottom, 20) },
                  ]}
                >
                  <MessageInput
                    ref={messageInputRef}
                    key={userId}
                    onSend={handleSendMessage}
                    sending={sending}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </BlurView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesWrapper: {
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
  inputWrapper: {
    backgroundColor: "transparent",
  },
  inputDump: {
    width: "100%",
    height: 110,
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 9999,
  },
  inputActiveContainer: {
    backgroundColor: "transparent",
    width: "100%",
  },
  topSafeArea: {
    backgroundColor: "transparent",
  },
});
