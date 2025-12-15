import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../../../../../context/ThemeContext";
import { BirthDateField } from "../BirthDateField";
import { Feather } from "@expo/vector-icons";
import { NameField } from "../NameField";
import React from "react";

interface BasicDataSubsectionProps {
  firstName: string;
  setFirstName: (text: string) => void;
  lastName: string;
  setLastName: (text: string) => void;
  birthDate: string | null | undefined;
  setBirthDate: (date: string) => void;
  genderLabel: string;
  onGenderPress: () => void;
}

const SelectionField = ({ label, value, onPress, placeholder = "Seleccionar" }: any) => {
  const { colors } = useTheme();
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.textInput,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={onPress}
      >
        <Text
          style={[
            styles.valueText,
            {
              color: value && value !== "Seleccionar" ? colors.foreground : colors.mutedForeground,
            },
          ]}
        >
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
};

export const BasicDataSubsection: React.FC<BasicDataSubsectionProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  birthDate,
  setBirthDate,
  genderLabel,
  onGenderPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.half}>
          <NameField
            label="Nombre"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Nombre"
          />
        </View>
        <View style={styles.half}>
          <NameField
            label="Apellido"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Apellido"
          />
        </View>
      </View>

      <SelectionField
        label="Género"
        value={genderLabel}
        onPress={onGenderPress}
        placeholder="Género"
      />

      <BirthDateField value={birthDate} onValueChange={setBirthDate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
  },
  inputContainer: {
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valueText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
});
