import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { memo } from "react";

interface ActionButtonProps {
  text: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconColor?: string;
  iconSize?: number;
}

export const ActionButton = memo(
  ({
    text,
    icon,
    onPress,
    variant = "primary",
    size = "medium",
    style,
    textStyle,
    iconColor,
    iconSize = 18,
  }: ActionButtonProps) => {
    const { colors, isDark } = useTheme();

    const isPrimary = variant === "primary";
    const buttonColor = isPrimary ? colors.primary : "transparent";
    const textColor = isPrimary ? colors.primaryForeground : colors.primary;
    const borderColor = colors.primary;

    const sizeStyles = {
      small: { paddingHorizontal: 16, paddingVertical: 10, fontSize: 13 },
      medium: { paddingHorizontal: 24, paddingVertical: 14, fontSize: 15 },
      large: { paddingHorizontal: 32, paddingVertical: 18, fontSize: 17 },
    };

    const currentSize = sizeStyles[size];

    return (
      <TouchableOpacity
        style={[
          styles.button,
          isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
          { backgroundColor: buttonColor, borderColor },
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={styles.buttonBlur}>
          <Feather name={icon} size={iconSize} color={iconColor ?? textColor} style={styles.icon} />
          <Text
            style={[
              styles.buttonText,
              { color: textColor, fontSize: currentSize.fontSize },
              textStyle,
            ]}
          >
            {text}
          </Text>
        </BlurView>
      </TouchableOpacity>
    );
  },
);

ActionButton.displayName = "ActionButton";

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
  },
  buttonPrimary: {
    // Estilos específicos para primary se aplican inline
  },
  buttonSecondary: {
    backgroundColor: "transparent",
  },
  buttonBlur: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  buttonText: {
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
  icon: {
    // Estilo para el icono
  },
});
