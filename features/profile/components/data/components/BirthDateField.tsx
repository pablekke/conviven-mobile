import DatePickerComponent from "../../../../../components/DatePicker";
import { useTheme } from "../../../../../context/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";

interface BirthDateFieldProps {
  value: string | null | undefined;
  onValueChange: (dateString: string) => void;
  placeholder?: string;
}

export const BirthDateField: React.FC<BirthDateFieldProps> = ({
  value,
  onValueChange,
  placeholder = "Seleccioná tu fecha de nacimiento",
}) => {
  const { colors } = useTheme();

  const formatBirthDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    try {
      if (dateString.includes("T")) {
        const datePart = dateString.split("T")[0];
        if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return datePart;
        }
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const calculateAge = (): number | null => {
    if (!value) return null;
    try {
      const birth = new Date(value);
      if (isNaN(birth.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age >= 0 ? age : null;
    } catch {
      return null;
    }
  };

  const getInitialDate = (): Date => {
    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch {
        // Fall through to default
      }
    }
    return new Date(2000, 0, 1);
  };

  const maximumDate = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
  }, []);

  const minimumDate = useMemo(() => {
    return new Date(new Date().getFullYear() - 100, 0, 1);
  }, []);

  const age = calculateAge();

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>Fecha de nacimiento</Text>
      <View style={styles.datePickerWrapper}>
        <View style={styles.datePickerContainer}>
          <DatePickerComponent
            value={formatBirthDate(value)}
            onValueChange={onValueChange}
            placeholder={placeholder}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            initialDate={getInitialDate()}
          />
        </View>
        {age !== null && (
          <Text style={[styles.ageText, { color: colors.mutedForeground }]}>{age} años</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginBottom: 8,
  },
  datePickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  datePickerContainer: {
    flex: 1,
  },
  ageText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
});
