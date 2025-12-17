import { CohabitationSection } from "./sections/CohabitationSection";
import { LocationSection } from "./sections/LocationSection";
import { StyleSheet, ScrollView, View } from "react-native";
import { ProfileSection } from "./sections/ProfileSection";
import { HabitsSection } from "./sections/HabitsSection";
import type { UserInfoCardProps } from "./utils/types";
import { PetsSection } from "./sections/PetsSection";
import { BioSection } from "./sections/BioSection";
import { Divider } from "./components/Divider";
import { Header } from "./components/Header";

export function UserInfoCard({ profile, location, filters, budgetFull, style }: UserInfoCardProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
      <View style={[styles.container, style]}>
        <Header budgetFull={budgetFull} />
        <BioSection bio={profile.bio} />
        <Divider />
        <LocationSection location={location} filters={filters} />
        <CohabitationSection profile={profile} />
        <PetsSection profile={profile} />
        <HabitsSection profile={profile} />
        <ProfileSection profile={profile} />
      </View>
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
    paddingBottom: 60,
  },
});
