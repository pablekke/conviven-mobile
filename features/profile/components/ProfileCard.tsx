import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
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
      <View style={styles.profilePicture}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.profileImage} resizeMode="cover" />
        ) : (
          <Feather name="user" size={40} color="#A0A0A0" />
        )}
      </View>

      <View style={styles.progressBadge}>
        <Text style={styles.progressText}>{progressPercentage}% completado</Text>
      </View>

      <Text style={styles.userName}>
        {userName}, {userAge}
      </Text>

      <View style={styles.actionButtons}>
        <ProfileActionButton icon="settings" label="Ajustes" onPress={onSettingsPress} />
        <ProfileActionButton
          icon="edit-3"
          label="Editar perfil"
          variant="primary"
          onPress={onEditPress}
        />
        <ProfileActionButton
          icon="camera"
          label="Subir fotos"
          showPlusBadge
          onPress={onPhotosPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    width: "100%",
    height: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -8,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#007BFF",
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  progressBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    marginTop: -12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressText: {
    fontSize: 13,
    color: "#666666",
    fontWeight: "600",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 24,
    fontFamily: "System",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
});
