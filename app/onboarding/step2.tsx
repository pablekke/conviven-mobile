import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/context/ThemeContext";
import Toast from "react-native-toast-message";
import NativeSelect from "@/components/Select";
import userProfileUpdateService from "@/features/profile/services/userProfileUpdateService";
import {
  Tidiness,
  TIDINESS_LABELS,
  Schedule,
  SCHEDULE_LABELS,
  GuestsFreq,
  GUESTS_LABELS,
  MusicUsage,
  MUSIC_LABELS,
  SmokesCigarettes,
  SMOKING_LABELS,
  SmokesWeed,
  WEED_LABELS,
  Alcohol,
  ALCOHOL_LABELS,
  PetsOk,
  PETS_OK_LABELS,
  Cooking,
  COOKING_LABELS,
  Diet,
  DIET_LABELS,
  SharePolicy,
  SHARE_LABELS,
  Interest,
  PetType,
} from "@/features/profile/enums/searchPreferences.enums";

const INTEREST_DISPLAY: Record<string, string> = {
  [Interest.GAMING]: "Gaming",
  [Interest.READING]: "Lectura",
  [Interest.COOKING]: "Cocina",
  [Interest.SPORTS]: "Deporte",
  [Interest.MUSIC]: "Música",
  [Interest.TRAVEL]: "Viajes",
  [Interest.ART]: "Arte",
  [Interest.TECHNOLOGY]: "Tecnología",
  [Interest.FITNESS]: "Fitness",
  [Interest.PHOTOGRAPHY]: "Fotografía",
  [Interest.MOVIES]: "Cine",
  [Interest.DANCE]: "Baile",
  [Interest.OTHER]: "Otro",
};

const PET_DISPLAY: Record<string, string> = {
  [PetType.DOG]: "Perro",
  [PetType.CAT]: "Gato",
  [PetType.BIRD]: "Ave",
  [PetType.FISH]: "Pez",
  [PetType.OTHER]: "Otro",
};

export default function OnboardingStep2() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  // Form State
  const [bio, setBio] = useState("");
  const [tidiness, setTidiness] = useState<Tidiness | "">("");
  const [schedule, setSchedule] = useState<Schedule | "">("");
  const [guestsFreq, setGuestsFreq] = useState<GuestsFreq | "">("");
  const [musicUsage, setMusicUsage] = useState<MusicUsage | "">("");
  const [quietHoursStart, setQuietHoursStart] = useState<string>("22");
  const [quietHoursEnd, setQuietHoursEnd] = useState<string>("7");
  const [smokesCigarettes, setSmokesCigarettes] = useState<SmokesCigarettes | "">("");
  const [smokesWeed, setSmokesWeed] = useState<SmokesWeed | "">("");
  const [alcohol, setAlcohol] = useState<Alcohol | "">("");
  const [petsOwned, setPetsOwned] = useState<PetType[]>([]);
  const [petsOk, setPetsOk] = useState<PetsOk | "">("");
  const [cooking, setCooking] = useState<Cooking | "">("");
  const [diet, setDiet] = useState<Diet | "">("");
  const [sharePolicy, setSharePolicy] = useState<SharePolicy | "">("");
  const [interests, setInterests] = useState<Interest[]>([]);

  // Helpers
  const enumToOptions = (enumObj: object, labels: Record<string, string>) => {
    return Object.values(enumObj).map(val => ({
      label: labels[val] || val,
      value: val,
    }));
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    label: `${i}:00`,
    value: i.toString(),
  }));

  const toggleInterest = (interest: Interest) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest],
    );
  };

  const togglePetOwned = (pet: PetType) => {
    setPetsOwned(prev => (prev.includes(pet) ? prev.filter(p => p !== pet) : [...prev, pet]));
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      const payload: any = {
        bio,
        tidiness: tidiness || undefined,
        schedule: schedule || undefined,
        guestsFreq: guestsFreq || undefined,
        musicUsage: musicUsage || undefined,
        quietHoursStart: parseInt(quietHoursStart, 10),
        quietHoursEnd: parseInt(quietHoursEnd, 10),
        smokesCigarettes: smokesCigarettes || undefined,
        smokesWeed: smokesWeed || undefined,
        alcohol: alcohol || undefined,
        petsOwned,
        petsOk: petsOk || undefined,
        cooking: cooking || undefined,
        diet: diet || undefined,
        sharePolicy: sharePolicy || undefined,
        interests,
      };

      await userProfileUpdateService.updateUserProfile(payload);

      Toast.show({
        type: "success",
        text1: "Perfil actualizado",
        text2: "Continuando...",
      });
      router.push("/onboarding/step3");
    } catch (error) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo actualizar el perfil.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.stepText}>Paso 2 de 3</Text>
            <Text style={styles.title}>Tu Perfil</Text>
            <Text style={styles.subtitle}>
              Contanos cómo sos para encontrar a tu compañero ideal.
            </Text>
          </View>

          <View style={styles.formSection}>
            {/* Bio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Presentación (Bio)</Text>
              <TextInput
                style={[styles.bioInput, styles.bioInputHeight]}
                placeholder="Hola! Busco..."
                multiline
                numberOfLines={4}
                value={bio}
                onChangeText={setBio}
                textAlignVertical="top"
              />
            </View>

            {/* Basic Habits */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Orden y Limpieza</Text>
              <NativeSelect
                placeholder="Seleccioná..."
                options={enumToOptions(Tidiness, TIDINESS_LABELS)}
                selectedValue={tidiness}
                onValueChange={v => setTidiness(v as Tidiness)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Horarios de sueño</Text>
              <NativeSelect
                placeholder="Seleccioná..."
                options={enumToOptions(Schedule, SCHEDULE_LABELS)}
                selectedValue={schedule}
                onValueChange={v => setSchedule(v as Schedule)}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Horas tranqui (Inicio)</Text>
                <NativeSelect
                  placeholder="22:00"
                  options={hourOptions}
                  selectedValue={quietHoursStart}
                  onValueChange={setQuietHoursStart}
                />
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Horas tranqui (Fin)</Text>
                <NativeSelect
                  placeholder="07:00"
                  options={hourOptions}
                  selectedValue={quietHoursEnd}
                  onValueChange={setQuietHoursEnd}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Frecuencia de visitas</Text>
              <NativeSelect
                placeholder="Seleccioná..."
                options={enumToOptions(GuestsFreq, GUESTS_LABELS)}
                selectedValue={guestsFreq}
                onValueChange={v => setGuestsFreq(v as GuestsFreq)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Uso de música/parlantes</Text>
              <NativeSelect
                placeholder="Seleccioná..."
                options={enumToOptions(MusicUsage, MUSIC_LABELS)}
                selectedValue={musicUsage}
                onValueChange={v => setMusicUsage(v as MusicUsage)}
              />
            </View>

            {/* Smoking / Alcohol */}
            <Text style={styles.sectionTitle}>Hábitos</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cigarrillo</Text>
              <NativeSelect
                placeholder="Seleccioná..."
                options={enumToOptions(SmokesCigarettes, SMOKING_LABELS)}
                selectedValue={smokesCigarettes}
                onValueChange={v => setSmokesCigarettes(v as SmokesCigarettes)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Marihuana</Text>
              <NativeSelect
                placeholder="Seleccioná..."
                options={enumToOptions(SmokesWeed, WEED_LABELS)}
                selectedValue={smokesWeed}
                onValueChange={v => setSmokesWeed(v as SmokesWeed)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alcohol</Text>
              <NativeSelect
                placeholder="Seleccioná..."
                options={enumToOptions(Alcohol, ALCOHOL_LABELS)}
                selectedValue={alcohol}
                onValueChange={v => setAlcohol(v as Alcohol)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cocina</Text>
              <NativeSelect
                placeholder="Seleccioná..."
                options={enumToOptions(Cooking, COOKING_LABELS)}
                selectedValue={cooking}
                onValueChange={v => setCooking(v as Cooking)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dieta</Text>
              <NativeSelect
                placeholder="Seleccioná..."
                options={enumToOptions(Diet, DIET_LABELS)}
                selectedValue={diet}
                onValueChange={v => setDiet(v as Diet)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Política de compartir cosas</Text>
              <NativeSelect
                placeholder="Seleccioná..."
                options={enumToOptions(SharePolicy, SHARE_LABELS)}
                selectedValue={sharePolicy}
                onValueChange={v => setSharePolicy(v as SharePolicy)}
              />
            </View>

            {/* Pets */}
            <Text style={styles.sectionTitle}>Mascotas</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>¿Tenés mascotas?</Text>
              <View style={styles.pillContainer}>
                {Object.values(PetType).map(pet => {
                  const isSelected = petsOwned.includes(pet);
                  return (
                    <TouchableOpacity
                      key={pet}
                      style={[
                        styles.pill,
                        isSelected && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                      ]}
                      onPress={() => togglePetOwned(pet)}
                    >
                      <Text style={[styles.pillText, isSelected && styles.selectedPillText]}>
                        {PET_DISPLAY[pet] || pet}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>¿Aceptás mascotas?</Text>
              <NativeSelect
                placeholder="Seleccioná..."
                options={enumToOptions(PetsOk, PETS_OK_LABELS)}
                selectedValue={petsOk}
                onValueChange={v => setPetsOk(v as PetsOk)}
              />
            </View>

            {/* Interests */}
            <Text style={styles.sectionTitle}>Intereses</Text>
            <View style={styles.pillContainer}>
              {Object.values(Interest).map(interest => {
                const isSelected = interests.includes(interest);
                return (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.pill,
                      isSelected && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text style={[styles.pillText, isSelected && styles.selectedPillText]}>
                      {INTEREST_DISPLAY[interest] || interest}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.spacer} />

          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.primary }]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.continueText}>{loading ? "Guardando..." : "Siguiente"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    marginTop: 10,
  },
  stepText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  title: {
    fontFamily: "Inter-Bold",
    fontSize: 32,
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
  },
  sectionTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    backgroundColor: "#F9FAFB",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  pillText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#374151",
  },
  selectedPillText: {
    color: "#FFFFFF",
  },
  spacer: {
    height: 40,
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  continueText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  bioInputHeight: {
    height: 100,
  },
  flex1: {
    flex: 1,
  },
});
