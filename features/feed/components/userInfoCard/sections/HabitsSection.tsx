import { ScrollView, StyleSheet } from "react-native";
import { SectionTitle } from "../components/SectionTitle";
import type { Profile } from "../utils/types";
import { Chip } from "../components/Chip";
import { t } from "../utils/mappers";
import React from "react";

interface HabitsSectionProps {
  profile: Profile;
}

export const HabitsSection: React.FC<HabitsSectionProps> = ({ profile }) => (
  <>
    <SectionTitle>Hábitos</SectionTitle>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
    >
      <Chip label={`🚬 ${t.cigs(profile.smokesCigarettes)}`} />
      <Chip label={t.weed(profile.smokesWeed)} />
      <Chip label={t.alcohol(profile.alcohol)} />
      <Chip label={`👨‍🍳 ${t.cooking(profile.cooking)}`} />
      <Chip label={t.diet(profile.diet)} />
    </ScrollView>
  </>
);

const styles = StyleSheet.create({
  chipsContainer: {
    paddingVertical: 4,
  },
});

