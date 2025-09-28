import { Pressable, Text } from "react-native";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  fullWidth?: boolean;
};

const VARIANT_STYLES: Record<
  NonNullable<Props["variant"]>,
  { container: string; text: string }
> = {
  primary: {
    container: "bg-primary",
    text: "text-primary-foreground",
  },
  secondary: {
    container: "bg-secondary",
    text: "text-secondary-foreground",
  },
  danger: {
    container: "bg-destructive",
    text: "text-destructive-foreground",
  },
};

export default function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  fullWidth = true,
}: Props) {
  const { container, text } = VARIANT_STYLES[variant];

  const containerClasses = [
    "rounded-xl",
    "items-center",
    "justify-center",
    "px-5",
    "py-3",
    fullWidth ? "w-full" : "self-start",
    disabled ? "bg-muted opacity-60" : container,
  ].join(" ");

  const textClasses = [
    "text-base",
    "font-conviven-semibold",
    disabled ? "text-muted-foreground" : text,
  ].join(" ");

  return (
    <Pressable
      className={containerClasses}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        opacity: pressed && !disabled ? 0.9 : 1,
      })}
    >
      <Text className={`${textClasses} text-center`}>{label}</Text>
    </Pressable>
  );
}
