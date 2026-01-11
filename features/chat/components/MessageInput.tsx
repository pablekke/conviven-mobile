import {
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import React, { useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { EmojiPicker } from "./EmojiPicker";

export interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  sending?: boolean;
}

export interface MessageInputHandles {
  focus: () => void;
}

export const MessageInput = React.forwardRef<MessageInputHandles, MessageInputProps>(
  ({ onSend, disabled = false, sending = false }, ref) => {
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef<TextInput>(null);

    React.useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
        setShowEmojiPicker(false);
      },
    }));

    const toggleEmojiPicker = () => {
      if (showEmojiPicker) {
        inputRef.current?.focus();
      } else {
        Keyboard.dismiss();
      }
      setShowEmojiPicker(!showEmojiPicker);
    };

    const handleEmojiSelect = (emoji: string) => {
      setMessage(prev => prev + emoji);
    };

    const handleSend = () => {
      if (message.trim() && !disabled && !sending) {
        onSend(message.trim());
        setMessage("");
      }
    };

    const canSend = message.trim().length > 0 && !disabled && !sending;

    return (
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={e => {
                  e.stopPropagation();
                  toggleEmojiPicker();
                }}
              >
                <Ionicons
                  name={showEmojiPicker ? "keypad-outline" : "happy-outline"}
                  size={24}
                  color={showEmojiPicker ? "#2563EB" : "#64748B"}
                />
              </TouchableOpacity>

              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#94A3B8"
                value={message}
                onChangeText={setMessage}
                onFocus={() => {
                  setShowEmojiPicker(false);
                }}
                multiline
                maxLength={1000}
                editable={!disabled && !sending}
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
                returnKeyType="default"
                textAlignVertical="center"
                enablesReturnKeyAutomatically
              />

              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={e => {
                  e.stopPropagation();
                  inputRef.current?.focus();
                }}
              >
                <Ionicons name="attach-outline" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>

          <TouchableOpacity
            style={[styles.sendButton, canSend && styles.sendButtonActive]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {showEmojiPicker && <EmojiPicker onEmojiSelect={handleEmojiSelect} />}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: "transparent",
    zIndex: 9999,
    elevation: 999,
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
    gap: 12,
    zIndex: 9999,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(241, 245, 249, 1)",
    borderRadius: 24,
    paddingHorizontal: 8,
    minHeight: 44,
    maxHeight: 100,
    zIndex: 9999,
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
