import { ScrollView, StyleSheet } from "react-native";
import { SectionTitle } from "./SectionTitle";
import type { Profile } from "./types";
import { BoolPill } from "./BoolPill";
import { Chip } from "./Chip";
import { t } from "./mappers";
import React from "react";

interface MascotasSectionProps {
  profile: Profile;
}

export const MascotasSection: React.FC<MascotasSectionProps> = ({ profile }) => {
  const hasDog = (profile.petsOwned ?? []).some(p => /perro|dog/i.test(p));
  const hasCat = (profile.petsOwned ?? []).some(p => /gato|cat/i.test(p));
  const hasPetsInfo = hasDog || hasCat || (profile.petsOk && profile.petsOk !== "NONE");

  if (!hasPetsInfo) return null;

  return (
    <>
      <SectionTitle>Mascotas</SectionTitle>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        <BoolPill yes={!!hasDog} yesLabel="Tiene perro" noLabel="Sin perro" />
        <BoolPill yes={!!hasCat} yesLabel="Tiene gato" noLabel="Sin gato" />
        <Chip label={`🐶 ${t.petsOk(profile.petsOk)}`} />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  chipsContainer: {
    paddingVertical: 4,
    marginTop: 6,
  },
});
