import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { RegisterCredentials } from "../types/user";
import Button from "./Button";

interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => Promise<void>;
  isLoading?: boolean;
}

const GENDERS = ["MALE", "FEMALE", "OTHER"];

export default function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("MALE");
  const [departmentId, setDepartmentId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    birthDate?: string;
    gender?: string;
    departmentId?: string;
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
      newErrors.departmentId = "Department ID is required";
    }

    if (!neighborhoodId) {
      newErrors.neighborhoodId = "Neighborhood ID is required";
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
          className={inputClass(!!errors.firstName)}
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
          className={inputClass(!!errors.lastName)}
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
          className={inputClass(!!errors.email)}
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
          className={inputClass(!!errors.password)}
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
          className={inputClass(!!errors.confirmPassword)}
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
          className={inputClass(!!errors.birthDate)}
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
          className={inputClass(!!errors.gender)}
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

      <View className="mb-4">
        <Text className={labelClass}>Department ID</Text>
        <TextInput
          className={inputClass(!!errors.departmentId)}
          value={departmentId}
          onChangeText={text => {
            setDepartmentId(text);
            setErrors(prev => ({ ...prev, departmentId: undefined }));
          }}
          placeholder="Department identifier"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          style={inputStyle}
        />
        <Text className={helperClass}>Ejemplo: a2f0e079-c922-44f2-8712-e2710fad74e3</Text>
        {errors.departmentId && <Text className={errorClass}>{errors.departmentId}</Text>}
      </View>

      <View className="mb-6">
        <Text className={labelClass}>Neighborhood ID</Text>
        <TextInput
          className={inputClass(!!errors.neighborhoodId)}
          value={neighborhoodId}
          onChangeText={text => {
            setNeighborhoodId(text);
            setErrors(prev => ({ ...prev, neighborhoodId: undefined }));
          }}
          placeholder="Neighborhood identifier"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          style={inputStyle}
        />
        <Text className={helperClass}>Ejemplo: 23a75a72-2deb-4fd0-b8bb-98c48b03fa14</Text>
        {errors.neighborhoodId && <Text className={errorClass}>{errors.neighborhoodId}</Text>}
      </View>

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
