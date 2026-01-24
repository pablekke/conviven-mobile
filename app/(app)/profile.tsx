import { StyleSheet, View, StatusBar as RNStatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassBackground, LoadingModal } from "@/components";
import TabTransition from "../../components/TabTransition";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useCallback, useState } from "react";
import {
  ProfileCard,
  ProfileActionButtons,
  ProfileFooter,
  LogoutConfirmModal,
} from "../../features/profile/components";

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, logout, isLogoutInProgress, refreshUser } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshUser().catch(() => {});
    }, [refreshUser]),
  );

  useFocusEffect(
    useCallback(() => {
      RNStatusBar.setBarStyle("light-content", true);
      return () => {};
    }, []),
  );

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  if (!user) {
    return <LoadingModal visible={!user} />;
  }

  return (
    <TabTransition>
      <View style={styles.container}>
        <View style={[styles.headerGradient, { backgroundColor: colors.conviven.blue }]} />
        <GlassBackground intensity={90} style={styles.glassBackground} />
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <View style={styles.contentWrapper}>
            <View>
              <View style={styles.headerSpacer} />
              <ProfileCard />

              <View style={styles.actionsContainer}>
                <ProfileActionButtons
                  onSearchPress={() => router.push("/(app)")}
                  onLogoutPress={() => setShowLogoutModal(true)}
                  isLogoutInProgress={isLogoutInProgress}
                />
              </View>
            </View>

            <ProfileFooter />
          </View>
        </SafeAreaView>

        <LogoutConfirmModal
          visible={showLogoutModal}
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={handleLogoutConfirm}
        />
      </View>
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    height: "100%",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 1,
  },
  safeArea: {
    flex: 1,
    zIndex: 2,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingBottom: 90,
  },
  headerSpacer: {
    height: 60,
  },
  actionsContainer: {
    marginTop: 24,
    alignItems: "center",
    width: "100%",
  },
  glassBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
});
