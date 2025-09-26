import { View, Text } from "react-native";

import { LoginForm } from "@/src/features/auth/components/LoginForm";

export const OnboardingScreen = () => {
  return (
    <View className="flex-1 bg-background px-6 py-16">
      <Text className="text-sm uppercase tracking-wide text-accent">
        Conviven mobile
      </Text>
      <Text className="mt-2 font-conviven text-4xl leading-tight text-primary-foreground">
        Todo tu progreso, en el bolsillo.
      </Text>
      <Text className="mt-3 max-w-[320px] text-base leading-6 text-muted-foreground">
        Gestiona onboarding, rituales y comunidad con el mismo stack que la SPA,
        optimizado para sesiones rápidas desde iOS y Android.
      </Text>

      <LoginForm />
    </View>
  );
};
