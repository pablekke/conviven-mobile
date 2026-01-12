import { StyleSheet, Text, View } from "react-native";
import { MessageTicks } from "./MessageTicks";
import { MessageStatus } from "../enums";

export interface MessageBubbleProps {
  content: string;
  timestamp: Date;
  isOwn: boolean;
  status?: MessageStatus;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  timestamp,
  isOwn,
  status,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.content, isOwn ? styles.ownContent : styles.otherContent]}>
          {content}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.time, isOwn ? styles.ownTime : styles.otherTime]}>
            {formatTime(timestamp)}
          </Text>
          {isOwn && status && (
            <View style={styles.ticksContainer}>
              <MessageTicks
                status={status}
                size={16}
                color={
                  status === MessageStatus.READ
                    ? undefined // Dejar que MessageTicks use su naranja por defecto
                    : "rgba(255, 255, 255, 0.7)" // Blanco con opacidad para el resto
                }
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  ownContainer: {
    justifyContent: "flex-end",
  },
  otherContainer: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ownBubble: {
    backgroundColor: "#2563EB",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#F1F5F9",
    borderBottomLeftRadius: 4,
  },
  content: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
  },
  ownContent: {
    color: "#fff",
  },
  otherContent: {
    color: "#0F172A",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter-Regular",
  },
  ownTime: {
    color: "rgba(255, 255, 255, 0.75)",
  },
  otherTime: {
    color: "#94A3B8",
  },
  ticksContainer: {
    marginLeft: 2,
  },
});
