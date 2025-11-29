import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ConversationHeaderProps {
  userName: string;
  userAvatar: string;
  onBackPress?: () => void;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  userName,
  userAvatar,
  onBackPress,
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

      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: userAvatar }}
            style={styles.avatar}
            resizeMode="cover"
            defaultSource={require("../../../assets/logo.png")}
          />
        </View>
        <View style={styles.textInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
        </View>
      </View>

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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  },
});
