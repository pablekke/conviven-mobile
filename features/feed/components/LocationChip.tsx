import { View, Text, Pressable, Platform } from "react-native";
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

  return (
    <View className="absolute left-0 right-0 z-30 items-center" style={{ top: insets.top + 8 }}>
      {!isOpen ? (
        <Pressable onPress={onToggle}>
          <View
            className="flex-row items-center gap-2 bg-white/95 px-3 py-1 rounded-full border border-white/60"
            style={{
              width,
              ...Platform.select({
                ios: {
                  shadowColor: "#1d4ed8",
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 8 },
                },
                android: { elevation: 2 },
              }),
            }}
          >
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
          <View
            className="bg-white/95 rounded-xl border border-white/60 overflow-hidden"
            style={Platform.select({
              ios: {
                shadowColor: "#1d4ed8",
                shadowOpacity: 0.25,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 8 },
              },
              android: { elevation: 2 },
            })}
          >
            {locations.map((location, i) => (
              <Pressable
                key={i}
                className={`w-full ${i > 0 ? "border-t border-white/60" : ""}`}
                onPress={onToggle}
              >
                <View className="w-full flex-row items-center px-3 py-1 text-center">
                  <Text
                    numberOfLines={1}
                    className="text-blue-700 text-[13px] font-semibold flex-1 text-center"
                  >
                    {location}
                  </Text>
                  {i === 0 ? <Feather name="chevron-up" size={14} color="#1d4ed8" /> : null}
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
