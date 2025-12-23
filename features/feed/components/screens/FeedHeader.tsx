import { View, StyleSheet, useWindowDimensions } from "react-native";
import { LocationChip } from "../ui/LocationChip";
import { memo } from "react";

interface FeedHeaderProps {
  locations: string[];
  activeLocationIndex: number;
  activeLocation: string;
  locationOpen: boolean;
  onToggleLocation: () => void;
  onSelectLocation: (location: string, index: number) => void;
}

export const FeedHeader = memo(
  ({
    locations,
    activeLocation,
    locationOpen,
    onToggleLocation,
    onSelectLocation,
  }: FeedHeaderProps) => {
    const { width } = useWindowDimensions();
    const locationChipMaxWidth = width - 16;

    return (
      <View
        style={[
          styles.header,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            zIndex: locationOpen ? 9999 : 1,
            elevation: locationOpen ? 9999 : 0,
          },
        ]}
      >
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
      </View>
    );
  },
);

FeedHeader.displayName = "FeedHeader";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // justifyContent: "space-between",
    paddingHorizontal: 7,
    marginBottom: 12,
    width: "100%",
  },
  leftSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});
