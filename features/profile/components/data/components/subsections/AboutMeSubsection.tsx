import React from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";
import { NameField } from "../NameField";
import { useTheme } from "../../../../../../context/ThemeContext";

interface AboutMeSubsectionProps {
  occupation: string;
  setOccupation: (text: string) => void;
  education: string;
  setEducation: (text: string) => void;
  bio: string;
  setBio: (text: string) => void;
}

const BioField = ({ label, value, onChangeText, placeholder }: any) => {
  const { colors } = useTheme();
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          styles.textArea,
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
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );
};

export const AboutMeSubsection: React.FC<AboutMeSubsectionProps> = ({
  occupation,
  setOccupation,
  education,
  setEducation,
  bio,
  setBio,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.half}>
          <NameField
            label="Ocupación"
            value={occupation}
            onChangeText={setOccupation}
            placeholder="Ocupación"
          />
        </View>
        <View style={styles.half}>
          <NameField
            label="Educación"
            value={education}
            onChangeText={setEducation}
            placeholder="Educación"
          />
        </View>
      </View>
      <BioField
        label="Sobre mí"
        value={bio}
        onChangeText={setBio}
        placeholder="Contanos un poco sobre vos..."
      />
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
  textArea: {
    minHeight: 100,
  },
});
