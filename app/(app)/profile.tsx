import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TabTransition from "../../components/TabTransition";
import { ProfileCard } from "../../features/profile/components";
import { useProfileScreen, useProfilePhotos } from "../../features/profile/hooks";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/Spinner";
import { useMemo } from "react";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, userName, userAge, progressPercentage } = useProfileScreen();
  const { logout, isLogoutInProgress } = useAuth();
  const { photos } = useProfilePhotos();

  const allPhotoUrls = useMemo(() => {
    if (photos && photos.length > 0) {
      // Ordenar para que la foto principal esté primero
      const sortedPhotos = [...photos].sort((a, b) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return 0;
      });
      const photoUrls = sortedPhotos.map(photo => photo.url);
      
      // Si el avatar del usuario no está en las fotos, agregarlo al inicio
      if (user?.avatar && !photoUrls.includes(user.avatar)) {
        return [user.avatar, ...photoUrls];
      }
      
      return photoUrls;
    }
    if (user?.avatar) {
      return [user.avatar];
    }
    return [];
  }, [photos, user?.avatar]);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#007BFF" />
      </View>
    );
  }

  return (
    <TabTransition>
      <View style={styles.container}>
        <LinearGradient
          colors={["#0052D4", "#007BFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        />
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces
            alwaysBounceVertical={false}
          >
            <View style={styles.headerSpacer} />
            <ProfileCard
              avatar={user.avatar}
              userName={userName}
              userAge={userAge}
              progressPercentage={progressPercentage}
              photos={allPhotoUrls}
              onEditPress={() => router.push("./edit-profile")}
              onSettingsPress={() => router.push("./edit-profile/settings")}
              onPhotosPress={() => router.push("./edit-profile/photos")}
            />

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/(app)")}>
                <Text style={styles.primaryButtonText}>Buscar compañero</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.logoutButton, isLogoutInProgress && styles.logoutButtonLoading]}
                onPress={isLogoutInProgress ? undefined : logout}
                disabled={isLogoutInProgress}
                activeOpacity={isLogoutInProgress ? 1 : 0.7}
              >
                {isLogoutInProgress ? (
                  <Spinner size={24} color="#FFF" />
                ) : (
                  <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerSpacer: {
    height: 60,
  },
  actionsContainer: {
    marginTop: 24,
    alignItems: "center",
    width: "100%",
  },
  primaryButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#007BFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007BFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Inter-Bold",
  },
  logoutButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#FF3B30",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonLoading: {
    opacity: 0.8,
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
});
