import React, { useEffect, useState } from "react";
import { PhotoUploadScreen } from "../../../features/profile/components";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { useProfilePhotos } from "../../../features/profile/hooks";

export default function PhotosScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { loading, loadPhotos } = useProfilePhotos();
  const [photosLoaded, setPhotosLoaded] = useState(false);

  useEffect(() => {
    const preloadPhotos = async () => {
      await loadPhotos();
      setPhotosLoaded(true);
    };
    preloadPhotos();
  }, [loadPhotos]);

  const handleBack = () => {
    router.push("/(app)/profile");
  };

  if (!photosLoaded || loading) {
    return (
      <>
        <StatusBar style="light" />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <PhotoUploadScreen onBack={handleBack} />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
