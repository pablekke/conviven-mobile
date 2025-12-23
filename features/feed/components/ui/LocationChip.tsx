import { View, Text, Pressable, Platform, StyleSheet, Animated, Easing } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../../context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRef, useEffect, memo } from "react";

interface LocationChipProps {
  locations: string[];
  activeLabel: string;
  width?: number;
  isOpen: boolean;
  onToggle: () => void;
  onSelect?: (location: string, index: number) => void;
  inline?: boolean;
}

export const LocationChip = memo(
  ({
    locations,
    activeLabel,
    width,
    isOpen,
    onToggle,
    onSelect,
    inline = false,
  }: LocationChipProps) => {
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
  },
);

LocationChip.displayName = "LocationChip";

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

  const otherLocations = locations.filter(loc => loc !== activeLabel);

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isOpen, animatedValue]);

  const maxHeight = 44 + (isOpen ? otherLocations.length * 48 + 8 : 0);
  const borderRadiusValue = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 24],
  });

  const shadow = Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    android: {
      elevation: 8,
    },
  });

  const containerStyle = inline
    ? { alignItems: "center" as const, zIndex: isOpen ? 1000 : 1, height: 44 }
    : {
        position: "absolute" as const,
        left: 0,
        right: 0,
        top: insets.top + 8,
        zIndex: 1000,
        alignItems: "center" as const,
      };

  return (
    <View style={containerStyle}>
      <Animated.View
        style={[
          styles.mainContainer,
          shadow,
          {
            width,
            height: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [44, maxHeight],
            }),
            borderRadius: borderRadiusValue,
          },
        ]}
      >
        <BlurView intensity={90} tint="extraLight" style={StyleSheet.absoluteFillObject} />

        <Pressable
          onPress={hasMultipleLocations ? onToggle : undefined}
          style={styles.closedChipContent}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <Feather name="search" size={14} color="#FFFFFF" />
          </View>
          <View style={styles.textWrapper}>
            <Text numberOfLines={1} style={[styles.closedChipText, { color: colors.foreground }]}>
              <Text style={[{ color: colors.mutedForeground }, styles.fontMedium]}>
                Buscando en{" "}
              </Text>
              <Text style={[{ color: colors.foreground }, styles.fontBold]}>{activeLabel}</Text>
            </Text>
          </View>

          {hasMultipleLocations && (
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "180deg"],
                    }),
                  },
                ],
              }}
            >
              <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
            </Animated.View>
          )}
        </Pressable>

        {/* Options List */}
        <Animated.View
          style={[
            styles.optionsWrapper,
            {
              opacity: animatedValue.interpolate({
                inputRange: [0.4, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          {isOpen && <View style={styles.divider} />}
          {otherLocations.map((location, i) => {
            return (
              <Pressable
                key={i}
                style={[styles.openOption, i > 0 && styles.openOptionDivider]}
                onPress={() => {
                  onSelect?.(location, i);
                  onToggle();
                }}
              >
                <View style={[styles.optionIconContainer, styles.optionIconInactive]}>
                  <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                </View>
                <Text
                  numberOfLines={1}
                  style={[styles.openOptionText, { color: colors.foreground }]}
                >
                  {location}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    position: "absolute",
    top: 0,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  closedChipContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 6,
    paddingRight: 16,
    paddingVertical: 6,
    height: 44,
  },
  textWrapper: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginHorizontal: 16,
  },
  optionsWrapper: {
    width: "100%",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  closedChipText: {
    fontSize: 14,
    textAlign: "left",
    letterSpacing: -0.2,
  },
  openOption: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  openOptionDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  openOptionActive: {
    backgroundColor: "rgba(37, 99, 235, 0.05)",
  },
  openOptionText: {
    flex: 1,
    textAlign: "left",
    fontSize: 14,
    marginLeft: 12,
  },
  optionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  optionIconActive: {
    backgroundColor: "#2563EB", // Usando el azul de conviven directamente para el icono activo
    borderColor: "#2563EB",
  },
  optionIconInactive: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderColor: "transparent",
  },
  fontMedium: {
    fontWeight: "500",
  },
  fontBold: {
    fontWeight: "700",
  },
});
