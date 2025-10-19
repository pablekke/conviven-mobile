import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import LocationService from "@/services/locationService";
import { Department, City, Neighborhood } from "@/types/user";
import { TEXTS } from "@/constants";
import Select from "./Select";

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
    loadingText: {
      color: colors.mutedForeground,
      fontStyle: "italic",
      fontSize: 12,
      marginTop: 4,
    },
    label: {
      color: colors.foreground,
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 8,
    },
  });

  return (
    <View style={styles.container}>
      {/* Departamento */}
      <View>
        <Text style={styles.label}>Departamento</Text>
        <Select
          options={[
            { label: TEXTS.SELECT_DEPARTMENT, value: "" },
            ...departments.map(dept => ({
              label: dept.name,
              value: dept.id,
            })),
          ]}
          selectedValue={selectedDepartmentId ?? ""}
          onValueChange={handleDepartmentChange}
          placeholder={TEXTS.SELECT_DEPARTMENT}
          disabled={disabled || loading.departments}
        />
        {loading.departments && <Text style={styles.loadingText}>{TEXTS.LOADING_DEPARTMENTS}</Text>}
      </View>

      {/* Ciudad */}
      <View>
        <Text style={styles.label}>Ciudad</Text>
        <Select
          options={[
            {
              label: selectedDepartmentId ? TEXTS.SELECT_CITY : TEXTS.FIRST_SELECT_DEPT,
              value: "",
            },
            ...cities.map(city => ({
              label: city.name,
              value: city.id,
            })),
          ]}
          selectedValue={selectedCityId ?? ""}
          onValueChange={handleCityChange}
          placeholder={selectedDepartmentId ? TEXTS.SELECT_CITY : TEXTS.FIRST_SELECT_DEPT}
          disabled={disabled || loading.cities || !selectedDepartmentId}
        />
        {loading.cities && <Text style={styles.loadingText}>{TEXTS.LOADING_CITIES}</Text>}
      </View>

      {/* Barrio - Solo en modo edit */}
      {mode === "edit" && (
        <View>
          <Text style={styles.label}>Barrio</Text>
          <Select
            options={[
              {
                label: selectedCityId ? TEXTS.SELECT_NEIGHBORHOOD : TEXTS.FIRST_SELECT_CITY,
                value: "",
              },
              ...neighborhoods.map(neighborhood => ({
                label: neighborhood.name,
                value: neighborhood.id,
              })),
            ]}
            selectedValue={selectedNeighborhoodId ?? ""}
            onValueChange={onNeighborhoodChange}
            placeholder={selectedCityId ? TEXTS.SELECT_NEIGHBORHOOD : TEXTS.FIRST_SELECT_CITY}
            disabled={disabled || loading.neighborhoods || !selectedCityId}
          />
          {loading.neighborhoods && (
            <Text style={styles.loadingText}>{TEXTS.LOADING_NEIGHBORHOODS}</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default LocationSelector;