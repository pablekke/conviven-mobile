import { View, StyleSheet, useWindowDimensions } from "react-native";
import { PhotoGalleryButton } from "../cards/PhotoGalleryButton";
import { LocationChip } from "../ui/LocationChip";
import { memo } from "react";

interface FeedHeaderProps {
  locations: string[];
  activeLocationIndex: number;
  activeLocation: string;
  locationOpen: boolean;
  onToggleLocation: () => void;
  onSelectLocation: (location: string, index: number) => void;
  photosCount: number;
  onPhotosPress: () => void;
}

export const FeedHeader = memo(
  ({
    locations,
    activeLocation,
    locationOpen,
    onToggleLocation,
    onSelectLocation,
    photosCount,
    onPhotosPress,
  }: FeedHeaderProps) => {
    const { width } = useWindowDimensions();
    const locationChipMaxWidth = width * 0.8 - 32;

    return (
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <LocationChip
            locations={locations}
            activeLabel={activeLocation}
            isOpen={locationOpen}
            onToggle={onToggleLocation}
            onSelect={onSelectLocation}
            width={locationChipMaxWidth}
            inline
          />
        </View>
        <View style={styles.rightSection}>
          <PhotoGalleryButton photosCount={photosCount} top={0} onPress={onPhotosPress} />
        </View>
      </View>
    );
  },
);

FeedHeader.displayName = "FeedHeader";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  leftSection: {
    flex: 0.8,
    alignItems: "flex-start",
  },
  rightSection: {
    flex: 0.2,
    alignItems: "flex-end",
  },
});
