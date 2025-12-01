import { Feather } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

import { ProfileActionButton } from "./ProfileActionButton";

interface ProfileCardProps {
  avatar?: string;
  userName: string;
  userAge: number;
  progressPercentage: number;
  onEditPress: () => void;
  onSettingsPress?: () => void;
  onPhotosPress?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  avatar,
  userName,
  userAge,
  progressPercentage,
  onEditPress,
  onSettingsPress,
  onPhotosPress,
}) => {
  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.profileImage} resizeMode="cover" />
          ) : (
            <Feather name="user" size={40} color="#A0A0A0" />
          )}
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{progressPercentage}% completado</Text>
        </View>
      </View>

      <Text style={styles.userName}>
        {userName}, {userAge}
      </Text>

      <View style={styles.divider} />

      <View style={styles.actionButtons}>
        <ProfileActionButton icon="filter" label="Filtros" onPress={onSettingsPress} />
        <ProfileActionButton icon="edit-3" label="Editar" variant="primary" onPress={onEditPress} />
        <ProfileActionButton icon="camera" label="Fotos" showPlusBadge onPress={onPhotosPress} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    width: 102,
    height: 102,
    borderRadius: 51,
  },
  progressBadge: {
    position: "absolute",
    bottom: -10,
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  progressText: {
    fontSize: 12,
    color: "#0284C7",
    fontFamily: "Inter-SemiBold",
  },
  userName: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 24,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
  },
});
