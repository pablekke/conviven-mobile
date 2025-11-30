import { useTheme } from "../../../../../context/ThemeContext";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { useNeighborhoodSelection } from "./hooks/useNeighborhoodSelection";
import { SearchBar } from "./SearchBar";
import { NeighborhoodSkeleton } from "./NeighborhoodSkeleton";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface NeighborhoodSelectionModalProps {
  visible: boolean;
  selectedNeighborhoodIds: string[];
  mainNeighborhoodId?: string | null;
  mode?: "main" | "multiple";
  onClose: () => void;
  onConfirm: (selectedIds: string[], mainId?: string | null) => void;
  excludeNeighborhoodIds?: string[]; // IDs a excluir de la lista
}

export const NeighborhoodSelectionModal: React.FC<NeighborhoodSelectionModalProps> = ({
  visible,
  selectedNeighborhoodIds,
  mainNeighborhoodId,
  mode = "multiple",
  onClose,
  onConfirm,
  excludeNeighborhoodIds = [],
}) => {
  const { colors } = useTheme();

  const {
    selectedIds,
    selectedMainId,
    searchQuery,
    setSearchQuery,
    neighborhoods: filteredNeighborhoods,
    loading,
    error,
    refetch,
    toggleSelection,
  } = useNeighborhoodSelection({
    visible,
    selectedNeighborhoodIds,
    mainNeighborhoodId,
    mode,
    excludeNeighborhoodIds,
  });

  const handleConfirm = () => {
    if (mode === "main") {
      onConfirm([], selectedMainId);
    } else {
      onConfirm(selectedIds);
    }
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
              {mode === "main" ? "Seleccionar Barrio Principal" : "Seleccionar Barrios"}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {loading ? (
            <>
              <SearchBar value="" onChangeText={() => {}} placeholder="Buscar barrio..." />
              <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
                <NeighborhoodSkeleton count={8} />
              </ScrollView>
              <View style={styles.footer}>
                <View style={[styles.skeletonText, { backgroundColor: colors.muted }]} />
                <View style={[styles.skeletonButton, { backgroundColor: colors.muted }]} />
              </View>
            </>
          ) : error ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.destructive }]}>{error}</Text>
                <TouchableOpacity
                  onPress={refetch}
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
                    const isSelected =
                      mode === "main"
                        ? selectedMainId === neighborhood.id
                        : selectedIds.includes(neighborhood.id);
                    const isMain = mode === "main" && selectedMainId === neighborhood.id;
                    return (
                      <TouchableOpacity
                        key={neighborhood.id}
                        style={[
                          styles.optionButton,
                          isMain && styles.optionButtonMain,
                          {
                            backgroundColor: isSelected ? colors.primary + "20" : colors.muted,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => toggleSelection(neighborhood.id)}
                      >
                        <View style={styles.optionContent}>
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
                          {isMain && (
                            <View style={[styles.mainBadge, { backgroundColor: colors.primary }]}>
                              <Text
                                style={[styles.mainBadgeText, { color: colors.primaryForeground }]}
                              >
                                Principal
                              </Text>
                            </View>
                          )}
                        </View>
                        {isSelected && (
                          <View style={[styles.checkIcon, { backgroundColor: colors.primary }]}>
                            <Feather name="check" size={16} color={colors.primaryForeground} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              <View style={styles.footer}>
                <Text style={[styles.selectedCount, { color: colors.mutedForeground }]}>
                  {mode === "main"
                    ? selectedMainId
                      ? "1 barrio principal seleccionado"
                      : "Ningún barrio seleccionado"
                    : `${selectedIds.length} ${selectedIds.length === 1 ? "barrio seleccionado" : "barrios seleccionados"}`}
                </Text>
                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                  onPress={handleConfirm}
                >
                  <Text style={[styles.confirmButtonText, { color: colors.primaryForeground }]}>
                    LISTO
                  </Text>
                </TouchableOpacity>
              </View>
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
    minHeight: "70%",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  optionsContainer: {
    paddingHorizontal: 20,
    maxHeight: 400,
    flexGrow: 1,
  },
  optionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionButtonMain: {
    borderWidth: 2,
  },
  optionContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionText: {
    fontSize: 15,
    flex: 1,
    fontWeight: "500",
  },
  optionTextSelected: {
    fontWeight: "600",
  },
  mainBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  mainBadgeText: {
    fontSize: 10,
    fontFamily: "Inter-SemiBold",
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  selectedCount: {
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
  skeletonText: {
    height: 16,
    borderRadius: 8,
  },
  skeletonButton: {
    height: 50,
    borderRadius: 12,
    marginTop: 12,
  },
});
