import { useState, useMemo, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
  Text,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import PagerView from "react-native-pager-view";

interface ProfilePhotoGalleryProps {
  visible: boolean;
  photos: string[];
  initialIndex?: number;
  onClose: () => void;
}

export const ProfilePhotoGallery = ({
  visible,
  photos,
  initialIndex = 0,
  onClose,
}: ProfilePhotoGalleryProps) => {
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, visible]);

  const carouselKey = useMemo(() => photos.join("|"), [photos]);

  if (photos.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <BlurView intensity={20} tint="dark" style={styles.blurBackground} />
        <View style={styles.overlayDark} />

        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdropTouchable} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent} pointerEvents="box-none">
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {photos.length > 1 && (
            <View style={styles.counterContainer} pointerEvents="none">
              <Text style={styles.counterText}>
                {currentIndex + 1} / {photos.length}
              </Text>
            </View>
          )}

          <View
            style={[styles.pagerViewContainer, { width, height: height * 0.8 }]}
            pointerEvents="auto"
          >
            <PagerView
              key={carouselKey}
              style={styles.pagerView}
              initialPage={initialIndex}
              onPageSelected={e => setCurrentIndex(e.nativeEvent.position)}
            >
              {photos.map((photoUrl, idx) => (
                <View key={String(idx)} style={styles.imageContainer}>
                  <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="contain" />
                </View>
              ))}
            </PagerView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blurBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayDark: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  backdropTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  counterContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
  },
  pagerViewContainer: {
    flex: 1,
    zIndex: 5,
  },
  pagerView: {
    width: "100%",
    height: "100%",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
