import { ScrollView, StyleSheet } from "react-native";
import { SectionTitle } from "../components/SectionTitle";
import type { Profile } from "../utils/types";
import { BoolPill } from "../components/BoolPill";
import { Chip } from "../components/Chip";
import { t } from "../utils/mappers";
import React from "react";

interface PetsSectionProps {
  profile: Profile;
}

export const PetsSection: React.FC<PetsSectionProps> = ({ profile }) => {
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
    paddingVertical: 4
  },
});

