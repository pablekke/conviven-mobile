import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@/context/ThemeContext";
import LocationService from "@/services/locationService";
import { Department, City, Neighborhood } from "@/types/user";
import { TEXTS } from "@/constants";

interface LocationSelectorProps {
  selectedDepartmentId?: string;
  selectedCityId?: string;
  selectedNeighborhoodId?: string;
  onDepartmentChange: (departmentId: string) => void;
  onCityChange: (cityId: string) => void;
  onNeighborhoodChange: (neighborhoodId: string) => void;
  mode: "display" | "edit"; // 'display' solo muestra depto y ciudad, 'edit' muestra los 3
  disabled?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedDepartmentId,
  selectedCityId,
  selectedNeighborhoodId,
  onDepartmentChange,
  onCityChange,
  onNeighborhoodChange,
  mode,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState({
    departments: false,
    cities: false,
    neighborhoods: false,
  });

  // Cargar departamentos al montar el componente
  useEffect(() => {
    loadDepartments();
  }, []);

  // Cargar ciudades cuando cambia el departamento seleccionado
  useEffect(() => {
    if (selectedDepartmentId) {
      loadCities(selectedDepartmentId);
    } else {
      setCities([]);
      setNeighborhoods([]);
    }
  }, [selectedDepartmentId]);

  // Cargar barrios cuando cambia la ciudad seleccionada (solo en modo edit)
  useEffect(() => {
    if (mode === "edit" && selectedCityId) {
      loadNeighborhoods(selectedCityId);
    } else {
      setNeighborhoods([]);
    }
  }, [selectedCityId, mode]);

  const loadDepartments = async () => {
    setLoading(prev => ({ ...prev, departments: true }));
    try {
      const data = await LocationService.listDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error loading departments:", error);
      setDepartments([]);
    } finally {
      setLoading(prev => ({ ...prev, departments: false }));
    }
  };

  const loadCities = async (departmentId: string) => {
    setLoading(prev => ({ ...prev, cities: true }));
    try {
      const data = await LocationService.listCities(departmentId);
      setCities(data);
    } catch (error) {
      console.error("Error loading cities:", error);
      setCities([]);
    } finally {
      setLoading(prev => ({ ...prev, cities: false }));
    }
  };

  const loadNeighborhoods = async (cityId: string) => {
    setLoading(prev => ({ ...prev, neighborhoods: true }));
    try {
      const data = await LocationService.listNeighborhoods(cityId);
      setNeighborhoods(data);
    } catch (error) {
      console.error("Error loading neighborhoods:", error);
      setNeighborhoods([]);
    } finally {
      setLoading(prev => ({ ...prev, neighborhoods: false }));
    }
  };

  const handleDepartmentChange = (departmentId: string) => {
    onDepartmentChange(departmentId);
    // Limpiar selecciones dependientes
    onCityChange("");
    if (mode === "edit") {
      onNeighborhoodChange("");
    }
  };

  const handleCityChange = (cityId: string) => {
    onCityChange(cityId);
    // Limpiar selección de barrio si está en modo edit
    if (mode === "edit") {
      onNeighborhoodChange("");
    }
  };

  const styles = StyleSheet.create({
    container: {
      gap: 16,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    picker: {
      height: 50,
      color: colors.foreground,
    },
    loadingText: {
      color: colors.mutedForeground,
      fontStyle: "italic",
    },
    label: {
      color: colors.foreground,
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 4,
    },
  });

  return (
    <View style={styles.container}>
      {/* Departamento */}
      <View>
        <Text style={styles.label}>Departamento</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedDepartmentId || ""}
            onValueChange={handleDepartmentChange}
            style={styles.picker}
            enabled={!disabled && !loading.departments}
          >
            <Picker.Item label={TEXTS.SELECT_DEPARTMENT} value="" color={colors.mutedForeground} />
            {departments.map(dept => (
              <Picker.Item
                key={dept.id}
                label={dept.name}
                value={dept.id}
                color={colors.foreground}
              />
            ))}
          </Picker>
        </View>
        {loading.departments && <Text style={styles.loadingText}>{TEXTS.LOADING_DEPARTMENTS}</Text>}
      </View>

      {/* Ciudad */}
      <View>
        <Text style={styles.label}>Ciudad</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCityId || ""}
            onValueChange={handleCityChange}
            style={styles.picker}
            enabled={!disabled && !loading.cities && !!selectedDepartmentId}
          >
            <Picker.Item
              label={selectedDepartmentId ? TEXTS.SELECT_CITY : TEXTS.FIRST_SELECT_DEPT}
              value=""
              color={colors.mutedForeground}
            />
            {cities.map(city => (
              <Picker.Item
                key={city.id}
                label={city.name}
                value={city.id}
                color={colors.foreground}
              />
            ))}
          </Picker>
        </View>
        {loading.cities && <Text style={styles.loadingText}>{TEXTS.LOADING_CITIES}</Text>}
      </View>

      {/* Barrio - Solo en modo edit */}
      {mode === "edit" && (
        <View>
          <Text style={styles.label}>Barrio</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedNeighborhoodId || ""}
              onValueChange={onNeighborhoodChange}
              style={styles.picker}
              enabled={!disabled && !loading.neighborhoods && !!selectedCityId}
            >
              <Picker.Item
                label={selectedCityId ? TEXTS.SELECT_NEIGHBORHOOD : TEXTS.FIRST_SELECT_CITY}
                value=""
                color={colors.mutedForeground}
              />
              {neighborhoods.map(neighborhood => (
                <Picker.Item
                  key={neighborhood.id}
                  label={neighborhood.name}
                  value={neighborhood.id}
                  color={colors.foreground}
                />
              ))}
            </Picker>
          </View>
          {loading.neighborhoods && (
            <Text style={styles.loadingText}>{TEXTS.LOADING_NEIGHBORHOODS}</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default LocationSelector;
