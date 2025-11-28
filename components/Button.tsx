import { Pressable, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import Spinner from "./Spinner";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
};

type Variant = NonNullable<Props["variant"]>;

export default function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  fullWidth = true,
  isLoading = false,
}: Props) {
  const { colors } = useTheme();
  const isInteractiveDisabled = disabled || isLoading;

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

  const resolveContentColor = (v: Variant): string => {
    if (disabled && !isLoading) {
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

  const labelColor = resolveContentColor(variant);

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
      onPress={isInteractiveDisabled ? undefined : onPress}
      disabled={isInteractiveDisabled}
      style={({ pressed }) => ({
        opacity: isLoading ? 0.9 : pressed && !isInteractiveDisabled ? 0.9 : 1,
        backgroundColor: resolveBackgroundColor(variant),
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        {isLoading ? (
          <Spinner size={22} color={labelColor} />
        ) : (
          <Text className={`${textClasses} text-center`} style={{ color: labelColor }}>
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
