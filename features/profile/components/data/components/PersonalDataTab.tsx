import { StyleSheet, Text, TextInput, View, ScrollView } from "react-native";
import DatePickerComponent from "../../../../../components/DatePicker";
import LocationService from "../../../../../services/locationService";
import { LocationSelectionModal } from "../LocationSelectionModal";
import { useTheme } from "../../../../../context/ThemeContext";
import ProfileService from "../../../services/profileService";
import { useAuth } from "../../../../../context/AuthContext";
import { SectionHeader } from "../../SectionHeader";
import React, { useState, useEffect } from "react";
import { QuestionRow } from "../../QuestionRow";

const calculateAge = (birthDate: string | null | undefined): number | null => {
  if (!birthDate) return null;
  try {
    const birth = new Date(birthDate);
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

interface PersonalDataTabProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const PersonalDataTab: React.FC<PersonalDataTabProps> = ({
  getSelectedLabel,
  openSelectionModal,
}) => {
  const { user, updateUser } = useAuth();
  const { colors } = useTheme();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profession, setProfession] = useState(user?.profession || "");
  const [hobby, setHobby] = useState(user?.hobby || "");
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setBio(user.bio || "");
      setPhone(user.phone || "");
      setProfession(user.profession || "");
      setHobby(user.hobby || "");
    }
  }, [user]);

  const handleFirstNameChange = (text: string) => {
    const filteredText = text.replace(/[0-9]/g, "");
    setFirstName(filteredText);
    updateUser({ firstName: filteredText });
  };

  const handleLastNameChange = (text: string) => {
    const filteredText = text.replace(/[0-9]/g, "");
    setLastName(filteredText);
    updateUser({ lastName: filteredText });
  };

  const handleBioChange = (text: string) => {
    setBio(text);
    updateUser({ bio: text });
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    updateUser({ phone: text });
  };

  const handleProfessionChange = (text: string) => {
    setProfession(text);
    updateUser({ profession: text });
    if (user) {
      ProfileService.update(user.id, { profession: text }).catch(() => {});
    }
  };

  const handleHobbyChange = (text: string) => {
    setHobby(text);
    updateUser({ hobby: text });
    if (user) {
      ProfileService.update(user.id, { hobby: text }).catch(() => {});
    }
  };

  const age = calculateAge(user?.birthDate);

  const getLocationLabel = () => {
    if (user?.neighborhoodName) return user.neighborhoodName;
    if (user?.cityName) return user.cityName;
    if (user?.departmentName) return user.departmentName;
    return "Seleccionar";
  };

  const handleLocationConfirm = async (
    departmentId: string,
    cityId: string,
    neighborhoodId: string,
  ) => {
    if (!user) return;

    try {
      const [department, city, neighborhood] = await Promise.all([
        LocationService.getDepartment(departmentId),
        LocationService.getCity(cityId),
        LocationService.getNeighborhood(neighborhoodId),
      ]);

      const updatedUser = await ProfileService.update(user.id, {
        departmentId,
        cityId,
        neighborhoodId,
        departmentName: department.name,
        cityName: city.name,
        neighborhoodName: neighborhood.name,
      });

      updateUser(updatedUser);
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };
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

  const getInitialDate = (): Date => {
    if (user?.birthDate) {
      try {
        const date = new Date(user.birthDate);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch {
        // Fall through to default
      }
    }
    return new Date(2000, 0, 1);
  };

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <SectionHeader icon="user" title="Información Personal" />

        <View style={styles.nameRowContainer}>
          <View style={[styles.inputContainer, styles.nameInputContainer]}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Nombre</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.card,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              value={firstName}
              onChangeText={handleFirstNameChange}
              placeholder="Ingresa tu nombre"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={[styles.inputContainer, styles.nameInputContainer]}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Apellido</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.card,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              value={lastName}
              onChangeText={handleLastNameChange}
              placeholder="Ingresa tu apellido"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Fecha de nacimiento</Text>
          <View style={styles.datePickerWrapper}>
            <View style={styles.datePickerContainer}>
              <DatePickerComponent
                value={formatBirthDate(user?.birthDate)}
                onValueChange={dateString => {
                  updateUser({ birthDate: dateString });
                }}
                placeholder="Seleccioná tu fecha de nacimiento"
                maximumDate={(() => {
                  const today = new Date();
                  return new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
                })()}
                minimumDate={new Date(new Date().getFullYear() - 100, 0, 1)}
                initialDate={getInitialDate()}
              />
            </View>
            {age !== null && (
              <Text style={[styles.ageText, { color: colors.mutedForeground }]}>{age} años</Text>
            )}
          </View>
        </View>

        <QuestionRow
          question="Género"
          selectedValue={getSelectedLabel("gender")}
          onPress={() => openSelectionModal("gender")}
        />

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Teléfono</Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: colors.border,
              },
            ]}
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder="Ingresa tu teléfono"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
          />
        </View>

        <QuestionRow
          question="Ubicación"
          selectedValue={getLocationLabel()}
          onPress={() => setLocationModalVisible(true)}
        />

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Profesión</Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: colors.border,
              },
            ]}
            value={profession}
            onChangeText={handleProfessionChange}
            placeholder="Ingresa tu profesión"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Hobby</Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: colors.border,
              },
            ]}
            value={hobby}
            onChangeText={handleHobbyChange}
            placeholder="Ingresa tu hobby o pasatiempo"
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
            onChangeText={handleBioChange}
            placeholder="Cuéntanos sobre ti..."
            placeholderTextColor={colors.mutedForeground}
            textAlignVertical="top"
          />
        </View>
      </View>

      <LocationSelectionModal
        visible={locationModalVisible}
        selectedDepartmentId={user?.departmentId}
        selectedCityId={user?.cityId}
        selectedNeighborhoodId={user?.neighborhoodId}
        onClose={() => setLocationModalVisible(false)}
        onConfirm={handleLocationConfirm}
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
  nameRowContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  nameInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
});
