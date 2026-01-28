import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/context/ThemeContext";
import FormNeighborhoodSearch from "@/features/register/components/FormNeighborhoodSearch";
import searchFiltersService from "@/features/profile/services/searchFiltersService";
import Toast from "react-native-toast-message";

export default function OnboardingStep1() {
  const router = useRouter();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);

  // States for all fields
  const [neighborhood, setNeighborhood] = useState<{ id: string; name: string } | null>(null);
  const [genderPref, setGenderPref] = useState<string[]>([]);
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [onlyWithPhoto, setOnlyWithPhoto] = useState(true);

  const genderOptions = [
    { label: "Ellas", value: "FEMALE" },
    { label: "Ellos", value: "MALE" },
    { label: "Indistinto", value: "ANY" },
  ];

  const toggleGender = (value: string) => {
    if (value === "ANY") {
      setGenderPref(["ANY"]);
      return;
    }
    let current = [...genderPref];
    if (current.includes("ANY")) current = [];

    if (current.includes(value)) {
      current = current.filter(g => g !== value);
    } else {
      current.push(value);
    }

    if (current.length === 0) setGenderPref([]);
    else setGenderPref(current);
  };

  const handleContinue = async () => {
    // Validations
    if (!neighborhood) {
      Toast.show({
        type: "error",
        text1: "Falta ubicación",
        text2: "Seleccioná un barrio de preferencia.",
      });
      return;
    }
    if (genderPref.length === 0) {
      Toast.show({
        type: "error",
        text1: "Seleccioná género",
        text2: "Elegí con quién te gustaría convivir.",
      });
      return;
    }

    // Save and continue
    setLoading(true);
    try {
      const payload = {
        mainPreferredLocation: neighborhood.id,
        preferredLocations: [neighborhood.id], // Sync with main for now
        includeAdjacentNeighborhoods: false, // Default since removed from UI
        genderPref,
        genders: genderPref,
        minAge: minAge ? parseInt(minAge, 10) : 18,
        maxAge: maxAge ? parseInt(maxAge, 10) : 60,
        budgetMin: budgetMin ? parseInt(budgetMin, 10) : 0,
        budgetMax: budgetMax ? parseInt(budgetMax, 10) : 0,
        onlyWithPhoto,
      };

      await searchFiltersService.upsertSearchFilters(payload as any);

      Toast.show({
        type: "success",
        text1: "¡Preferencias guardadas!",
        text2: "Continuando...",
      });

      router.push("/onboarding/step2");
    } catch (error) {
      console.error("Error saving filters:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron guardar las preferencias.",
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
            <Text style={styles.stepText}>Paso 1 de 3</Text>
            <Text style={styles.title}>Definí tus preferencias</Text>
            <Text style={styles.subtitle}>
              Completá estos datos para que podamos mostrarte los roomies ideales.
            </Text>
          </View>

          <View style={styles.formSection}>
            {/* Location */}
            <View style={styles.inputGroup}>
              <FormNeighborhoodSearch
                label="Barrio principal"
                selectedNeighborhoodName={neighborhood?.name || ""}
                onSelect={n => setNeighborhood({ id: n.id, name: n.name })}
                error={undefined}
              />
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Género del roomie</Text>
              <View style={styles.pillContainer}>
                {genderOptions.map(opt => {
                  const isSelected = genderPref.includes(opt.value);
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.pill,
                        isSelected && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                      ]}
                      onPress={() => toggleGender(opt.value)}
                    >
                      <Text style={[styles.pillText, isSelected && styles.selectedPillText]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Age */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rango de edad</Text>
              <View style={styles.rowInputs}>
                <TextInput
                  style={styles.input}
                  placeholder="Mín (18)"
                  keyboardType="number-pad"
                  value={minAge}
                  onChangeText={setMinAge}
                />
                <Text style={styles.separator}>-</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Máx (99)"
                  keyboardType="number-pad"
                  value={maxAge}
                  onChangeText={setMaxAge}
                />
              </View>
            </View>

            {/* Budget */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Presupuesto mensual ($)</Text>
              <View style={styles.rowInputs}>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo"
                  keyboardType="number-pad"
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                />
                <Text style={styles.separator}>-</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Máximo"
                  keyboardType="number-pad"
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                />
              </View>
            </View>

            {/* Photo Filter */}
            <View style={styles.inputGroupRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.label}>Solo perfiles con foto</Text>
                <Text style={styles.helperText}>
                  Te recomendamos activar esta opción para más confianza.
                </Text>
              </View>
              <Switch
                value={onlyWithPhoto}
                onValueChange={setOnlyWithPhoto}
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor="#f4f3f4"
              />
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
  formSection: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputGroupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
  },
  switchTextContainer: {
    flex: 1,
  },
  label: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  helperText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#6B7280",
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  rowInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    backgroundColor: "#F9FAFB",
  },
  separator: {
    fontSize: 20,
    color: "#9CA3AF",
  },
  spacer: {
    height: 40,
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
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
});
