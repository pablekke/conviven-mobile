import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { NeighborhoodOption } from "./components/NeighborhoodOption";
import { useTheme } from "../../../../../context/ThemeContext";
import { LoadingState } from "./components/LoadingState";
import { ModalHeader } from "./components/ModalHeader";
import { ModalFooter } from "./components/ModalFooter";
import { ErrorState } from "./components/ErrorState";
import { EmptyState } from "./components/EmptyState";
import { useNeighborhoodSelection } from "./hooks";
import { SearchBar } from "./SearchBar";
import React from "react";

interface NeighborhoodSelectionModalProps {
  visible: boolean;
  selectedNeighborhoodIds: string[];
  mainNeighborhoodId?: string | null;
  mode?: "main" | "multiple";
  onClose: () => void;
  onConfirm: (selectedIds: string[], mainId?: string | null) => void;
  excludeNeighborhoodIds?: string[];
  cityId?: string;
  isFilterMode?: boolean;
}

export const NeighborhoodSelectionModal: React.FC<NeighborhoodSelectionModalProps> = ({
  visible,
  selectedNeighborhoodIds,
  mainNeighborhoodId,
  mode = "multiple",
  onClose,
  onConfirm,
  excludeNeighborhoodIds = [],
  cityId,
  isFilterMode = false,
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
    cityId,
  });

  const handleConfirm = () => {
    if (mode === "main") {
      const finalMainId = selectedMainId || mainNeighborhoodId;
      if (finalMainId) {
        onConfirm([], finalMainId);
        onClose();
      }
    } else {
      onConfirm(selectedIds);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackground} onPress={onClose} />
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.muted }]} />

          <ModalHeader
            title={mode === "main" ? "Seleccionar Barrio Principal" : "Seleccionar Barrios"}
            onClose={onClose}
          />

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : (
            <>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar barrio..."
              />
              <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
                {filteredNeighborhoods.length === 0 ? (
                  <EmptyState hasSearchQuery={!!searchQuery} />
                ) : (
                  filteredNeighborhoods.map(neighborhood => {
                    const isSelected =
                      mode === "main"
                        ? selectedMainId === neighborhood.id
                        : selectedIds.includes(neighborhood.id);
                    const isMain = mode === "main" && selectedMainId === neighborhood.id;
                    return (
                      <NeighborhoodOption
                        key={neighborhood.id}
                        name={neighborhood.name}
                        isSelected={isSelected}
                        isMain={isMain}
                        onPress={() => toggleSelection(neighborhood.id)}
                      />
                    );
                  })
                )}
              </ScrollView>

              <ModalFooter
                isFilterMode={isFilterMode}
                isDisabled={mode === "main" && !selectedMainId && !mainNeighborhoodId}
                onConfirm={handleConfirm}
              />
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
  optionsContainer: {
    paddingHorizontal: 20,
    maxHeight: 400,
    flexGrow: 1,
  },
});
