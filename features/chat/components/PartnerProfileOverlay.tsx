import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { GlassBackground } from "@/components/GlassBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserInfoCard } from "../../feed/components/userInfoCard";
import { BioSection } from "../../feed/components/userInfoCard/sections/BioSection";
import { PrimaryCard } from "../../feed/components/cards/PrimaryCard";
import { ProfilePhotoGallery } from "../../profile/components/ProfilePhotoGallery";
import { useUserProfileDetail } from "../hooks/useUserProfileDetail";
import Spinner from "@/components/Spinner";
import { useTheme } from "@/context/ThemeContext";

interface PartnerProfileOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const PartnerProfileOverlay: React.FC<PartnerProfileOverlayProps> = ({
  isVisible,
  onClose,
  userId,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, loading, error } = useUserProfileDetail(userId);
  const [galleryVisible, setGalleryVisible] = React.useState(false);
  const [showModal, setShowModal] = React.useState(isVisible);
  const translateX = useSharedValue(-SCREEN_WIDTH);

  useEffect(() => {
    if (isVisible) {
      setShowModal(true);
      translateX.value = withTiming(0, { duration: 400 });
    } else {
      translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 }, finished => {
        if (finished) {
          runOnJS(setShowModal)(false);
        }
      });
    }
  }, [isVisible, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const handleClose = () => {
    onClose();
  };

  if (!showModal && !isVisible) return null;

  return (
    <Modal
      transparent
      visible={showModal}
      onRequestClose={handleClose}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Content Container */}
        <Animated.View style={[styles.contentContainer, animatedStyle]}>
          <GlassBackground intensity={95} />

          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="chevron-back" size={28} color={colors.primary} />
              <Text style={[styles.backText, { color: colors.primary }]}>Volver al chat</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <Spinner size={40} color={colors.primary} />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>Error al cargar el perfil</Text>
              <TouchableOpacity onPress={onClose} style={styles.retryButton}>
                <Text style={styles.retryText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          ) : profile ? (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.cardWrapper}>
                  <PrimaryCard
                    style={{ height: SCREEN_HEIGHT * 0.52 }}
                    photos={
                      profile.user.photoUrl
                        ? [profile.user.photoUrl, ...profile.user.secondaryPhotoUrls]
                        : []
                    }
                    locationStrings={
                      profile.user.location?.neighborhood?.name
                        ? [profile.user.location.neighborhood.name]
                        : ["Sin ubicación"]
                    }
                    headline={`${profile.user.firstName} ${profile.user.lastName || ""}`}
                    budget={`$${Math.round(Number(profile.user.filters?.budgetMin || 0))} - $${Math.round(Number(profile.user.filters?.budgetMax || 0))}`}
                    basicInfo={[
                      `${new Date().getFullYear() - new Date(profile.user.birthDate).getFullYear()} años`,
                      profile.user.profile?.occupation || "Roomie",
                    ]}
                    photosCount={1 + profile.user.secondaryPhotoUrls.length}
                    onPhotosPress={() => setGalleryVisible(true)}
                  />
                </View>

                <View style={styles.detailsContainer}>
                  {profile.user.profile.bio && <BioSection bio={profile.user.profile.bio} />}

                  <UserInfoCard
                    style={styles.infoCard}
                    profile={profile.ui.profile}
                    location={profile.ui.location}
                    filters={profile.ui.filters}
                    budgetFull={`Entre $${Math.round(Number(profile.user.filters?.budgetMin || 0))} y $${Math.round(Number(profile.user.filters?.budgetMax || 0))}`}
                  />

                  <View style={{ height: insets.bottom + 40 }} />
                </View>
              </ScrollView>

              <ProfilePhotoGallery
                visible={galleryVisible}
                photos={
                  [profile.user.photoUrl, ...profile.user.secondaryPhotoUrls].filter(
                    Boolean,
                  ) as string[]
                }
                initialIndex={0}
                onClose={() => setGalleryVisible(false)}
              />
            </>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  contentContainer: {
    width: SCREEN_WIDTH,
    height: "100%",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 15,
    zIndex: 10,
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  cardWrapper: {
    width: "92%",
    alignSelf: "center",
    marginVertical: 10,
    borderRadius: 24,
    overflow: "hidden",
  },
  detailsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  infoCard: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    fontFamily: "Inter-Medium",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
  },
  retryText: {
    fontFamily: "Inter-SemiBold",
    color: "#475569",
  },
});
