import { View, Text, StyleSheet } from "react-native";
import type { Location, Filters } from "./types";
import { SectionTitle } from "./SectionTitle";
import { MiniChip } from "./MiniChip";
import { Row } from "./Row";
import React from "react";

interface LocationSectionProps {
  location: Location;
  filters: Filters;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ location, filters }) => (
  <>
    <SectionTitle>Ubicación</SectionTitle>
    <View style={styles.rowBlock}>
      <Row label="Actual" value={`${location.neighborhood.name}, ${location.city.name}`} />
      <Row
        label="Preferencia"
        value={`${filters.mainPreferredLocation.department.name} · ${filters.mainPreferredLocation.city.name} · ${filters.mainPreferredLocation.neighborhood.name}`}
      />
      {filters.preferredLocations?.length ? (
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Otras zonas</Text>
          <View style={styles.wrapChips}>
            {filters.preferredLocations.map((loc, i) => (
              <MiniChip key={String(i)}>
                {loc.department.name} · {loc.city.name} · {loc.neighborhood.name}
              </MiniChip>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  </>
);

const styles = StyleSheet.create({
  rowBlock: {
    marginBottom: 16,
  },
  row: {
    marginBottom: 14,
  },
  rowLabel: {
    fontSize: 12,
    color: "#60A5FA",
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  wrapChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
});
