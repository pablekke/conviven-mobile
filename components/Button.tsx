import { Pressable, Text } from "react-native";
import { useTheme } from "../context/ThemeContext";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  fullWidth?: boolean;
};

type Variant = NonNullable<Props["variant"]>;

export default function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  fullWidth = true,
}: Props) {
  const { colors } = useTheme();

  const resolveBackgroundColor = (v: Variant): string => {
    if (disabled) {
      return colors.muted;
    }
    switch (v) {
      case "primary":
        return colors.primary;
      case "secondary":
        return colors.secondary;
      case "danger":
        return colors.destructive;
      default:
        return colors.primary;
    }
  };

  const resolveTextColor = (v: Variant): string => {
    if (disabled) {
      return colors.mutedForeground;
    }
    switch (v) {
      case "primary":
        return colors.primaryForeground;
      case "secondary":
        return colors.secondaryForeground;
      case "danger":
        return colors.destructiveForeground;
      default:
        return colors.primaryForeground;
    }
  };

  const containerClasses = [
    "rounded-xl",
    "items-center",
    "justify-center",
    "px-5",
    "py-3",
    fullWidth ? "w-full" : "self-start",
  ].join(" ");

  const textClasses = ["text-base", "font-conviven-semibold"].join(" ");

  return (
    <Pressable
      className={containerClasses}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        opacity: pressed && !disabled ? 0.9 : 1,
        backgroundColor: resolveBackgroundColor(variant),
        borderColor: variant === "primary" ? colors.primary : colors.border,
        borderWidth: 1,
        minHeight: 48,
        shadowColor: "#000000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      })}
    >
      <Text
        className={`${textClasses} text-center`}
        style={{
          color: resolveTextColor(variant),
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
