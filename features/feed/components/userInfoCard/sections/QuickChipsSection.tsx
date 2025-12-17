import { ScrollView, StyleSheet } from "react-native";
import { QuietHours } from "../components/QuietHours";
import type { Profile } from "../utils/types";
import { Chip } from "../components/Chip";
import { t } from "../utils/mappers";
import React from "react";

interface QuickChipsSectionProps {
  profile: Profile;
}

export const QuickChipsSection: React.FC<QuickChipsSectionProps> = ({ profile }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.quickChips}
  >
    {profile.zodiacSign && profile.zodiacSign !== "NONE" ? (
      <Chip label={`🔮 ${t.zodiac(profile.zodiacSign)}`} subtle />
    ) : null}
    <Chip label={`☀️ ${t.schedule(profile.schedule)}`} subtle />
    <QuietHours start={profile.quietHoursStart ?? 22} end={profile.quietHoursEnd ?? 7} />
    <Chip label={t.tidiness(profile.tidiness)} />
    <Chip label={t.guests(profile.guestsFreq)} />
    <Chip label={t.share(profile.sharePolicy)} />
    <Chip label={`🎵 ${t.music(profile.musicUsage)}`} />
  </ScrollView>
);

const styles = StyleSheet.create({
  quickChips: {
    paddingBottom: 4,
    marginBottom: 12,
  },
});

