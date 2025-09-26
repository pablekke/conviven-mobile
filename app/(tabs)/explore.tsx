import { ScrollView, View, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { useAuthContext } from "@/src/providers/auth/AuthProvider";

const featureChecklist = [
  {
    id: "redux",
    title: "Redux Toolkit + Persist",
    description:
      "Global store ready for slices, with AsyncStorage persistence baked in.",
  },
  {
    id: "query",
    title: "React Query",
    description:
      "QueryClient configured for retries, caching and optimistic updates.",
  },
  {
    id: "forms",
    title: "Forms & Validation",
    description:
      "React Hook Form + Zod resolver to mirror the SPA's field experience.",
  },
  {
    id: "auth",
    title: "Auth provider",
    description:
      "Secure token storage with Expo Secure Store and global auth context.",
  },
  {
    id: "theming",
    title: "NativeWind theming",
    description:
      "Conviven colors, typography, and animations exposed to the design system.",
  },
];

export default function ExploreScreen() {
  const { user, status } = useAuthContext();

  const { data } = useQuery({
    queryKey: ["conviven", "feature-checklist"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return featureChecklist;
    },
  });

  return (
    <ScrollView className="flex-1 bg-background px-6 py-10">
      <Text className="font-conviven text-4xl text-primary-foreground">
        Conviven móvil
      </Text>
      <Text className="mt-2 text-base text-muted-foreground">
        {status === "authenticated"
          ? `Hola ${user?.name ?? user?.email}, tu espacio está listo.`
          : "Inicia sesión desde cualquier pantalla para sincronizar tu progreso."}
      </Text>

      <View className="mt-8 space-y-4">
        {data?.map((feature) => (
          <View
            key={feature.id}
            className="rounded-3xl border border-border/40 bg-card/80 p-4 shadow-sm"
          >
            <Text className="font-semibold text-lg text-foreground">
              {feature.title}
            </Text>
            <Text className="mt-1 text-sm leading-5 text-muted-foreground">
              {feature.description}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
