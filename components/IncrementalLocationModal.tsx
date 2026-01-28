import { NeighborhoodSkeleton } from "../features/profile/components/filters/neighborhoods/NeighborhoodSkeleton";
import React, { useState, useEffect, useCallback } from "react";
import LocationService from "../services/locationService";
import { useTheme } from "../context/ThemeContext";
import { Neighborhood } from "../types/user";
import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";

interface IncrementalLocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (neighborhood: Neighborhood) => void;
  initialQuery?: string;
}

export const IncrementalLocationModal: React.FC<IncrementalLocationModalProps> = ({
  visible,
  onClose,
  onSelect,
  initialQuery = "",
}) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | number | null>(null);

  const search = useCallback(async (text: string) => {
    if (text.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Mínimo tiempo de carga para evitar parpadeo feo del skeleton
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 300));

    try {
      const [data] = await Promise.all([LocationService.searchNeighborhoods(text), minLoadTime]);
      setResults(data);
    } catch (error) {
      console.error("Error searching location:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Resetear al abrir
    if (visible) {
      setQuery(initialQuery);
      if (initialQuery.length >= 3) {
        search(initialQuery);
      } else {
        setResults([]);
      }
    }
    return () => {
      if (searchTimer) clearTimeout(searchTimer);
    };
  }, [visible]);

  const handleTextChange = (text: string) => {
    setQuery(text);

    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    if (text.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      search(text);
    }, 500);

    setSearchTimer(timer);
  };

  const handleSelect = (item: Neighborhood) => {
    onSelect(item);
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
              style={[styles.backButton, { backgroundColor: colors.muted }]}
            >
              <Feather name="arrow-left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Seleccionar Barrio
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.muted }]}
            >
              <Feather name="x" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.muted, borderColor: colors.border },
              ]}
            >
              <Feather
                name="search"
                size={18}
                color={colors.mutedForeground}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={query}
                onChangeText={handleTextChange}
                placeholder="Buscá tu barrio (mín. 3 letras)"
                placeholderTextColor={colors.mutedForeground}
                autoFocus
              />
            </View>
          </View>

          <ScrollView
            style={styles.optionsContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <NeighborhoodSkeleton count={6} />
            ) : results.length > 0 ? (
              results.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.optionButton, { borderColor: colors.border }]}
                  onPress={() => handleSelect(item)}
                >
                  <View>
                    <Text style={[styles.optionText, { color: colors.foreground }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.subText, { color: colors.mutedForeground }]}>
                      {item.cityName}, {item.departmentName}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))
            ) : (
              <>
                {!loading && query.length >= 3 && results.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                      No se encontraron barrios con esa búsqueda :/
                    </Text>
                  </View>
                )}
                {!loading && query.length < 3 && (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                      Escribí al menos 3 letras para buscar
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackground: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "80%",
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter-Bold",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter-Regular",
    height: "100%",
  },
  spinner: {
    marginLeft: 10,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
  optionButton: {
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
    marginBottom: 2,
  },
  subText: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
});
