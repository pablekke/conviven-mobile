import { ConvivenciaSection } from "./ConvivenciaSection";
import { StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MascotasSection } from "./MascotasSection";
import { LocationSection } from "./LocationSection";
import { HabitosSection } from "./HabitosSection";
import type { UserInfoCardProps } from "./types";
import { PerfilSection } from "./PerfilSection";
import { BioSection } from "./BioSection";
import { QuickChipsSection } from "./QuickChipsSection";
import { Divider } from "./Divider";
import { Header } from "./Header";

export function UserInfoCard({ profile, location, filters, budgetFull, style }: UserInfoCardProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
      <LinearGradient
        colors={["#F8FAFC", "#EFF6FF", "#DBEAFE"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.container, style]}
      >
        <Header budgetFull={budgetFull} />
        <BioSection bio={profile.bio} />
        <QuickChipsSection profile={profile} />
        <Divider />
        <LocationSection location={location} filters={filters} />
        <ConvivenciaSection profile={profile} />
        <MascotasSection profile={profile} />
        <HabitosSection profile={profile} />
        <PerfilSection profile={profile} />
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: "transparent",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
});
