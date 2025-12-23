import { View, Text, Pressable, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../../context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

interface LocationChipProps {
  locations: string[];
  activeLabel: string;
  width?: number;
  isOpen: boolean;
  onToggle: () => void;
  onSelect?: (location: string, index: number) => void;
  inline?: boolean;
}

export function LocationChip({
  locations,
  activeLabel,
  width,
  isOpen,
  onToggle,
  onSelect,
  inline = false,
}: LocationChipProps) {
  if (!locations.length) return null;

  return (
    <LocationChipInner
      locations={locations}
      activeLabel={activeLabel}
      width={width ?? 350}
      isOpen={isOpen}
      onToggle={onToggle}
      onSelect={onSelect}
      inline={inline}
    />
  );
}

function LocationChipInner({
  locations,
  activeLabel,
  width = 400,
  isOpen,
  onToggle,
  onSelect,
  inline = false,
}: LocationChipProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const hasMultipleLocations = locations.length > 1;

  const shadow = Platform.select({
    ios: {
      shadowColor: "#1d4ed8",
      shadowOpacity: 0.2,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 9 },
    },
    android: {
      elevation: 4,
    },
  });

  const containerStyle = inline
    ? { alignItems: "center" as const, zIndex: isOpen ? 100 : 1 }
    : {
        position: "absolute" as const,
        left: 0,
        right: 0,
        top: insets.top + 8,
        zIndex: 30,
        alignItems: "center" as const,
      };

  return (
    <View style={containerStyle}>
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={{ opacity: isOpen ? 0 : 1 }}>
        <Pressable
          onPress={hasMultipleLocations ? onToggle : undefined}
          disabled={!hasMultipleLocations || isOpen}
        >
          <View style={[styles.closedChip, shadow, { width }]}>
            <BlurView intensity={90} tint="extraLight" style={StyleSheet.absoluteFillObject} />
            <View style={styles.closedChipContent}>
              <Text numberOfLines={1} style={[styles.closedChipText, { color: colors.primary }]}>
                {activeLabel}
              </Text>
              {hasMultipleLocations && (
                <Feather name="chevron-down" size={14} color={colors.primary} />
              )}
            </View>
          </View>
        </Pressable>
      </View>

      {isOpen && (
        // eslint-disable-next-line react-native/no-inline-styles
        <View style={{ position: "absolute", top: 0, width }}>
          <View style={[styles.openContainer, shadow]}>
            <BlurView intensity={90} tint="extraLight" style={StyleSheet.absoluteFillObject} />
            {locations.map((location, i) => {
              const isActive = location === activeLabel;
              return (
                <Pressable
                  key={i}
                  style={[
                    styles.openOption,
                    i > 0 && styles.openOptionDivider,
                    isActive && styles.openOptionActive,
                  ]}
                  onPress={() => {
                    onSelect?.(location, i);
                    onToggle();
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={[styles.openOptionText, { color: colors.primary }]}
                  >
                    {location}
                  </Text>
                  {i === 0 ? <Feather name="chevron-up" size={14} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  closedChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
    shadowColor: "#1d4ed8",
    overflow: "hidden",
  },
  closedChipContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closedChipText: {
    flex: 1,
    color: "#1d4ed8",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  openContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
    overflow: "hidden",
  },
  openOption: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  openOptionDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(37, 99, 235, 0.18)",
  },
  openOptionActive: {
    backgroundColor: "rgba(37, 99, 235, 0.08)",
  },
  openOptionText: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },
});
