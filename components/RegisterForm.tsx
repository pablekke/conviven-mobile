import React, { useState } from "react";
import { View, TextInput, Text, ActivityIndicator } from "react-native";

import Button from "./Button";
import { RegisterCredentials } from "../types/user";

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

  return (
    <View className="w-full p-4">
      <View className="mb-4">
        <Text className="mb-2 text-gray-700">First Name</Text>
        <TextInput
          className={`p-4 border rounded-md ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
          value={firstName}
          onChangeText={text => {
            setFirstName(text);
            setErrors(prev => ({ ...prev, firstName: undefined }));
          }}
          placeholder="Your first name"
          autoCapitalize="words"
        />
        {errors.firstName && <Text className="mt-1 text-red-500">{errors.firstName}</Text>}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-gray-700">Last Name</Text>
        <TextInput
          className={`p-4 border rounded-md ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
          value={lastName}
          onChangeText={text => {
            setLastName(text);
            setErrors(prev => ({ ...prev, lastName: undefined }));
          }}
          placeholder="Your last name"
          autoCapitalize="words"
        />
        {errors.lastName && <Text className="mt-1 text-red-500">{errors.lastName}</Text>}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-gray-700">Email</Text>
        <TextInput
          className={`p-4 border rounded-md ${errors.email ? "border-red-500" : "border-gray-300"}`}
          value={email}
          onChangeText={text => {
            setEmail(text);
            setErrors(prev => ({ ...prev, email: undefined }));
          }}
          placeholder="your@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {errors.email && <Text className="mt-1 text-red-500">{errors.email}</Text>}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-gray-700">Password</Text>
        <TextInput
          className={`p-4 border rounded-md ${errors.password ? "border-red-500" : "border-gray-300"}`}
          value={password}
          onChangeText={text => {
            setPassword(text);
            setErrors(prev => ({ ...prev, password: undefined }));
          }}
          placeholder="Your password"
          secureTextEntry
        />
        {errors.password && <Text className="mt-1 text-red-500">{errors.password}</Text>}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-gray-700">Confirm Password</Text>
        <TextInput
          className={`p-4 border rounded-md ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
          value={confirmPassword}
          onChangeText={text => {
            setConfirmPassword(text);
            setErrors(prev => ({ ...prev, confirmPassword: undefined }));
          }}
          placeholder="Confirm your password"
          secureTextEntry
        />
        {errors.confirmPassword && (
          <Text className="mt-1 text-red-500">{errors.confirmPassword}</Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-gray-700">Birth Date</Text>
        <TextInput
          className={`p-4 border rounded-md ${errors.birthDate ? "border-red-500" : "border-gray-300"}`}
          value={birthDate}
          onChangeText={text => {
            setBirthDate(text);
            setErrors(prev => ({ ...prev, birthDate: undefined }));
          }}
          placeholder="2001-06-28"
          autoCapitalize="none"
        />
        <Text className="mt-1 text-xs text-gray-500">Formato requerido: AAAA-MM-DD</Text>
        {errors.birthDate && <Text className="mt-1 text-red-500">{errors.birthDate}</Text>}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-gray-700">Gender</Text>
        <TextInput
          className={`p-4 border rounded-md ${errors.gender ? "border-red-500" : "border-gray-300"}`}
          value={gender}
          onChangeText={text => {
            setGender(text);
            setErrors(prev => ({ ...prev, gender: undefined }));
          }}
          placeholder={`One of: ${GENDERS.join(", ")}`}
          autoCapitalize="characters"
        />
        <Text className="mt-1 text-xs text-gray-500">Valores permitidos: {GENDERS.join(", ")}</Text>
        {errors.gender && <Text className="mt-1 text-red-500">{errors.gender}</Text>}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-gray-700">Department ID</Text>
        <TextInput
          className={`p-4 border rounded-md ${errors.departmentId ? "border-red-500" : "border-gray-300"}`}
          value={departmentId}
          onChangeText={text => {
            setDepartmentId(text);
            setErrors(prev => ({ ...prev, departmentId: undefined }));
          }}
          placeholder="Department identifier"
          autoCapitalize="none"
        />
        <Text className="mt-1 text-xs text-gray-500">
          Ejemplo: a2f0e079-c922-44f2-8712-e2710fad74e3
        </Text>
        {errors.departmentId && <Text className="mt-1 text-red-500">{errors.departmentId}</Text>}
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-gray-700">Neighborhood ID</Text>
        <TextInput
          className={`p-4 border rounded-md ${errors.neighborhoodId ? "border-red-500" : "border-gray-300"}`}
          value={neighborhoodId}
          onChangeText={text => {
            setNeighborhoodId(text);
            setErrors(prev => ({ ...prev, neighborhoodId: undefined }));
          }}
          placeholder="Neighborhood identifier"
          autoCapitalize="none"
        />
        <Text className="mt-1 text-xs text-gray-500">
          Ejemplo: 23a75a72-2deb-4fd0-b8bb-98c48b03fa14
        </Text>
        {errors.neighborhoodId && <Text className="mt-1 text-red-500">{errors.neighborhoodId}</Text>}
      </View>

      <Button
        label={isLoading ? "Creating account..." : "Sign Up"}
        onPress={handleSubmit}
        disabled={isLoading}
      />

      {isLoading && <ActivityIndicator size="small" color="#4338ca" className="mt-4" />}
    </View>
  );
}
