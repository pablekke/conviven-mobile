import { Text, View } from "react-native";

import { useTheme } from "../../../context/ThemeContext";

export interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, children }) => {
  const { colors } = useTheme();

  return (
    <View
      className="p-4 rounded-2xl border mb-3"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <Text className="text-xs uppercase tracking-[2px] text-muted-foreground font-conviven mb-2">
        {title}
      </Text>
      {children}
    </View>
  );
};
