import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Spinner from "@/components/Spinner";

interface ProfileActionButtonsProps {
  onSearchPress: () => void;
  onLogoutPress: () => void;
  isLogoutInProgress: boolean;
}

export const ProfileActionButtons: React.FC<ProfileActionButtonsProps> = ({
  onSearchPress,
  onLogoutPress,
  isLogoutInProgress,
}) => {
  return (
    <>
      <TouchableOpacity style={styles.primaryButton} onPress={onSearchPress}>
        <Text style={styles.primaryButtonText}>Buscar compañero</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.logoutButton, isLogoutInProgress && styles.logoutButtonLoading]}
        onPress={isLogoutInProgress ? undefined : onLogoutPress}
        disabled={isLogoutInProgress}
        activeOpacity={isLogoutInProgress ? 1 : 0.7}
      >
        {isLogoutInProgress ? (
          <Spinner size={24} color="#FFF" />
        ) : (
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        )}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
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
