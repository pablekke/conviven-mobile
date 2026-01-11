import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";

export interface ConversationHeaderProps {
  userName: string;
  userAvatar: string;
  onBackPress?: () => void;
  topInset?: number;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  userName,
  userAvatar,
  onBackPress,
  topInset = 0,
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
    <BlurView intensity={80} tint="light" style={[styles.container, { paddingTop: topInset + 12 }]}>
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
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.5)",
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
