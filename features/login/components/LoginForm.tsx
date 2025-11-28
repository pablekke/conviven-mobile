import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import Spinner from "@/components/Spinner";

import { useTheme } from "@/context/ThemeContext";
import type { LoginCredentials } from "@/types/user";

import { LOGIN_COPY } from "../constants";
import { useLoginForm } from "../hooks";

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  isLoading?: boolean;
  onFocusField?: (field: keyof LoginCredentials) => void;
}

export default function LoginForm({ onSubmit, isLoading = false, onFocusField }: LoginFormProps) {
  const { colors } = useTheme();
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    togglePasswordVisibility,
    errors,
    handleSubmit,
    handleFocus,
  } = useLoginForm({ onSubmit, onFocusField });

  return (
    <View className="w-full">
      <View className="mb-4">
        <Text className="mb-2 text-sm font-conviven-medium text-foreground ml-1">
          Correo electrónico
        </Text>
        <View
          className={`flex-row items-center px-4 h-14 border rounded-2xl bg-card ${
            errors.email ? "border-destructive" : "border-border"
          }`}
        >
          <Mail size={20} color={colors.mutedForeground} className="mr-3" />
          <TextInput
            className="flex-1 text-foreground font-conviven pl-1"
            value={email}
            onChangeText={setEmail}
            placeholder="hola@ejemplo.com"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{}}
            onFocus={() => handleFocus("email")}
          />
        </View>
        {errors.email && (
          <Text className="mt-1.5 ml-1 text-xs font-conviven text-destructive">{errors.email}</Text>
        )}
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-sm font-conviven-medium text-foreground ml-1">Contraseña</Text>
        <View
          className={`flex-row items-center px-4 h-14 border rounded-2xl bg-card ${
            errors.password ? "border-destructive" : "border-border"
          }`}
        >
          <Lock size={20} color={colors.mutedForeground} className="mr-3" />
          <TextInput
            className="flex-1 text-foreground font-conviven pl-1"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry={!showPassword}
            style={{}}
            onFocus={() => handleFocus("password")}
          />
          <TouchableOpacity onPress={togglePasswordVisibility} hitSlop={10}>
            {showPassword ? (
              <EyeOff size={20} color={colors.mutedForeground} />
            ) : (
              <Eye size={20} color={colors.mutedForeground} />
            )}
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text className="mt-1.5 ml-1 text-xs font-conviven text-destructive">
            {errors.password}
          </Text>
        )}
      </View>

      <TouchableOpacity
        className="mb-8 self-end"
        onPress={() => Alert.alert("Restablecer Contraseña", LOGIN_COPY.forgotPassword)}
        activeOpacity={0.7}
      >
        <Text className="font-conviven-medium text-primary text-sm">¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.8}
        className={`w-full py-4 rounded-2xl items-center justify-center shadow-sm ${
          isLoading ? "bg-primary/70" : "bg-primary"
        }`}
        style={{
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {isLoading ? (
          <Spinner size={24} color="#fff" />
        ) : (
          <Text className="text-white font-conviven-bold text-lg">Iniciar Sesión</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
