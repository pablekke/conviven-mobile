import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ConversationHeaderProps {
  userName: string;
  userAvatar: string;
  onBackPress?: () => void;
  onProfilePress?: () => void;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  userName,
  userAvatar,
  onBackPress,
  onProfilePress,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.navigate("/chat");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={28} color="#2563EB" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.userInfo}
        activeOpacity={0.7}
        hitSlop={{ top: 15, bottom: 15, left: 30, right: 30 }}
        onPress={() => onProfilePress?.()}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: userAvatar }}
            style={styles.avatar}
            resizeMode="center"
            defaultSource={require("../../../assets/logo.png")}
          />
        </View>
        <View style={styles.textInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
        <Ionicons name="ellipsis-vertical" size={24} color="#64748B" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
    zIndex: 100,
  },
  backButton: {
    marginRight: 16,
    paddingVertical: 4,
    paddingRight: 20,
    paddingLeft: 8,
    zIndex: 110,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 110,
    paddingVertical: 5,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E2E8F0",
  },
  textInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#0F172A",
  },
  moreButton: {
    padding: 4,
    marginLeft: 8,
    zIndex: 110,
  },
});
