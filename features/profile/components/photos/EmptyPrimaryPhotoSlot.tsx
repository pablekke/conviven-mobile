import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { AnimatedRef } from "react-native-reanimated";
import Spinner from "../../../../components/Spinner";
import { PRIMARY_PHOTO_SIZE } from "./constants";

interface EmptyPrimaryPhotoSlotProps {
  dropZoneRef: AnimatedRef<Animated.View>;
  colors: any;
  uploadingPhotoType: string | null;
  isDraggingOverPrimary: boolean;
  onUpload: () => void;
}

export const EmptyPrimaryPhotoSlot: React.FC<EmptyPrimaryPhotoSlotProps> = ({
  dropZoneRef,
  colors,
  uploadingPhotoType,
  isDraggingOverPrimary,
  onUpload,
}) => {
  return (
    <View>
      <Animated.View ref={dropZoneRef}>
        <TouchableOpacity
          style={[
            styles.primaryPhotoContainer,
            styles.emptyPhotoContainer,
            { backgroundColor: colors.muted, borderColor: colors.border },
            isDraggingOverPrimary && [styles.draggingBorder, { borderColor: colors.primary }],
          ]}
          onPress={onUpload}
          activeOpacity={0.8}
          disabled={uploadingPhotoType === "primary" || isDraggingOverPrimary}
        >
          {uploadingPhotoType === "primary" ? (
            <Spinner size={48} color={colors.primary} />
          ) : isDraggingOverPrimary ? (
            <>
              <Feather name="arrow-down" size={48} color={colors.primary} />
              <Text style={[styles.emptyPhotoText, { color: colors.primary }]}>
                Suelta para hacer principal
              </Text>
            </>
          ) : (
            <>
              <Feather name="camera" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyPhotoText, { color: colors.mutedForeground }]}>
                Subir foto principal
              </Text>
              <Text style={[styles.emptyPhotoSubtext, { color: colors.mutedForeground }]}>
                Esta será tu foto de perfil
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  primaryPhotoContainer: {
    width: PRIMARY_PHOTO_SIZE,
    height: PRIMARY_PHOTO_SIZE,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
  },
  emptyPhotoContainer: {
    paddingHorizontal: 32,
  },
  emptyPhotoText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    marginTop: 12,
    textAlign: "center",
  },
  emptyPhotoSubtext: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    marginTop: 4,
    textAlign: "center",
  },
  draggingBorder: {
    borderWidth: 3,
    borderStyle: "dashed",
  },
});
