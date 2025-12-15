import { NeighborhoodSkeleton } from "../filters/neighborhoods/NeighborhoodSkeleton";
import { useNeighborhoodSelection } from "../filters/neighborhoods/hooks";
import { SearchBar } from "../filters/neighborhoods/SearchBar";
import { useTheme } from "../../../../context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileLocationSelectionModalProps {
  visible: boolean;
  selectedNeighborhoodId?: string | null;
  onClose: () => void;
  onConfirm: (selectedIds: string[], mainId?: string | null) => void;
  cityId?: string;
}

export const ProfileLocationSelectionModal: React.FC<ProfileLocationSelectionModalProps> = ({
  visible,
  selectedNeighborhoodId,
  onClose,
  onConfirm,
  cityId,
}) => {
  const { colors } = useTheme();

  // Memoize empty array to prevent infinite render loop in useNeighborhoodSelection
  const EMPTY_ARRAY = React.useMemo(() => [], []);

  const {
    searchQuery,
    setSearchQuery,
    neighborhoods: filteredNeighborhoods,
    loading,
    error,
    refetch,
  } = useNeighborhoodSelection({
    visible,
    selectedNeighborhoodIds: EMPTY_ARRAY,
    mainNeighborhoodId: selectedNeighborhoodId,
    mode: "main",
    cityId,
  });

  const handleSelect = (neighborhoodId: string) => {
    onConfirm([], neighborhoodId);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackground} onPress={onClose} />
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.muted }]} />

          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.muted }]}
            >
              <Feather name="x" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Seleccionar Ubicación
            </Text>
            <View style={styles.placeholder} />
          </View>

          {loading ? (
            <>
              <SearchBar value="" onChangeText={() => {}} placeholder="Buscar barrio..." />
              <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
                <NeighborhoodSkeleton count={8} />
              </ScrollView>
            </>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.destructive }]}>{error}</Text>
              <TouchableOpacity
                onPress={() => {
                  refetch();
                }}
                style={[styles.retryButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.retryButtonText, { color: colors.primaryForeground }]}>
                  Reintentar
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar barrio..."
              />
              <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
                {filteredNeighborhoods.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                      {searchQuery ? "No se encontraron barrios" : "No hay barrios disponibles"}
                    </Text>
                  </View>
                ) : (
                  filteredNeighborhoods.map(neighborhood => {
                    const isSelected = selectedNeighborhoodId === neighborhood.id;
                    return (
                      <TouchableOpacity
                        key={neighborhood.id}
                        style={[
                          styles.optionButton,
                          {
                            backgroundColor: isSelected ? colors.primary + "10" : colors.card,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => handleSelect(neighborhood.id)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                            {
                              color: isSelected ? colors.primary : colors.foreground,
                            },
                          ]}
                        >
                          {neighborhood.name}
                        </Text>
                        {isSelected && <Feather name="check" size={20} color={colors.primary} />}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalBackground: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "95%",
    height: "80%",
    paddingBottom: 34,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  placeholder: {
    width: 32,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  optionButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    fontFamily: "Inter-Medium",
  },
  optionTextSelected: {
    fontFamily: "Inter-SemiBold",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
  },
});
