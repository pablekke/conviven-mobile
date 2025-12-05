import { Image, Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface ExpandedImageModalProps {
  visible: boolean;
  imageUri: string | undefined;
  onClose: () => void;
}

export const ExpandedImageModal = ({ visible, imageUri, onClose }: ExpandedImageModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.expandedImage} resizeMode="contain" />
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  expandedImage: {
    width: "100%",
    height: "100%",
  },
});
