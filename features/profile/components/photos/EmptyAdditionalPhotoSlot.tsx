import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import Spinner from "../../../../components/Spinner";
import { ADDITIONAL_PHOTO_SIZE } from "./constants";

interface EmptyAdditionalPhotoSlotProps {
  index: number;
  colors: any;
  isDisabled: boolean;
  isUploading: boolean;
  onUpload: () => void;
}

export const EmptyAdditionalPhotoSlot: React.FC<EmptyAdditionalPhotoSlotProps> = ({
  index,
  colors,
  isDisabled,
  isUploading,
  onUpload,
}) => {
  return (
    <TouchableOpacity
      key={`empty-${index}`}
      style={[
        styles.additionalPhoto,
        styles.emptyAdditionalPhoto,
        { backgroundColor: colors.muted, borderColor: colors.border },
        isDisabled && styles.emptySlotDisabled,
      ]}
      onPress={onUpload}
      activeOpacity={0.8}
      disabled={isDisabled || isUploading}
    >
      {isUploading ? (
        <Spinner size={24} color={colors.primary} thickness={3} />
      ) : (
        <Feather name="plus" size={24} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  additionalPhoto: {
    width: ADDITIONAL_PHOTO_SIZE,
    height: ADDITIONAL_PHOTO_SIZE,
  },
  emptyAdditionalPhoto: {
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  emptySlotDisabled: {
    opacity: 0.5,
  },
});
