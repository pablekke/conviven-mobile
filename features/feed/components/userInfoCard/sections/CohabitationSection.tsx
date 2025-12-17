import { View, ScrollView, StyleSheet } from "react-native";
import { SectionTitle } from "../components/SectionTitle";
import { QuietHours } from "../components/QuietHours";
import type { Profile } from "../utils/types";
import { Chip } from "../components/Chip";
import { t } from "../utils/mappers";
import { Row } from "../components/Row";
import React from "react";

interface CohabitationSectionProps {
  profile: Profile;
}

export const CohabitationSection: React.FC<CohabitationSectionProps> = ({ profile }) => (
  <>
    <SectionTitle>Convivencia</SectionTitle>
    <View>
      <Row label="Visitas" value={t.guests(profile.guestsFreq)} />
      <Row label="Compartir" value={t.share(profile.sharePolicy)} />
      <Row label="Sonido" value={t.music(profile.musicUsage)} />
      <Row
        label="Rutina"
        value={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            <Chip label={t.schedule(profile.schedule)} subtle />
            <QuietHours start={profile.quietHoursStart ?? 22} end={profile.quietHoursEnd ?? 7} />
            <Chip label={t.tidiness(profile.tidiness)} />
          </ScrollView>
        }
      />
    </View>
  </>
);

const styles = StyleSheet.create({

  chipsContainer: {
    paddingVertical: 4,
    marginTop: 6,
  },
});

