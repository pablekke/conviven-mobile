import React, { useState, useEffect } from "react";
import { View } from "react-native";

import { Gender } from "../../../types/user";
import { RegisterCredentials } from "../types";
import { useRegister, useLocation } from "../hooks";
import { TEXTS } from "../../../constants";
import { SelectOption } from "../../../components/Select";
import FormField from "./FormField";
import FormSelect from "./FormSelect";
import FormDatePicker from "./FormDatePicker";
import SubmitButton from "./SubmitButton";

interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => Promise<void>;
  isLoading?: boolean;
}

const GENDER_OPTIONS: SelectOption[] = [
  { label: "Masculino", value: Gender.MALE },
  { label: "Femenino", value: Gender.FEMALE },
  { label: "No binario", value: Gender.NON_BINARY },
  { label: "No especificado", value: Gender.UNSPECIFIED },
];

export default function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [cityId, setCityId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");

  const { validateForm, errors, clearErrors } = useRegister();
  const {
    departments,
    cities,
    neighborhoods,
    loading,
    loadCities,
    loadNeighborhoods,
    clearCities,
    clearNeighborhoods,
  } = useLocation();

  useEffect(() => {
    if (cities.length === 1 && !cityId) {
      const singleCity = cities[0];
      setCityId(singleCity.id);
      clearErrors();
      loadNeighborhoods(singleCity.id);
    }
  }, [cities, cityId, clearErrors, loadNeighborhoods]);

  useEffect(() => {
    if (neighborhoods.length === 1 && !neighborhoodId) {
      setNeighborhoodId(neighborhoods[0].id);
      clearErrors();
    }
  }, [neighborhoods, neighborhoodId, clearErrors]);

  const handleSubmit = async () => {
    const formData = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      birthDate,
      gender,
      departmentId,
      cityId,
      neighborhoodId,
    };

    if (validateForm(formData)) {
      try {
        await onSubmit({
          email,
          password,
          firstName,
          lastName,
          birthDate,
          gender: gender as Gender,
          departmentId,
          cityId,
          neighborhoodId,
        });
      } catch (error) {
        throw error;
      }
    }
  };

  const handleDepartmentChange = async (value: string) => {
    setDepartmentId(value);
    clearErrors();
    setCityId("");
    setNeighborhoodId("");
    clearCities();

    if (!value) {
      return;
    }

    await loadCities(value);
  };

  const handleCityChange = async (value: string) => {
    setCityId(value);
    clearErrors();
    setNeighborhoodId("");
    clearNeighborhoods();

    if (!value) {
      return;
    }

    await loadNeighborhoods(value);
  };

  const handleNeighborhoodChange = (value: string) => {
    setNeighborhoodId(value);
    clearErrors();
  };

  return (
    <View className="w-full p-5 bg-card rounded-2xl border border-border">
      <FormField
        label="Nombre"
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Tu nombre"
        error={errors.firstName}
        autoCapitalize="words"
      />

      <FormField
        label="Apellido"
        value={lastName}
        onChangeText={setLastName}
        placeholder="Tu apellido"
        error={errors.lastName}
        autoCapitalize="words"
      />

      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="tu@email.com"
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <FormField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="Tu contraseña"
        error={errors.password}
        secureTextEntry
      />

      <FormField
        label="Confirmar Contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirma tu contraseña"
        error={errors.confirmPassword}
        secureTextEntry
      />

      <FormDatePicker
        label="Fecha de Nacimiento"
        value={birthDate}
        onValueChange={setBirthDate}
        placeholder="Selecciona tu fecha de nacimiento"
        error={!!errors.birthDate}
        errorMessage={errors.birthDate}
        maximumDate={(() => {
          const today = new Date();
          return new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
        })()}
        minimumDate={new Date(new Date().getFullYear() - 100, 0, 1)}
      />

      <FormSelect
        label="Género"
        options={GENDER_OPTIONS}
        selectedValue={gender}
        onValueChange={setGender}
        placeholder="Selecciona tu género"
        error={!!errors.gender}
      />

      <FormSelect
        label="Departamento"
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
        disabled={loading.departments}
        error={!!errors.departmentId}
        helperText={loading.departments ? TEXTS.LOADING_DEPARTMENTS : undefined}
      />

      <FormSelect
        label="Ciudad"
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
        disabled={!departmentId || loading.cities}
        error={!!errors.cityId}
        helperText={loading.cities ? TEXTS.LOADING_CITIES : undefined}
      />

      <FormSelect
        label="Barrio"
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
        disabled={!cityId || loading.neighborhoods}
        error={!!errors.neighborhoodId}
        helperText={loading.neighborhoods ? TEXTS.LOADING_NEIGHBORHOODS : undefined}
      />

      <SubmitButton
        label="Registrarse"
        loadingLabel="Creando cuenta..."
        onPress={handleSubmit}
        isLoading={isLoading}
      />
    </View>
  );
}
