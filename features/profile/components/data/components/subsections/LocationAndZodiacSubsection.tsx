import { MainNeighborhoodCard } from "../../../filters/neighborhoods/MainNeighborhoodCard";
import { ProfileLocationSelectionModal } from "../../ProfileLocationSelectionModal";
import { useTheme } from "../../../../../../context/ThemeContext";
import { StyleSheet, View, Text } from "react-native";
import { User } from "../../../../../../types/user";
import React from "react";

interface LocationAndZodiacSubsectionProps {
  onLocationPress: () => void;
  zodiacSignLabel: string;
  locationModalVisible: boolean;
  setLocationModalVisible: (visible: boolean) => void;
  handleLocationConfirm: (selectedIds: string[], mainId?: string | null) => void;
  user: User | null;
  draftLocation?: {
    neighborhoodId: string | null;
    cityId: string | null;
    departmentId: string | null;
  } | null;
}

export const LocationAndZodiacSubsection: React.FC<LocationAndZodiacSubsectionProps> = ({
  onLocationPress,
  zodiacSignLabel,
  locationModalVisible,
  setLocationModalVisible,
  handleLocationConfirm,
  user,
  draftLocation,
}) => {
  const { colors } = useTheme();

  // Usar draft location si existe, sino usar user location
  const displayNeighborhoodId = draftLocation?.neighborhoodId || user?.location?.neighborhood?.id;
  const displayLocation = draftLocation
    ? {
        neighborhood: draftLocation.neighborhoodId
          ? {
              id: draftLocation.neighborhoodId,
              name: (() => {
                const {
                  getCachedNeighborhood,
                } = require("../../../filters/neighborhoods/services/neighborhoodsService");
                const neighborhood = getCachedNeighborhood(draftLocation.neighborhoodId);
                return neighborhood?.name || "Cargando...";
              })(),
            }
          : null,
        city: draftLocation.cityId ? { id: draftLocation.cityId, name: "" } : user?.location?.city,
        department: draftLocation.departmentId
          ? { id: draftLocation.departmentId, name: "" }
          : user?.location?.department,
      }
    : user?.location;

  return (
    <View style={styles.container}>
      <MainNeighborhoodCard
        neighborhoodId={displayNeighborhoodId}
        onPress={onLocationPress}
        label="Ubicación"
        userLocation={displayLocation}
      />

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Signo Zodiacal</Text>
        <View
          style={[
            styles.textInput,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.valueText,
              {
                color:
                  zodiacSignLabel && zodiacSignLabel !== "-"
                    ? colors.foreground
                    : colors.mutedForeground,
              },
            ]}
          >
            {zodiacSignLabel && zodiacSignLabel !== "-" ? zodiacSignLabel : "-"}
          </Text>
        </View>
      </View>

      <ProfileLocationSelectionModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onConfirm={handleLocationConfirm}
        selectedNeighborhoodId={draftLocation?.neighborhoodId || user?.location?.neighborhood?.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
  },
  locationContainer: {
    flex: 0.7,
  },
  zodiacContainer: {
    flex: 0.3,
  },
  inputContainer: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valueText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
});
