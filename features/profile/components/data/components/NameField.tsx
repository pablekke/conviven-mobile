import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../../../../../context/ThemeContext";

interface NameFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export const NameField: React.FC<NameFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: colors.card,
            color: colors.foreground,
            borderColor: colors.border,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
});
