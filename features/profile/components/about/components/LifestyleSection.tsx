import { InterestsSubsection } from "./subsections/InterestsSubsection";
import { HabitsSubsection } from "./subsections/HabitsSubsection";
import { LivingSubsection } from "./subsections/LivingSubsection";
import { PetsSubsection } from "./subsections/PetsSubsection";
import { FoodSubsection } from "./subsections/FoodSubsection";
import { SectionHeader } from "../../SectionHeader";
import { StyleSheet, View } from "react-native";
import React from "react";

interface LifestyleSectionProps {
  getSelectedLabel: (key: string) => string;
  openSelectionModal: (key: string) => void;
}

export const LifestyleSection: React.FC<LifestyleSectionProps> = props => {
  return (
    <View style={styles.section}>
      <SectionHeader icon="home" title="Estilo de Convivencia" />
      <HabitsSubsection {...props} />
      <PetsSubsection {...props} />
      <LivingSubsection {...props} />
      <FoodSubsection {...props} />
      <InterestsSubsection {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
});
