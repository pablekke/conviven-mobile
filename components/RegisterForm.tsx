import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { useTheme } from "../context/ThemeContext";
import { RegisterCredentials } from "../types/user";
import { City, Department, Neighborhood } from "../types/location";
import {
  getCitiesByDepartment,
  getDepartments,
  getNeighborhoodsByCity,
} from "../services/locationService";

const { width } = Dimensions.get("window");

interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => Promise<void>;
  isLoading?: boolean;
}

const GENDERS = ["MALE", "FEMALE", "OTHER"];

type Option = {
  label: string;
  value: string;
};

interface SelectFieldProps {
  label: string;
  placeholder: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  loading?: boolean;
}

export default function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
  const [firstName, setFirstName] = useState("Antonella");
  const [lastName, setLastName] = useState("Martinez");
  const [email, setEmail] = useState("anto@anto.com");
  const [password, setPassword] = useState("123456");
  const [confirmPassword, setConfirmPassword] = useState("123456");
  const [birthDate, setBirthDate] = useState("2003-06-30");
  const [gender, setGender] = useState("FEMALE");
  const [departmentId, setDepartmentId] = useState("");
  const [cityId, setCityId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);
  const [departmentFetchError, setDepartmentFetchError] = useState<string | null>(null);
  const [cityFetchError, setCityFetchError] = useState<string | null>(null);
  const [neighborhoodFetchError, setNeighborhoodFetchError] = useState<string | null>(null);
  const departmentIdRef = useRef(departmentId);
  const cityIdRef = useRef(cityId);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    birthDate?: string;
    gender?: string;
    departmentId?: string;
    cityId?: string;
    neighborhoodId?: string;
  }>({});
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: width * 0.9,
      maxWidth: 380,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 28,
      shadowColor: colors.conviven.blue,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 12,
      borderWidth: 0,
    },
    fieldContainer: {
      marginBottom: 20,
    },
    label: {
      color: colors.foreground,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      fontFamily: "Inter-SemiBold",
      marginLeft: 4,
    },
    inputContainer: {
      position: "relative",
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.foreground,
      fontFamily: "Inter-Regular",
    },
    inputFocused: {
      borderColor: colors.conviven.blue,
      shadowColor: colors.conviven.blue,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    inputError: {
      borderColor: colors.destructive,
    },
    errorText: {
      color: colors.destructive,
      fontSize: 12,
      marginTop: 6,
      fontFamily: "Inter-Regular",
      marginLeft: 4,
    },
    helperText: {
      color: colors.mutedForeground,
      fontSize: 12,
      marginTop: 6,
      fontFamily: "Inter-Regular",
      marginLeft: 4,
    },
    buttonContainer: {
      marginTop: 16,
      marginBottom: 16,
    },
    button: {
      backgroundColor: colors.conviven.blue,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.conviven.blue,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonDisabled: {
      backgroundColor: colors.muted,
      shadowOpacity: 0.1,
    },
    buttonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: "700",
      fontFamily: "Inter-Bold",
    },
    buttonTextDisabled: {
      color: colors.background,
    },
    loadingContainer: {
      marginTop: 16,
      alignItems: "center",
    },
    loadingText: {
      color: colors.mutedForeground,
      fontSize: 14,
      fontFamily: "Inter-Regular",
      marginTop: 8,
    },
  });

  useEffect(() => {
    departmentIdRef.current = departmentId;
  }, [departmentId]);

  useEffect(() => {
    cityIdRef.current = cityId;
  }, [cityId]);

  useEffect(() => {
    let isMounted = true;

    const loadDepartments = async () => {
      setIsLoadingDepartments(true);
      setDepartmentFetchError(null);

      try {
        const list = await getDepartments();

        if (isMounted) {
          setDepartments(list);
        }
      } catch (error) {
        if (isMounted) {
          setDepartmentFetchError(
            error instanceof Error ? error.message : "No fue posible cargar los departamentos",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingDepartments(false);
        }
      }
    };

    loadDepartments();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadCities = async (selectedDepartmentId: string) => {
    setIsLoadingCities(true);
    setCityFetchError(null);

    try {
      const list = await getCitiesByDepartment(selectedDepartmentId);
      if (departmentIdRef.current === selectedDepartmentId) {
        setCities(list);
      }
    } catch (error) {
      if (departmentIdRef.current === selectedDepartmentId) {
        setCityFetchError(
          error instanceof Error ? error.message : "No fue posible cargar las ciudades",
        );
        setCities([]);
      }
    } finally {
      if (departmentIdRef.current === selectedDepartmentId) {
        setIsLoadingCities(false);
      }
    }
  };

  const loadNeighborhoods = async (selectedCityId: string) => {
    setIsLoadingNeighborhoods(true);
    setNeighborhoodFetchError(null);

    try {
      const list = await getNeighborhoodsByCity(selectedCityId);
      if (cityIdRef.current === selectedCityId) {
        setNeighborhoods(list);
      }
    } catch (error) {
      if (cityIdRef.current === selectedCityId) {
        setNeighborhoodFetchError(
          error instanceof Error ? error.message : "No fue posible cargar los barrios",
        );
        setNeighborhoods([]);
      }
    } finally {
      if (cityIdRef.current === selectedCityId) {
        setIsLoadingNeighborhoods(false);
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!firstName) {
      newErrors.firstName = "El nombre es requerido";
    }

    if (!lastName) {
      newErrors.lastName = "El apellido es requerido";
    }

    if (!email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El email no es válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!birthDate) {
      newErrors.birthDate = "La fecha de nacimiento es requerida";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      newErrors.birthDate = "Usa el formato AAAA-MM-DD";
    }

    if (!gender) {
      newErrors.gender = "El género es requerido";
    } else if (!GENDERS.includes(gender.toUpperCase())) {
      newErrors.gender = `El género debe ser uno de: ${GENDERS.join(", ")}`;
    }

    if (!departmentId) {
      newErrors.departmentId = "El departamento es requerido";
    }

    if (!cityId) {
      newErrors.cityId = "La ciudad es requerida";
    }

    if (!neighborhoodId) {
      newErrors.neighborhoodId = "El barrio es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        await onSubmit({
          email,
          password,
          firstName,
          lastName,
          birthDate,
          gender: gender.toUpperCase(),
          departmentId,
          neighborhoodId,
        });
      } catch (error) {
        throw error;
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* First Name Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Nombre</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.firstName ? styles.inputError : styles.inputFocused]}
            value={firstName}
            onChangeText={text => {
              setFirstName(text);
              setErrors(prev => ({ ...prev, firstName: undefined }));
            }}
            placeholder="Tu nombre"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="words"
          />
        </View>
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
      </View>

      {/* Last Name Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Apellido</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.lastName ? styles.inputError : styles.inputFocused]}
            value={lastName}
            onChangeText={text => {
              setLastName(text);
              setErrors(prev => ({ ...prev, lastName: undefined }));
            }}
            placeholder="Tu apellido"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="words"
          />
        </View>
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
      </View>

      {/* Email Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : styles.inputFocused]}
            value={email}
            onChangeText={text => {
              setEmail(text);
              setErrors(prev => ({ ...prev, email: undefined }));
            }}
            placeholder="tu@email.com"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Password Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.password ? styles.inputError : styles.inputFocused]}
            value={password}
            onChangeText={text => {
              setPassword(text);
              setErrors(prev => ({ ...prev, password: undefined }));
            }}
            placeholder="Tu contraseña"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
          />
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      {/* Confirm Password Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Confirmar contraseña</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.confirmPassword ? styles.inputError : styles.inputFocused]}
            value={confirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
              setErrors(prev => ({ ...prev, confirmPassword: undefined }));
            }}
            placeholder="Confirma tu contraseña"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
          />
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      {/* Birth Date Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Fecha de nacimiento</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.birthDate ? styles.inputError : styles.inputFocused]}
            value={birthDate}
            onChangeText={text => {
              setBirthDate(text);
              setErrors(prev => ({ ...prev, birthDate: undefined }));
            }}
            placeholder="2001-06-28"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
          />
        </View>
        <Text style={styles.helperText}>Formato requerido: AAAA-MM-DD</Text>
        {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
      </View>

      {/* Gender Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Género</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.gender ? styles.inputError : styles.inputFocused]}
            value={gender}
            onChangeText={text => {
              setGender(text);
              setErrors(prev => ({ ...prev, gender: undefined }));
            }}
            placeholder={`Uno de: ${GENDERS.join(", ")}`}
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="characters"
          />
        </View>
        <Text style={styles.helperText}>Valores permitidos: {GENDERS.join(", ")}</Text>
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
      </View>

      <SelectField
        label="Departamento"
        placeholder="Selecciona un departamento"
        options={departments.map(item => ({ label: item.name, value: item.id }))}
        selectedValue={departmentId}
        onSelect={value => {
          departmentIdRef.current = value;
          setDepartmentId(value);
          setErrors(prev => ({ ...prev, departmentId: undefined }));
          setDepartmentFetchError(null);
          setCityId("");
          cityIdRef.current = "";
          setNeighborhoodId("");
          setCities([]);
          setNeighborhoods([]);
          setIsLoadingCities(false);
          setIsLoadingNeighborhoods(false);
          setCityFetchError(null);
          setNeighborhoodFetchError(null);

          if (value) {
            loadCities(value);
          }
        }}
        error={errors.departmentId ?? departmentFetchError ?? undefined}
        helperText={
          !errors.departmentId && !departmentFetchError
            ? "Seleccioná el departamento donde vivís"
            : undefined
        }
        disabled={isLoadingDepartments}
        loading={isLoadingDepartments}
      />

      <SelectField
        label="Ciudad"
        placeholder={departmentId ? "Selecciona una ciudad" : "Elige un departamento primero"}
        options={cities.map(item => ({ label: item.name, value: item.id }))}
        selectedValue={cityId}
        onSelect={value => {
          cityIdRef.current = value;
          setCityId(value);
          setErrors(prev => ({ ...prev, cityId: undefined }));
          setNeighborhoodId("");
          setNeighborhoods([]);
          setIsLoadingNeighborhoods(false);
          setNeighborhoodFetchError(null);

          if (value) {
            loadNeighborhoods(value);
          }
        }}
        error={errors.cityId ?? cityFetchError ?? undefined}
        helperText={!errors.cityId && !cityFetchError ? "Luego elegí tu barrio" : undefined}
        disabled={!departmentId || isLoadingCities || isLoadingDepartments}
        loading={isLoadingCities}
      />

      <SelectField
        label="Barrio"
        placeholder={cityId ? "Selecciona un barrio" : "Elige una ciudad primero"}
        options={neighborhoods.map(item => ({ label: item.name, value: item.id }))}
        selectedValue={neighborhoodId}
        onSelect={value => {
          setNeighborhoodId(value);
          setErrors(prev => ({ ...prev, neighborhoodId: undefined }));
        }}
        error={errors.neighborhoodId ?? neighborhoodFetchError ?? undefined}
        helperText={
          !errors.neighborhoodId && !neighborhoodFetchError
            ? "Necesitamos tu barrio para completar el registro"
            : undefined
        }
        disabled={!cityId || isLoadingNeighborhoods || isLoadingCities}
        loading={isLoadingNeighborhoods}
      />

      {/* Register Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, isLoading && styles.buttonTextDisabled]}>
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.conviven.blue} />
          <Text style={styles.loadingText}>Por favor espera...</Text>
        </View>
      )}
    </View>
  );
}

function SelectField({
  label,
  placeholder,
  options,
  selectedValue,
  onSelect,
  error,
  helperText,
  disabled = false,
  loading = false,
}: SelectFieldProps) {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const selectedOption = options.find(option => option.value === selectedValue);

  const handleOpen = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsVisible(false);
  };

  const selectStyles = StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    label: {
      color: colors.foreground,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      fontFamily: "Inter-SemiBold",
      marginLeft: 4,
    },
    pressable: {
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    pressableFocused: {
      borderColor: colors.conviven.blue,
      shadowColor: colors.conviven.blue,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    pressableError: {
      borderColor: colors.destructive,
    },
    pressableDisabled: {
      opacity: 0.6,
    },
    text: {
      fontSize: 16,
      color: colors.foreground,
      fontFamily: "Inter-Regular",
      flex: 1,
      paddingRight: 16,
    },
    textPlaceholder: {
      color: colors.mutedForeground,
    },
    helperText: {
      color: colors.mutedForeground,
      fontSize: 12,
      marginTop: 6,
      fontFamily: "Inter-Regular",
      marginLeft: 4,
    },
    errorText: {
      color: colors.destructive,
      fontSize: 12,
      marginTop: 6,
      fontFamily: "Inter-Regular",
      marginLeft: 4,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 16,
      maxHeight: 480,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter-SemiBold",
      marginBottom: 16,
    },
    modalScrollView: {
      maxHeight: 420,
    },
    optionItem: {
      paddingVertical: 12,
    },
    optionText: {
      fontSize: 16,
      color: colors.foreground,
      fontFamily: "Inter-Regular",
    },
    optionTextSelected: {
      color: colors.conviven.blue,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    noOptionsText: {
      fontSize: 16,
      color: colors.mutedForeground,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      paddingVertical: 20,
    },
    modalOverlayPressable: {
      flex: 1,
    },
  });

  return (
    <View style={selectStyles.container}>
      <Text style={selectStyles.label}>{label}</Text>
      <Pressable
        style={[
          selectStyles.pressable,
          error ? selectStyles.pressableError : selectStyles.pressableFocused,
          disabled && selectStyles.pressableDisabled,
        ]}
        onPress={handleOpen}
        disabled={disabled}
      >
        <Text
          style={[selectStyles.text, !selectedOption && selectStyles.textPlaceholder]}
          numberOfLines={1}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        {loading && <ActivityIndicator size="small" color={colors.mutedForeground} />}
      </Pressable>
      {helperText && !error && <Text style={selectStyles.helperText}>{helperText}</Text>}
      {error && <Text style={selectStyles.errorText}>{error}</Text>}

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={selectStyles.modalOverlay}>
          <Pressable
            style={selectStyles.modalOverlayPressable}
            onPress={() => setIsVisible(false)}
            accessibilityRole="button"
          />
          <View style={selectStyles.modalContent}>
            <Text style={selectStyles.modalTitle}>{label}</Text>
            <ScrollView style={selectStyles.modalScrollView}>
              {options.length === 0 ? (
                <Text style={selectStyles.noOptionsText}>No hay opciones disponibles</Text>
              ) : (
                options.map(option => (
                  <Pressable
                    key={option.value}
                    style={selectStyles.optionItem}
                    onPress={() => handleSelect(option.value)}
                  >
                    <Text
                      style={[
                        selectStyles.optionText,
                        option.value === selectedValue && selectStyles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
