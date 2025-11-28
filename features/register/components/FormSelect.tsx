import { Text, View } from "react-native";
import Select, { SelectOption } from "../../../components/Select";

export interface FormSelectProps {
  label: string;
  options: SelectOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  error?: boolean;
  errorMessage?: string;
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
  errorMessage,
  disabled = false,
  helperText,
}: FormSelectProps) {
  const labelClass = "mb-3 text-base font-conviven-semibold text-foreground";
  const helperClass = "mt-1 text-sm font-conviven text-muted-foreground";
  const errorClass = "mt-1 text-sm font-conviven text-destructive";

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
      {error && errorMessage && <Text className={errorClass}>{errorMessage}</Text>}
      {helperText && !error && <Text className={helperClass}>{helperText}</Text>}
    </View>
  );
}
