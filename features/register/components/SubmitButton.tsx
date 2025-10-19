/* eslint-disable react-native/no-inline-styles */

import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";

export interface SubmitButtonProps {
  label: string;
  loadingLabel: string;
  onPress: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function SubmitButton({
  label,
  loadingLabel,
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
        <Text
          style={{
            color: colors.primaryForeground,
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {isLoading ? loadingLabel : label}
        </Text>
      </TouchableOpacity>

      {isLoading && (
        <View className="mt-4 items-center">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </>
  );
}
