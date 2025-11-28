/* eslint-disable react-native/no-inline-styles */

import { Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import Spinner from "../../../components/Spinner";

export interface SubmitButtonProps {
  label: string;
  onPress: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function SubmitButton({
  label,
  onPress,
  isLoading,
  disabled = false,
}: SubmitButtonProps) {
  const { colors } = useTheme();

  const isDisabled = isLoading || disabled;

  return (
    <>
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 16,
          opacity: isDisabled ? 0.6 : 1,
        }}
        onPress={isDisabled ? undefined : onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <Spinner size={20} color={colors.primaryForeground} />
        ) : (
          <Text
            style={{
              color: colors.primaryForeground,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </>
  );
}
