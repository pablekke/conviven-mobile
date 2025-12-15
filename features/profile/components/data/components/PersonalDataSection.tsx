import { LocationAndZodiacSubsection, BasicDataSubsection, AboutMeSubsection } from "./subsections";
import { SectionHeader } from "../../SectionHeader";
import { StyleSheet, View } from "react-native";
import React from "react";

interface PersonalDataSectionProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;

  firstName: string;
  lastName: string;
  bio: string;
  occupation: string;
  education: string;
  birthDate: string | null;
  locationModalVisible: boolean;
  setLocationModalVisible: (visible: boolean) => void;

  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setBio: (value: string) => void;
  setOccupation: (value: string) => void;
  setEducation: (value: string) => void;
  setBirthDate: (value: string) => void;

  handleLocationConfirm: (selectedIds: string[], mainId?: string | null) => void;
  user: any;
  draftLocation: {
    neighborhoodId: string | null;
    cityId: string | null;
    departmentId: string | null;
  } | null;
}

export const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({
  getSelectedLabel,
  openSelectionModal,
  firstName,
  lastName,
  bio,
  occupation,
  education,
  birthDate,
  locationModalVisible,
  setLocationModalVisible,
  setFirstName,
  setLastName,
  setBio,
  setOccupation,
  setEducation,
  setBirthDate,
  handleLocationConfirm,
  user,
  draftLocation,
}) => {
  return (
    <View style={styles.section}>
      <SectionHeader icon="user" title="Información Personal" />

      <BasicDataSubsection
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        birthDate={birthDate ?? user?.birthDate}
        setBirthDate={setBirthDate}
        genderLabel={getSelectedLabel("gender")}
        onGenderPress={() => openSelectionModal("gender")}
      />

      <LocationAndZodiacSubsection
        onLocationPress={() => setLocationModalVisible(true)}
        zodiacSignLabel={
          getSelectedLabel("zodiacSign") !== "Seleccionar" ? getSelectedLabel("zodiacSign") : "-"
        }
        locationModalVisible={locationModalVisible}
        setLocationModalVisible={setLocationModalVisible}
        handleLocationConfirm={handleLocationConfirm}
        user={user}
        draftLocation={draftLocation}
      />

      <AboutMeSubsection
        occupation={occupation}
        setOccupation={setOccupation}
        education={education}
        setEducation={setEducation}
        bio={bio}
        setBio={setBio}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
});
