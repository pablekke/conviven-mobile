import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState, useEffect } from "react";
import { Platform, StyleSheet, TextInput, TouchableOpacity, View, Keyboard } from "react-native";

import Spinner from "../../../components/Spinner";

export interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  sending?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  sending = false,
}) => {
  const [message, setMessage] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleSend = () => {
    if (message.trim() && !disabled && !sending) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const canSend = message.trim().length > 0 && !disabled && !sending;

  // Dynamic padding: If keyboard is visible, use standard padding (12).
  // If keyboard is closed and it's iOS, use extra padding (84).
  // Otherwise use standard padding.
  const bottomPadding = isKeyboardVisible ? 12 : Platform.OS === "ios" ? 84 : 12;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.inputContainer}>
        {Platform.OS === "android" && (
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => inputRef.current?.focus()}
          >
            <Ionicons name="happy-outline" size={24} color="#64748B" />
          </TouchableOpacity>
        )}

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#94A3B8"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={1000}
          editable={!disabled && !sending}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          returnKeyType={Platform.OS === "ios" ? "default" : "none"}
          textAlignVertical="center"
        />

        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Ionicons name="attach-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.sendButton, canSend && styles.sendButtonActive]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.7}
      >
        {sending ? (
          <Spinner size={20} color="#fff" trackColor="rgba(255, 255, 255, 0.3)" thickness={3} />
        ) : (
          <Ionicons name="send" size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 24,
    paddingHorizontal: 8,
    minHeight: 44,
    maxHeight: 100,
  },
  iconButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter-Regular",
    color: "#0F172A",
    paddingTop: Platform.OS === "ios" ? 12 : 8,
    paddingBottom: Platform.OS === "ios" ? 12 : 8,
    paddingHorizontal: 8,
    maxHeight: 100,
    minHeight: 44,
    lineHeight: Platform.OS === "ios" ? 20 : undefined,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#94A3B8",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sendButtonActive: {
    backgroundColor: "#2563EB",
  },
});
