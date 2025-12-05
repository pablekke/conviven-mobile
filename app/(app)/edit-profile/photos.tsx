import { PhotoUploadScreen } from "../../../features/profile/components";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useProfilePhotos } from "../../../features/profile/hooks";
import { useTheme } from "../../../context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function PhotosScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { loading, initialized, loadPhotos } = useProfilePhotos();

  useEffect(() => {
    if (!initialized) {
      loadPhotos();
    }
  }, [initialized, loadPhotos]);

  const handleBack = () => {
    router.push("/(app)/profile");
  };

  if (!initialized && loading) {
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
