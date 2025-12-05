import { ScrollView, StyleSheet } from "react-native";
import { SectionTitle } from "./SectionTitle";
import type { Profile } from "./types";
import { Chip } from "./Chip";
import { t } from "./mappers";
import React from "react";

interface HabitosSectionProps {
  profile: Profile;
}

export const HabitosSection: React.FC<HabitosSectionProps> = ({ profile }) => (
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
