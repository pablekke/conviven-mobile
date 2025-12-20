import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ProfileCard } from "../../features/profile/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassBackground, LoadingModal } from "@/components";
import TabTransition from "../../components/TabTransition";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/Spinner";
import { useCallback, useState } from "react";
import { StatusBar } from "expo-status-bar";

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

  if (!user) {
    return <LoadingModal visible={!user} />;
  }

  return (
    <TabTransition>
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={[styles.headerGradient, { backgroundColor: colors.conviven.blue }]} />
        <GlassBackground intensity={90} style={styles.glassBackground} />
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <View style={styles.contentWrapper}>
            <View>
              <View style={styles.headerSpacer} />
              <ProfileCard />

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push("/(app)")}
                >
                  <Text style={styles.primaryButtonText}>Buscar compañero</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.logoutButton, isLogoutInProgress && styles.logoutButtonLoading]}
                  onPress={isLogoutInProgress ? undefined : () => setShowLogoutModal(true)}
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
            </View>

            <View style={styles.footerContainer}>
              <Image
                source={require("../../assets/images/profile-footer-illustration.png")}
                style={styles.footerImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </SafeAreaView>

        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
              <Text style={styles.modalMessage}>¿Estás seguro que quieres cerrar sesión?</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={() => {
                    setShowLogoutModal(false);
                    logout();
                  }}
                >
                  <Text style={styles.modalConfirmText}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  footerContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 15,
  },
  footerImage: {
    width: "100%",
    height: 160,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: "#374151",
  },
  modalConfirmButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
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
