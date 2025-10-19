import React from "react";
import { Text, View } from "react-native";
import Select, { SelectOption } from "../../../components/Select";

export interface FormSelectProps {
  label: string;
  options: SelectOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  error?: boolean;
  disabled?: boolean;
  helperText?: string;
}

export default function FormSelect({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder,
  error = false,
  disabled = false,
  helperText,
}: FormSelectProps) {
  const labelClass = "mb-3 text-base font-conviven-semibold text-foreground";
  const helperClass = "mt-1 text-sm font-conviven text-muted-foreground";

  return (
    <View className="mb-4">
      <Text className={labelClass}>{label}</Text>
      <Select
        options={options}
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
      />
      {helperText && !error && <Text className={helperClass}>{helperText}</Text>}
    </View>
  );
}
