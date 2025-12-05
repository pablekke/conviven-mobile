import { View, ScrollView, StyleSheet } from "react-native";
import { SectionTitle } from "./SectionTitle";
import { QuietHours } from "./QuietHours";
import type { Profile } from "./types";
import { Chip } from "./Chip";
import { t } from "./mappers";
import { Row } from "./Row";
import React from "react";

interface ConvivenciaSectionProps {
  profile: Profile;
}

export const ConvivenciaSection: React.FC<ConvivenciaSectionProps> = ({ profile }) => (
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
