import { useDataPreferencesLogic } from "../hooks/useDataPreferencesLogic";
import { LocationSelectionModal } from "../LocationSelectionModal";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../../../../../context/ThemeContext";
import { useAuth } from "../../../../../context/AuthContext";
import { SectionHeader } from "../../SectionHeader";
import { BirthDateField } from "./BirthDateField";
import { QuestionRow } from "../../QuestionRow";
import { NameField } from "./NameField";
import React from "react";

interface PersonalDataSectionProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({
  getSelectedLabel,
  openSelectionModal,
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const {
    firstName,
    lastName,
    bio,
    occupation,
    education,
    locationModalVisible,
    setLocationModalVisible,
    setFirstName,
    setLastName,
    setBio,
    setOccupation,
    setEducation,
    setBirthDate,
    handleLocationConfirm,
    getLocationLabel,
  } = useDataPreferencesLogic();

  return (
    <View style={styles.section}>
      <SectionHeader icon="user" title="Información Personal" />

      <View style={styles.nameRowContainer}>
        <NameField
          label="Nombre"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Ingresa tu nombre"
        />
        <NameField
          label="Apellido"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Ingresa tu apellido"
        />
      </View>

      <BirthDateField value={user?.birthDate} onValueChange={setBirthDate} />

      <QuestionRow
        question="Género"
        selectedValue={getSelectedLabel("gender")}
        onPress={() => openSelectionModal("gender")}
      />

      <QuestionRow
        question="Ubicación"
        selectedValue={getLocationLabel()}
        onPress={() => setLocationModalVisible(true)}
      />

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Ocupación</Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.card,
              color: colors.foreground,
              borderColor: colors.border,
            },
          ]}
          value={occupation}
          onChangeText={setOccupation}
          placeholder="Ingresa tu ocupación"
          placeholderTextColor={colors.mutedForeground}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Educación</Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.card,
              color: colors.foreground,
              borderColor: colors.border,
            },
          ]}
          value={education}
          onChangeText={setEducation}
          placeholder="Ingresa tu educación"
          placeholderTextColor={colors.mutedForeground}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Descripción</Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.card,
              color: colors.foreground,
              borderColor: colors.border,
            },
          ]}
          multiline
          numberOfLines={6}
          value={bio}
          onChangeText={setBio}
          placeholder="Cuéntanos sobre ti..."
          placeholderTextColor={colors.mutedForeground}
          textAlignVertical="top"
        />
      </View>

      <LocationSelectionModal
        visible={locationModalVisible}
        selectedDepartmentId={user?.departmentId}
        selectedCityId={user?.cityId}
        selectedNeighborhoodId={user?.neighborhoodId}
        onClose={() => setLocationModalVisible(false)}
        onConfirm={handleLocationConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
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
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 120,
    fontFamily: "Inter-Regular",
  },
  nameRowContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
});
