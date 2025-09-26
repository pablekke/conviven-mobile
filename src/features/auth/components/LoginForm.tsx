import { Controller, useForm } from "react-hook-form";
import { TextInput, Text, View, Pressable } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

import { useAuthContext } from "@/src/providers/auth/AuthProvider";
import { createZodResolver } from "@/src/features/auth/utils/zodResolver";

const loginSchema = z.object({
  email: z
    .string({ required_error: "El correo es obligatorio" })
    .email("Introduce un correo válido"),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(6, "Al menos 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { login, status } = useAuthContext();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: createZodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (formValues) => {
    await login({
      token: "demo-token",
      user: {
        id: "demo-user",
        email: formValues.email,
        name: "Conviven Demo",
      },
    });

    Toast.show({
      type: "success",
      text1: "Sesión iniciada",
      text2: "Tu espacio Conviven está sincronizado.",
    });
  });

  return (
    <View className="mt-10 space-y-4">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <Text className="text-sm font-medium text-muted-foreground">
              Correo electrónico
            </Text>
            <TextInput
              className="mt-2 rounded-2xl border border-input bg-background px-4 py-3 font-sans text-base text-foreground"
              autoCapitalize="none"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="tu@email.com"
            />
            {errors.email ? (
              <Text className="mt-1 text-xs text-destructive">
                {errors.email.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <Text className="text-sm font-medium text-muted-foreground">
              Contraseña
            </Text>
            <TextInput
              className="mt-2 rounded-2xl border border-input bg-background px-4 py-3 font-sans text-base text-foreground"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="••••••"
            />
            {errors.password ? (
              <Text className="mt-1 text-xs text-destructive">
                {errors.password.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <Pressable
        accessibilityRole="button"
        className="rounded-full bg-primary px-5 py-3"
        disabled={isSubmitting || status === "authenticated"}
        onPress={onSubmit}
      >
        <Text className="text-center font-semibold text-primary-foreground">
          {status === "authenticated" ? "Sesión activa" : "Entrar"}
        </Text>
      </Pressable>
    </View>
  );
};
