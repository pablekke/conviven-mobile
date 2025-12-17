import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../../../../context/ThemeContext";
import { memo } from "react";

interface ModalFooterProps {
  isFilterMode?: boolean;
  isDisabled?: boolean;
  onConfirm: () => void;
}

export const ModalFooter = memo(
  ({ isFilterMode = false, isDisabled = false, onConfirm }: ModalFooterProps) => {
    const { colors } = useTheme();

    return (
      <View style={styles.footer}>
        {isFilterMode && (
          <Text style={[styles.warningText, { color: colors.mutedForeground }]}>
            Cambiar de barrio eliminará todos los barrios adicionales seleccionados.
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            {
              backgroundColor: isDisabled ? colors.muted : colors.primary,
            },
          ]}
          onPress={onConfirm}
          disabled={isDisabled}
        >
          <Text
            style={[
              styles.confirmButtonText,
              {
                color: isDisabled ? colors.mutedForeground : colors.primaryForeground,
              },
            ]}
          >
            LISTO
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
);

ModalFooter.displayName = "ModalFooter";

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  warningText: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
    marginBottom: 12,
    textAlign: "center",
  },
  confirmButton: {
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
