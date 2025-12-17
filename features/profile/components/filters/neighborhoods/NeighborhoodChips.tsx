import { useNeighborhoodsByIds } from "./hooks/useNeighborhoodsByIds";
import { NeighborhoodChip } from "./components/NeighborhoodChip";
import { ChipsEmptyState } from "./components/ChipsEmptyState";
import { ChipsErrorState } from "./components/ChipsErrorState";
import { ScrollView, StyleSheet } from "react-native";
import { SkeletonChips } from "./SkeletonChips";
import React from "react";

interface NeighborhoodChipsProps {
  neighborhoodIds: string[];
  onNeighborhoodsChange?: (ids: string[]) => void;
  editable?: boolean;
  cachedFilters?: any | null;
}

export const NeighborhoodChips: React.FC<NeighborhoodChipsProps> = ({
  neighborhoodIds,
  onNeighborhoodsChange,
  editable = true,
  cachedFilters,
}) => {
  const { neighborhoods, loading, error } = useNeighborhoodsByIds({
    neighborhoodIds,
    cachedFilters,
  });

  const handleRemove = (id: string) => {
    if (!editable || !onNeighborhoodsChange) return;
    const newIds = neighborhoodIds.filter(neighborhoodId => neighborhoodId !== id);
    onNeighborhoodsChange(newIds);
  };

  if (loading && neighborhoodIds.length > 0) {
    return <SkeletonChips count={neighborhoodIds.length} />;
  }

  if (error) {
    return <ChipsErrorState error={error} />;
  }

  if (neighborhoods.length === 0) {
    return <ChipsEmptyState />;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
    >
      {neighborhoods.map(neighborhood => (
        <NeighborhoodChip
          key={neighborhood.id}
          name={neighborhood.name}
          onRemove={() => handleRemove(neighborhood.id)}
          editable={editable && !!onNeighborhoodsChange}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chipsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
});
