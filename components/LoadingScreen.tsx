import { ActivityIndicator, Text, View } from "react-native";

import { useTheme } from "../context/ThemeContext";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-1 items-center justify-center bg-background"
      style={{ backgroundColor: colors.background }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="text-muted-foreground mt-4 font-conviven">{message}</Text>
    </View>
  );
}
