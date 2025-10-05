import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { RegisterCredentials } from "../types/user";
import { City, Department, Neighborhood } from "@/types/user";
import Button from "./Button";
import Select, { SelectOption } from "./Select";
import DatePicker from "./DatePicker";
import LocationService from "@/services/locationService";
import { TEXTS } from "@/constants";

interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => Promise<void>;
  isLoading?: boolean;
}

const GENDER_OPTIONS: SelectOption[] = [
  { label: TEXTS.GENDER_MALE, value: "MALE" },
  { label: TEXTS.GENDER_FEMALE, value: "FEMALE" },
  { label: TEXTS.GENDER_OTHER, value: "OTHER" },
];

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
  const [locationLoading, setLocationLoading] = useState({
    departments: false,
    cities: false,
    neighborhoods: false,
  });
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
      newErrors.email = "El formato del email es inválido";
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
    } else {
      const selectedDate = new Date(birthDate);
      const today = new Date();
      const minDate = new Date(1900, 0, 1);

      if (selectedDate > today) {
        newErrors.birthDate = "La fecha no puede ser futura";
      } else if (selectedDate < minDate) {
        newErrors.birthDate = "La fecha debe ser posterior a 1900";
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
        newErrors.birthDate = "Formato de fecha inválido";
      }
    }

    if (!gender) {
      newErrors.gender = "El género es requerido";
    } else if (!GENDER_OPTIONS.map(g => g.value).includes(gender.toUpperCase())) {
      newErrors.gender = "Selecciona un género válido";
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
          cityId,
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

  useEffect(() => {
    const loadDepartments = async () => {
      setLocationLoading(prev => ({ ...prev, departments: true }));
      try {
        const data = await LocationService.listDepartments();
        setDepartments(data);
      } catch (error) {
        console.error("Error loading departments:", error);
        setDepartments([]);
      } finally {
        setLocationLoading(prev => ({ ...prev, departments: false }));
      }
    };

    loadDepartments();
  }, []);

  const handleDepartmentChange = async (value: string) => {
    setDepartmentId(value);
    setErrors(prev => ({
      ...prev,
      departmentId: undefined,
      cityId: undefined,
      neighborhoodId: undefined,
    }));
    setCityId("");
    setNeighborhoodId("");
    setCities([]);
    setNeighborhoods([]);

    if (!value) {
      return;
    }

    setLocationLoading(prev => ({ ...prev, cities: true }));
    try {
      const data = await LocationService.listCities(value);
      setCities(data);
    } catch (error) {
      console.error("Error loading cities:", error);
      setCities([]);
    } finally {
      setLocationLoading(prev => ({ ...prev, cities: false }));
    }
  };

  const handleCityChange = async (value: string) => {
    setCityId(value);
    setErrors(prev => ({ ...prev, cityId: undefined, neighborhoodId: undefined }));
    setNeighborhoodId("");
    setNeighborhoods([]);

    if (!value) {
      return;
    }

    setLocationLoading(prev => ({ ...prev, neighborhoods: true }));
    try {
      const data = await LocationService.listNeighborhoods(value);
      setNeighborhoods(data);
    } catch (error) {
      console.error("Error loading neighborhoods:", error);
      setNeighborhoods([]);
    } finally {
      setLocationLoading(prev => ({ ...prev, neighborhoods: false }));
    }
  };

  const handleNeighborhoodChange = (value: string) => {
    setNeighborhoodId(value);
    setErrors(prev => ({ ...prev, neighborhoodId: undefined }));
  };

  return (
    <View className="w-full p-5 bg-card rounded-2xl border border-border">
      <View className="mb-4">
        <Text className={labelClass}>Nombre</Text>
        <TextInput
          className={inputClass(!!errors.firstName)}
          value={firstName}
          onChangeText={text => {
            setFirstName(text);
            setErrors(prev => ({ ...prev, firstName: undefined }));
          }}
          placeholder="Tu nombre"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="words"
          style={inputStyle}
        />
        {errors.firstName && <Text className={errorClass}>{errors.firstName}</Text>}
      </View>

      <View className="mb-4">
        <Text className={labelClass}>Apellido</Text>
        <TextInput
          className={inputClass(!!errors.lastName)}
          value={lastName}
          onChangeText={text => {
            setLastName(text);
            setErrors(prev => ({ ...prev, lastName: undefined }));
          }}
          placeholder="Tu apellido"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="words"
          style={inputStyle}
        />
        {errors.lastName && <Text className={errorClass}>{errors.lastName}</Text>}
      </View>

      <View className="mb-4">
        <Text className={labelClass}>Email</Text>
        <TextInput
          className={inputClass(!!errors.email)}
          value={email}
          onChangeText={text => {
            setEmail(text);
            setErrors(prev => ({ ...prev, email: undefined }));
          }}
          placeholder="tu@email.com"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          keyboardType="email-address"
          style={inputStyle}
        />
        {errors.email && <Text className={errorClass}>{errors.email}</Text>}
      </View>

      <View className="mb-4">
        <Text className={labelClass}>Contraseña</Text>
        <TextInput
          className={inputClass(!!errors.password)}
          value={password}
          onChangeText={text => {
            setPassword(text);
            setErrors(prev => ({ ...prev, password: undefined }));
          }}
          placeholder="Tu contraseña"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          style={inputStyle}
        />
        {errors.password && <Text className={errorClass}>{errors.password}</Text>}
      </View>

      <View className="mb-4">
        <Text className={labelClass}>Confirmar Contraseña</Text>
        <TextInput
          className={inputClass(!!errors.confirmPassword)}
          value={confirmPassword}
          onChangeText={text => {
            setConfirmPassword(text);
            setErrors(prev => ({ ...prev, confirmPassword: undefined }));
          }}
          placeholder="Confirma tu contraseña"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          style={inputStyle}
        />
        {errors.confirmPassword && <Text className={errorClass}>{errors.confirmPassword}</Text>}
      </View>

      <View className="mb-4">
        <Text className={labelClass}>Fecha de Nacimiento</Text>
        <DatePicker
          value={birthDate}
          onValueChange={value => {
            setBirthDate(value);
            setErrors(prev => ({ ...prev, birthDate: undefined }));
          }}
          placeholder="Selecciona tu fecha de nacimiento"
          error={!!errors.birthDate}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
        {errors.birthDate && <Text className={errorClass}>{errors.birthDate}</Text>}
      </View>

      <View className="mb-4">
        <Text className={labelClass}>Género</Text>
        <Select
          options={GENDER_OPTIONS}
          selectedValue={gender}
          onValueChange={value => {
            setGender(value);
            setErrors(prev => ({ ...prev, gender: undefined }));
          }}
          placeholder="Selecciona tu género"
          error={!!errors.gender}
        />
        {errors.gender && <Text className={errorClass}>{errors.gender}</Text>}
      </View>

      <View className="mb-4">
        <Text className={labelClass}>Departamento</Text>
        <Select
          options={[
            { label: TEXTS.SELECT_DEPARTMENT, value: "" },
            ...departments.map(department => ({
              label: department.name,
              value: department.id,
            })),
          ]}
          selectedValue={departmentId}
          onValueChange={handleDepartmentChange}
          placeholder={TEXTS.SELECT_DEPARTMENT}
          disabled={locationLoading.departments}
          error={!!errors.departmentId}
        />
        {locationLoading.departments && (
          <Text className={helperClass}>{TEXTS.LOADING_DEPARTMENTS}</Text>
        )}
        {errors.departmentId && <Text className={errorClass}>{errors.departmentId}</Text>}
      </View>

      <View className="mb-4">
        <Text className={labelClass}>Ciudad</Text>
        <Select
          options={[
            {
              label: departmentId ? TEXTS.SELECT_CITY : TEXTS.FIRST_SELECT_DEPT,
              value: "",
            },
            ...cities.map(city => ({
              label: city.name,
              value: city.id,
            })),
          ]}
          selectedValue={cityId}
          onValueChange={handleCityChange}
          placeholder={departmentId ? TEXTS.SELECT_CITY : TEXTS.FIRST_SELECT_DEPT}
          disabled={!departmentId || locationLoading.cities}
          error={!!errors.cityId}
        />
        {locationLoading.cities && <Text className={helperClass}>{TEXTS.LOADING_CITIES}</Text>}
        {errors.cityId && <Text className={errorClass}>{errors.cityId}</Text>}
      </View>

      <View className="mb-6">
        <Text className={labelClass}>Barrio</Text>
        <Select
          options={[
            {
              label: cityId ? TEXTS.SELECT_NEIGHBORHOOD : TEXTS.FIRST_SELECT_CITY,
              value: "",
            },
            ...neighborhoods.map(neighborhood => ({
              label: neighborhood.name,
              value: neighborhood.id,
            })),
          ]}
          selectedValue={neighborhoodId}
          onValueChange={handleNeighborhoodChange}
          placeholder={cityId ? TEXTS.SELECT_NEIGHBORHOOD : TEXTS.FIRST_SELECT_CITY}
          disabled={!cityId || locationLoading.neighborhoods}
          error={!!errors.neighborhoodId}
        />
        {locationLoading.neighborhoods && (
          <Text className={helperClass}>{TEXTS.LOADING_NEIGHBORHOODS}</Text>
        )}
        {errors.neighborhoodId && <Text className={errorClass}>{errors.neighborhoodId}</Text>}
      </View>

      <Button
        label={isLoading ? "Creando cuenta..." : "Registrarse"}
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
