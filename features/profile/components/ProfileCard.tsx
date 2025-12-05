import { Feather } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState, useMemo } from "react";

import { ProfileActionButton } from "./ProfileActionButton";
import { ProfilePhotoGallery } from "./ProfilePhotoGallery";

interface ProfileCardProps {
  avatar?: string;
  userName: string;
  userAge: number;
  progressPercentage: number;
  photos?: string[];
  onEditPress: () => void;
  onSettingsPress?: () => void;
  onPhotosPress?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  avatar,
  userName,
  userAge,
  progressPercentage,
  photos = [],
  onEditPress,
  onSettingsPress,
  onPhotosPress,
}) => {
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);

  const allPhotos = useMemo(() => {
    if (photos && photos.length > 0) {
      return photos;
    }
    if (avatar) {
      return [avatar];
    }
    return [];
  }, [photos, avatar]);

  const handleAvatarPress = () => {
    if (allPhotos.length > 0) {
      setInitialPhotoIndex(0);
      setGalleryVisible(true);
    }
  };

  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAvatarPress}
          disabled={allPhotos.length === 0}
          style={styles.avatarTouchable}
        >
          <View style={styles.avatarWrapper}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.profileImage} resizeMode="cover" />
            ) : (
              <Feather name="user" size={60} color="#A0A0A0" />
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{progressPercentage}% completado</Text>
        </View>
      </View>

      <ProfilePhotoGallery
        visible={galleryVisible}
        photos={allPhotos}
        initialIndex={initialPhotoIndex}
        onClose={() => setGalleryVisible(false)}
      />

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
    paddingVertical: 24,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  avatarTouchable: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
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
    width: 132,
    height: 132,
    borderRadius: 66,
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
    fontSize: 26,
    fontFamily: "Inter-Bold",
    color: "#1F2937",
    marginTop: 4,
    marginBottom: 12,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 12,
  },
});
