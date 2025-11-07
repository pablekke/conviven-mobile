import { Text, View } from "react-native";
import DatePicker from "../../../components/DatePicker";

export interface FormDatePickerProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  error?: boolean;
  errorMessage?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

export default function FormDatePicker({
  label,
  value,
  onValueChange,
  placeholder,
  error = false,
  errorMessage,
  maximumDate,
  minimumDate,
}: FormDatePickerProps) {
  const labelClass = "mb-3 text-base font-conviven-semibold text-foreground";
  const errorClass = "mt-1 text-sm font-conviven-semibold text-destructive";

  return (
    <View className="mb-4">
      <Text className={labelClass}>{label}</Text>
      <DatePicker
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        error={error}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
      />
      {errorMessage && <Text className={errorClass}>{errorMessage}</Text>}
    </View>
  );
}
