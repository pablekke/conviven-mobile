import React, { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import LocationService from "../../../../services/locationService";
import { Department, City, Neighborhood } from "../../../../types/user";
import Spinner from "../../../../components/Spinner";

type SelectionStep = "department" | "city" | "neighborhood";

interface LocationSelectionModalProps {
  visible: boolean;
  selectedDepartmentId?: string;
  selectedCityId?: string;
  selectedNeighborhoodId?: string;
  onClose: () => void;
  onConfirm: (departmentId: string, cityId: string, neighborhoodId: string) => void;
}

export const LocationSelectionModal: React.FC<LocationSelectionModalProps> = ({
  visible,
  selectedDepartmentId,
  selectedCityId,
  selectedNeighborhoodId,
  onClose,
  onConfirm,
}) => {
  const [currentStep, setCurrentStep] = useState<SelectionStep>("department");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempDepartmentId, setTempDepartmentId] = useState(selectedDepartmentId || "");
  const [tempCityId, setTempCityId] = useState(selectedCityId || "");
  const [tempNeighborhoodId, setTempNeighborhoodId] = useState(selectedNeighborhoodId || "");

  useEffect(() => {
    if (visible) {
      loadDepartments();
      setCurrentStep("department");
      setTempDepartmentId(selectedDepartmentId || "");
      setTempCityId(selectedCityId || "");
      setTempNeighborhoodId(selectedNeighborhoodId || "");
    }
  }, [visible, selectedDepartmentId, selectedCityId, selectedNeighborhoodId]);

  useEffect(() => {
    if (tempDepartmentId && currentStep === "city") {
      loadCities(tempDepartmentId);
    } else if (!tempDepartmentId) {
      setCities([]);
      setNeighborhoods([]);
    }
  }, [tempDepartmentId, currentStep]);

  useEffect(() => {
    if (tempCityId && currentStep === "neighborhood") {
      loadNeighborhoods(tempCityId);
    } else if (!tempCityId) {
      setNeighborhoods([]);
    }
  }, [tempCityId, currentStep]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await LocationService.listDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error loading departments:", error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async (departmentId: string) => {
    setLoading(true);
    try {
      const data = await LocationService.listCities(departmentId);
      setCities(data);
    } catch (error) {
      console.error("Error loading cities:", error);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadNeighborhoods = async (cityId: string) => {
    setLoading(true);
    try {
      const data = await LocationService.listNeighborhoods(cityId);
      setNeighborhoods(data);
    } catch (error) {
      console.error("Error loading neighborhoods:", error);
      setNeighborhoods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentSelect = (departmentId: string) => {
    setTempDepartmentId(departmentId);
    setTempCityId("");
    setTempNeighborhoodId("");
    setCurrentStep("city");
  };

  const handleCitySelect = (cityId: string) => {
    setTempCityId(cityId);
    setTempNeighborhoodId("");
    setCurrentStep("neighborhood");
  };

  const handleNeighborhoodSelect = (neighborhoodId: string) => {
    setTempNeighborhoodId(neighborhoodId);
  };

  const handleBack = () => {
    if (currentStep === "neighborhood") {
      setCurrentStep("city");
    } else if (currentStep === "city") {
      setCurrentStep("department");
    } else {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (tempDepartmentId && tempCityId && tempNeighborhoodId) {
      onConfirm(tempDepartmentId, tempCityId, tempNeighborhoodId);
      onClose();
    }
  };

  const getTitle = () => {
    switch (currentStep) {
      case "department":
        return "Seleccionar Departamento";
      case "city":
        return "Seleccionar Ciudad";
      case "neighborhood":
        return "Seleccionar Barrio";
      default:
        return "Seleccionar Ubicación";
    }
  };

  const getOptions = () => {
    switch (currentStep) {
      case "department":
        return departments.map(dept => ({
          value: dept.id,
          label: dept.name,
        }));
      case "city":
        return cities.map(city => ({
          value: city.id,
          label: city.name,
        }));
      case "neighborhood":
        return neighborhoods.map(neighborhood => ({
          value: neighborhood.id,
          label: neighborhood.name,
        }));
      default:
        return [];
    }
  };

  const getSelectedValue = () => {
    switch (currentStep) {
      case "department":
        return tempDepartmentId;
      case "city":
        return tempCityId;
      case "neighborhood":
        return tempNeighborhoodId;
      default:
        return "";
    }
  };

  const canConfirm = tempDepartmentId && tempCityId && tempNeighborhoodId;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackground} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Feather name="arrow-left" size={20} color="#666666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{getTitle()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color="#666666" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Spinner
                size={48}
                color="#007BFF"
                trackColor="rgba(0, 123, 255, 0.25)"
                thickness={4}
              />
            </View>
          ) : (
            <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
              {getOptions().map(option => {
                const isSelected = getSelectedValue() === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionButton, isSelected && styles.selectedOptionButton]}
                    onPress={() => {
                      if (currentStep === "department") {
                        handleDepartmentSelect(option.value);
                      } else if (currentStep === "city") {
                        handleCitySelect(option.value);
                      } else {
                        handleNeighborhoodSelect(option.value);
                      }
                    }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                      {option.label}
                    </Text>
                    {isSelected && <Feather name="check" size={18} color="#007BFF" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {canConfirm && (
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>CONFIRMAR</Text>
            </TouchableOpacity>
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
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#E0E0E0",
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
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
    flex: 1,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    maxHeight: 500,
    flexGrow: 1,
  },
  optionButton: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedOptionButton: {
    backgroundColor: "#EBF5FF",
    borderColor: "#007BFF",
  },
  optionText: {
    fontSize: 15,
    color: "#555555",
    fontWeight: "500",
    flex: 1,
  },
  selectedOptionText: {
    color: "#007BFF",
    fontWeight: "700",
  },
  confirmButton: {
    backgroundColor: "#007BFF",
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
