import { View, Text, Pressable, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

interface LocationChipProps {
  locations: string[];
  width?: number;
  isOpen: boolean;
  onToggle: () => void;
}

export function LocationChip({ locations, width, isOpen, onToggle }: LocationChipProps) {
  if (!locations.length) return null;

  return (
    <LocationChipInner locations={locations} width={width} isOpen={isOpen} onToggle={onToggle} />
  );
}

function LocationChipInner({ locations, width, isOpen, onToggle }: LocationChipProps) {
  const insets = useSafeAreaInsets();

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

  return (
    <View className="absolute left-0 right-0 z-30 items-center" style={{ top: insets.top + 8 }}>
      {!isOpen ? (
        <Pressable onPress={onToggle}>
          <View style={[styles.closedChip, shadow, { width }]}>
            <Text
              numberOfLines={1}
              className="text-blue-700 text-[13px] font-semibold flex-1 text-center"
            >
              {locations[0]}
            </Text>
            <Feather name="chevron-down" size={14} color="#1d4ed8" />
          </View>
        </Pressable>
      ) : (
        <View style={{ width }}>
          <View style={[styles.openContainer, shadow]}>
            {locations.map((location, i) => (
              <Pressable
                key={i}
                style={[styles.openOption, i > 0 && styles.openOptionDivider]}
                onPress={onToggle}
              >
                <Text
                  numberOfLines={1}
                  className="text-blue-700 text-[13px] font-semibold flex-1 text-center"
                >
                  {location}
                </Text>
                {i === 0 ? <Feather name="chevron-up" size={14} color="#1d4ed8" /> : null}
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  closedChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e8f1ff",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
  },
  openContainer: {
    backgroundColor: "#f0f6ff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
    overflow: "hidden",
  },
  openOption: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  openOptionDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(37, 99, 235, 0.18)",
  },
});
