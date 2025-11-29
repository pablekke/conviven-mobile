import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Animated, { AnimatedRef } from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";
import { ProfilePhoto } from "../../../../types/profilePhoto";
import { useTheme } from "../../../../context/ThemeContext";
import Spinner from "../../../../components/Spinner";
import { ADDITIONAL_PHOTO_SIZE } from "./constants";
import { useDraggablePhoto } from "../../hooks";
import { Feather } from "@expo/vector-icons";
import React from "react";

interface DraggablePhotoProps {
  photo: ProfilePhoto;
  dropZoneRef: AnimatedRef<any>;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (id: string) => void;
  onHoverChange: (isOver: boolean) => void;
  isDeleting: boolean;
  onDelete: (id: string) => void;
  isAnotherDragged: boolean;
}

export const DraggablePhoto: React.FC<DraggablePhotoProps> = ({
  photo,
  dropZoneRef,
  onDragStart,
  onDragEnd,
  onDrop,
  onHoverChange,
  isDeleting,
  onDelete,
  isAnotherDragged,
}) => {
  const { colors } = useTheme();
  const { panGesture, animatedStyle } = useDraggablePhoto({
    dropZoneRef,
    onDragStart,
    onDragEnd,
    onDrop,
    onHoverChange,
    photoId: photo.id,
  });

  const isDisabled = isDeleting || isAnotherDragged;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.additionalPhotoWrapper, animatedStyle]}>
        <View style={styles.additionalPhotoTouchable}>
          <Image source={{ uri: photo.url }} style={styles.additionalPhoto} resizeMode="cover" />
          {!isDisabled && (
            <View style={styles.photoOverlay}>
              <View style={styles.photoActionContent}>
                <Feather name="move" size={12} color="#FFFFFF" />
                <Text style={styles.photoActionText}>Arrastra aquí</Text>
              </View>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.photoDeleteButton,
            { backgroundColor: colors.destructive },
            isDeleting && styles.photoDeleteButtonDisabled,
          ]}
          onPress={() => onDelete(photo.id)}
          activeOpacity={0.8}
          disabled={isDisabled}
        >
          {isDeleting ? (
            <Spinner size={16} color={colors.destructiveForeground} thickness={2} />
          ) : (
            <Feather name="x" size={14} color={colors.destructiveForeground} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  additionalPhotoWrapper: {
    width: ADDITIONAL_PHOTO_SIZE,
    height: ADDITIONAL_PHOTO_SIZE,
    borderRadius: 12,
    overflow: "visible",
    position: "relative",
  },
  additionalPhotoTouchable: {
    width: ADDITIONAL_PHOTO_SIZE,
    height: ADDITIONAL_PHOTO_SIZE,
    borderRadius: 12,
    overflow: "hidden",
  },
  additionalPhoto: {
    width: ADDITIONAL_PHOTO_SIZE,
    height: ADDITIONAL_PHOTO_SIZE,
  },
  photoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  photoActionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  photoActionText: {
    color: "#111827",
    fontSize: 10,
    fontFamily: "Inter-SemiBold",
  },
  photoDeleteButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  photoDeleteButtonDisabled: {
    opacity: 0.7,
  },
});
