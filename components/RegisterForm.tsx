import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { RegisterCredentials } from "../types/user";
import { City, Department, Neighborhood } from "../types/location";
import { getCitiesByDepartment, getDepartments, getNeighborhoodsByCity } from "../services/locationService";
import Button from "./Button";

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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("MALE");
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
  const inputStyle = {
    backgroundColor: colors.card,
    color: colors.foreground,
  };

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
        setCityFetchError(error instanceof Error ? error.message : "No fue posible cargar las ciudades");
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
      newErrors.firstName = "First name is required";
    }

    if (!lastName) {
      newErrors.lastName = "Last name is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!birthDate) {
      newErrors.birthDate = "Birth date is required";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      newErrors.birthDate = "Use YYYY-MM-DD format";
    }

    if (!gender) {
      newErrors.gender = "Gender is required";
    } else if (!GENDERS.includes(gender.toUpperCase())) {
      newErrors.gender = `Gender must be one of: ${GENDERS.join(", ")}`;
    }

    if (!departmentId) {
      newErrors.departmentId = "Department is required";
    }

    if (!cityId) {
      newErrors.cityId = "City is required";
    }

    if (!neighborhoodId) {
      newErrors.neighborhoodId = "Neighborhood is required";
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

  const inputClass = (hasError?: boolean) =>
    `p-4 border rounded-xl ${hasError ? "border-destructive" : "border-input"} bg-card text-foreground`;

  const labelClass = "mb-2 text-sm font-conviven text-foreground";
  const helperClass = "mt-1 text-xs font-conviven text-muted-foreground";
  const errorClass = "mt-1 text-sm font-conviven text-destructive";

  return (
    <View className="w-full p-5 bg-card rounded-2xl border border-border">
      <View className="mb-4">
        <Text className={labelClass}>First Name</Text>
        <TextInput
          className={inputClass(errors.firstName)}
          value={firstName}
          onChangeText={text => {
            setFirstName(text);
            setErrors(prev => ({ ...prev, firstName: undefined }));
          }}
          placeholder="Your first name"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="words"
          style={inputStyle}
        />
        {errors.firstName && <Text className={errorClass}>{errors.firstName}</Text>}
      </View>

      <View className="mb-4">
        <Text className={labelClass}>Last Name</Text>
        <TextInput
          className={inputClass(errors.lastName)}
          value={lastName}
          onChangeText={text => {
            setLastName(text);
            setErrors(prev => ({ ...prev, lastName: undefined }));
          }}
          placeholder="Your last name"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="words"
          style={inputStyle}
        />
        {errors.lastName && <Text className={errorClass}>{errors.lastName}</Text>}
      </View>

      <View className="mb-4">
        <Text className={labelClass}>Email</Text>
        <TextInput
          className={inputClass(errors.email)}
          value={email}
          onChangeText={text => {
            setEmail(text);
            setErrors(prev => ({ ...prev, email: undefined }));
          }}
          placeholder="your@email.com"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          keyboardType="email-address"
          style={inputStyle}
        />
        {errors.email && <Text className={errorClass}>{errors.email}</Text>}
      </View>

      <View className="mb-4">
        <Text className={labelClass}>Password</Text>
        <TextInput
          className={inputClass(errors.password)}
          value={password}
          onChangeText={text => {
            setPassword(text);
            setErrors(prev => ({ ...prev, password: undefined }));
          }}
          placeholder="Your password"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          style={inputStyle}
        />
        {errors.password && <Text className={errorClass}>{errors.password}</Text>}
      </View>

      <View className="mb-4">
        <Text className={labelClass}>Confirm Password</Text>
        <TextInput
          className={inputClass(errors.confirmPassword)}
          value={confirmPassword}
          onChangeText={text => {
            setConfirmPassword(text);
            setErrors(prev => ({ ...prev, confirmPassword: undefined }));
          }}
          placeholder="Confirm your password"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          style={inputStyle}
        />
        {errors.confirmPassword && <Text className={errorClass}>{errors.confirmPassword}</Text>}
      </View>

      <View className="mb-4">
        <Text className={labelClass}>Birth Date</Text>
        <TextInput
          className={inputClass(errors.birthDate)}
          value={birthDate}
          onChangeText={text => {
            setBirthDate(text);
            setErrors(prev => ({ ...prev, birthDate: undefined }));
          }}
          placeholder="2001-06-28"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          style={inputStyle}
        />
        <Text className={helperClass}>Formato requerido: AAAA-MM-DD</Text>
        {errors.birthDate && <Text className={errorClass}>{errors.birthDate}</Text>}
      </View>

      <View className="mb-4">
        <Text className={labelClass}>Gender</Text>
        <TextInput
          className={inputClass(errors.gender)}
          value={gender}
          onChangeText={text => {
            setGender(text);
            setErrors(prev => ({ ...prev, gender: undefined }));
          }}
          placeholder={`One of: ${GENDERS.join(", ")}`}
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="characters"
          style={inputStyle}
        />
        <Text className={helperClass}>Valores permitidos: {GENDERS.join(", ")}</Text>
        {errors.gender && <Text className={errorClass}>{errors.gender}</Text>}
      </View>

      <SelectField
        label="Department"
        placeholder="Select a department"
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
        helperText={!errors.departmentId && !departmentFetchError ? "Seleccioná el departamento donde vivís" : undefined}
        disabled={isLoadingDepartments}
        loading={isLoadingDepartments}
      />

      <SelectField
        label="City"
        placeholder={departmentId ? "Select a city" : "Choose a department first"}
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
        label="Neighborhood"
        placeholder={cityId ? "Select a neighborhood" : "Choose a city first"}
        options={neighborhoods.map(item => ({ label: item.name, value: item.id }))}
        selectedValue={neighborhoodId}
        onSelect={value => {
          setNeighborhoodId(value);
          setErrors(prev => ({ ...prev, neighborhoodId: undefined }));
        }}
        error={errors.neighborhoodId ?? neighborhoodFetchError ?? undefined}
        helperText={!errors.neighborhoodId && !neighborhoodFetchError ? "Necesitamos tu barrio para completar el registro" : undefined}
        disabled={!cityId || isLoadingNeighborhoods || isLoadingCities}
        loading={isLoadingNeighborhoods}
      />

      <Button
        label={isLoading ? "Creating account..." : "Sign Up"}
        onPress={handleSubmit}
        disabled={isLoading}
      />

      {isLoading && (
        <View className="mt-4 items-center">
          <ActivityIndicator size="small" color={colors.primary} />
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

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-conviven text-foreground">{label}</Text>
      <Pressable
        className={`p-4 border rounded-xl flex-row items-center justify-between ${
          error ? "border-destructive" : "border-input"
        }`}
        onPress={handleOpen}
        disabled={disabled}
        style={({ pressed }) => [
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.destructive : colors.input,
            opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text
          className={`font-conviven flex-1 pr-4 ${selectedOption ? "text-foreground" : "text-muted-foreground"}`}
          numberOfLines={1}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        {loading && <ActivityIndicator size="small" color={colors.mutedForeground} />}
      </Pressable>
      {helperText && !error && (
        <Text className="mt-1 text-xs font-conviven text-muted-foreground">{helperText}</Text>
      )}
      {error && <Text className="mt-1 text-sm font-conviven text-destructive">{error}</Text>}

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable className="flex-1" onPress={() => setIsVisible(false)} accessibilityRole="button" />
          <View
            className="bg-card rounded-t-3xl p-4 border-t border-border"
            style={{ maxHeight: 480 }}
          >
            <Text className="text-lg font-conviven-semibold text-foreground mb-4">{label}</Text>
            <ScrollView style={{ maxHeight: 420 }}>
              {options.length === 0 ? (
                <Text className="font-conviven text-muted-foreground">No hay opciones disponibles</Text>
              ) : (
                options.map(option => (
                  <Pressable
                    key={option.value}
                    className="py-3"
                    onPress={() => handleSelect(option.value)}
                  >
                    <Text
                      className={`font-conviven text-base ${
                        option.value === selectedValue
                          ? "text-primary font-conviven-semibold"
                          : "text-foreground"
                      }`}
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
