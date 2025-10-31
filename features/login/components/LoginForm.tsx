import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

import Button from "@/components/Button";
import { useTheme } from "@/context/ThemeContext";
import type { LoginCredentials } from "@/types/user";

import { LOGIN_FORM_DEFAULTS, LOGIN_COPY } from "../constants";
import type { LoginFormErrors } from "../types";

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  isLoading?: boolean;
  onFocusField?: (field: keyof LoginCredentials) => void;
}

export default function LoginForm({ onSubmit, isLoading = false, onFocusField }: LoginFormProps) {
  const defaults = useMemo(() => LOGIN_FORM_DEFAULTS, []);
  const [email, setEmail] = useState(defaults.email ?? "");
  const [password, setPassword] = useState(defaults.password ?? "");
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const { colors } = useTheme();
  const inputStyle = {
    backgroundColor: colors.card,
    color: colors.foreground,
  };

  const validate = (): boolean => {
    const newErrors: LoginFormErrors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      await onSubmit({ email, password });
    }
  };

  return (
    <View className="w-full p-5 bg-card rounded-2xl border border-border">
      <View className="mb-4">
        <Text className="mb-2 text-sm font-conviven text-foreground">Email</Text>
        <TextInput
          className={`p-4 border rounded-xl ${errors.email ? "border-destructive" : "border-input"} bg-card text-foreground`}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          keyboardType="email-address"
          onFocus={() => {
            setErrors({ ...errors, email: undefined });
            onFocusField?.("email");
          }}
          style={inputStyle}
        />
        {errors.email && (
          <Text className="mt-1 text-sm font-conviven text-destructive">{errors.email}</Text>
        )}
      </View>

      <View className="mb-2">
        <Text className="mb-2 text-sm font-conviven text-foreground">Password</Text>
        <TextInput
          className={`p-4 border rounded-xl ${
            errors.password ? "border-destructive" : "border-input"
          } bg-card text-foreground`}
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          onFocus={() => {
            setErrors({ ...errors, password: undefined });
            onFocusField?.("password");
          }}
          style={inputStyle}
        />
        {errors.password && (
          <Text className="mt-1 text-sm font-conviven text-destructive">{errors.password}</Text>
        )}
      </View>

      <TouchableOpacity
        className="mb-4 self-end"
        onPress={() =>
          Alert.alert(
            "Reset Password",
            LOGIN_COPY.forgotPassword,
          )
        }
        activeOpacity={0.7}
      >
        <Text className="font-conviven-semibold text-primary">Forgot password?</Text>
      </TouchableOpacity>

      <Button
        label={isLoading ? "Please wait..." : "Login"}
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
