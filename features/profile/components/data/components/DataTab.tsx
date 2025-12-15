import { PersonalDataSection } from "./PersonalDataSection";
import { StyleSheet, ScrollView } from "react-native";

interface DataTabProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
  firstName: string;
  lastName: string;
  bio: string;
  occupation: string;
  education: string;
  birthDate: string | null;
  user: any;
  draftLocation: {
    neighborhoodId: string | null;
    cityId: string | null;
    departmentId: string | null;
  } | null;
  locationModalVisible: boolean;
  setLocationModalVisible: (visible: boolean) => void;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setBio: (value: string) => void;
  setOccupation: (value: string) => void;
  setEducation: (value: string) => void;
  setBirthDate: (value: string) => void;
  handleLocationConfirm: (selectedIds: string[], mainId?: string | null) => void;
}

export const DataTab: React.FC<DataTabProps> = ({
  getSelectedLabel,
  openSelectionModal,
  firstName,
  lastName,
  bio,
  occupation,
  education,
  birthDate,
  user,
  draftLocation,
  locationModalVisible,
  setLocationModalVisible,
  setFirstName,
  setLastName,
  setBio,
  setOccupation,
  setEducation,
  setBirthDate,
  handleLocationConfirm,
}) => {
  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <PersonalDataSection
        getSelectedLabel={getSelectedLabel}
        openSelectionModal={openSelectionModal}
        firstName={firstName}
        lastName={lastName}
        bio={bio}
        occupation={occupation}
        education={education}
        birthDate={birthDate}
        user={user}
        draftLocation={draftLocation}
        locationModalVisible={locationModalVisible}
        setLocationModalVisible={setLocationModalVisible}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setBio={setBio}
        setOccupation={setOccupation}
        setEducation={setEducation}
        setBirthDate={setBirthDate}
        handleLocationConfirm={handleLocationConfirm}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
});
