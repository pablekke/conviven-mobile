import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LogoutConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
          <Text style={styles.modalMessage}>¿Estás seguro que quieres cerrar sesión?</Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onCancel}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalConfirmButton} onPress={onConfirm}>
              <Text style={styles.modalConfirmText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});
