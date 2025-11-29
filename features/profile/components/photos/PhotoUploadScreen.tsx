import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { PRIMARY_PHOTO_SIZE, ADDITIONAL_PHOTO_SIZE } from "./constants";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useTheme } from "../../../../context/ThemeContext";
import { AddMorePhotosButton } from "./AddMorePhotosButton";
import { PrimaryPhotoSection } from "./PrimaryPhotoSection";
import { PrimaryPhotoDisplay } from "./PrimaryPhotoDisplay";
import Spinner from "../../../../components/Spinner";
import Button from "../../../../components/Button";
import { DraggablePhoto } from "./DraggablePhoto";
import { useProfilePhotos } from "../../hooks";
import { Feather } from "@expo/vector-icons";
import { PhotoHeader } from "./PhotoHeader";
import React, { useState } from "react";

interface PhotoUploadScreenProps {
  onBack: () => void;
}

export const PhotoUploadScreen: React.FC<PhotoUploadScreenProps> = ({ onBack }) => {
  const { colors } = useTheme();
  const {
    primaryPhoto,
    additionalPhotos,
    loading,
    uploadingPhotoType,
    refreshing,
    deletingPhotoId,
    uploadPrimaryPhoto,
    uploadAdditionalPhoto,
    setAsPrimary,
    deletePhoto,
    refreshPhotos,
  } = useProfilePhotos();

  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);
  const [isDraggingOverPrimary, setIsDraggingOverPrimary] = useState(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);

  // Use Animated ref for the drop zone
  const primarySlotRef = useAnimatedRef<Animated.View>();

  const handleDragStart = (id: string) => {
    setDraggedPhotoId(id);
  };

  const handleDragEnd = () => {
    setDraggedPhotoId(null);
    setIsDraggingOverPrimary(false);
  };

  const handleDrop = async (photoId: string) => {
    setIsSettingPrimary(true);
    try {
      await setAsPrimary(photoId);
    } finally {
      setIsSettingPrimary(false);
      setDraggedPhotoId(null);
      setIsDraggingOverPrimary(false);
    }
  };

  const renderPrimaryPhoto = () => {
    if (loading || isSettingPrimary) {
      return (
        <View style={[styles.primaryPhotoContainer, { backgroundColor: colors.muted }]}>
          <Spinner size={48} color={colors.primary} />
        </View>
      );
    }

    if (primaryPhoto) {
      return (
        <PrimaryPhotoDisplay
          photo={primaryPhoto}
          dropZoneRef={primarySlotRef}
          isDraggingOverPrimary={isDraggingOverPrimary}
          onDelete={deletePhoto}
          deletingPhotoId={deletingPhotoId}
        />
      );
    }

    return (
      <View>
        <Animated.View ref={primarySlotRef}>
          <TouchableOpacity
            style={[
              styles.primaryPhotoContainer,
              styles.emptyPhotoContainer,
              { backgroundColor: colors.muted, borderColor: colors.border },
              isDraggingOverPrimary && [styles.draggingBorder, { borderColor: colors.primary }],
            ]}
            onPress={uploadPrimaryPhoto}
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

  const renderEmptyAdditionalSlot = (index: number) => {
    const isDisabled =
      additionalPhotos.length >= 4 ||
      (uploadingPhotoType !== null && !uploadingPhotoType.startsWith("additional-"));
    const isUploadingThisSlot = uploadingPhotoType?.startsWith("additional-");
    return (
      <TouchableOpacity
        key={`empty-${index}`}
        style={[
          styles.additionalPhoto,
          styles.emptyAdditionalPhoto,
          { backgroundColor: colors.muted, borderColor: colors.border },
          isDisabled && styles.emptySlotDisabled,
        ]}
        onPress={uploadAdditionalPhoto}
        activeOpacity={0.8}
        disabled={isDisabled || isUploadingThisSlot}
      >
        {isUploadingThisSlot ? (
          <Spinner size={24} color={colors.primary} thickness={3} />
        ) : (
          <Feather name="plus" size={24} color={colors.mutedForeground} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <PhotoHeader onBack={onBack} />

      <GestureHandlerRootView style={styles.gestureRoot}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshPhotos}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Foto Principal */}
          <PrimaryPhotoSection>{renderPrimaryPhoto()}</PrimaryPhotoSection>

          {/* Fotos Adicionales */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Fotos Adicionales
              </Text>
              {additionalPhotos.length > 0 && (
                <Text style={[styles.photoCount, { color: colors.mutedForeground }]}>
                  {additionalPhotos.length}
                </Text>
              )}
            </View>
            <Text style={[styles.sectionDescription, { color: colors.mutedForeground }]}>
              Agrega hasta 4 fotos adicionales para que los demás te conozcan mejor
            </Text>

            {loading ? (
              <View style={styles.loadingGrid}>
                <Spinner size={48} color={colors.primary} />
              </View>
            ) : (
              <View style={styles.additionalPhotosGrid}>
                {additionalPhotos.map(photo => (
                  <DraggablePhoto
                    key={photo.id}
                    photo={photo}
                    dropZoneRef={primarySlotRef}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                    onHoverChange={setIsDraggingOverPrimary}
                    isDeleting={deletingPhotoId === photo.id}
                    onDelete={deletePhoto}
                    isAnotherDragged={draggedPhotoId !== null && draggedPhotoId !== photo.id}
                  />
                ))}
                {additionalPhotos.length < 4 &&
                  Array.from({ length: 4 - additionalPhotos.length }).map((_, index) =>
                    renderEmptyAdditionalSlot(additionalPhotos.length + index),
                  )}
              </View>
            )}
          </View>

          {/* Botones de Acción */}
          <View style={styles.actionsSection}>
            <Button
              label={primaryPhoto ? "Cambiar foto principal" : "Subir foto principal"}
              onPress={uploadPrimaryPhoto}
              variant="primary"
              isLoading={uploadingPhotoType === "primary"}
              disabled={uploadingPhotoType === "primary" || loading}
            />
            {primaryPhoto && additionalPhotos.length < 4 && (
              <TouchableOpacity
                style={[
                  styles.addMoreButton,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                  (uploadingPhotoType !== null && uploadingPhotoType.startsWith("additional-")) ||
                  loading ||
                  additionalPhotos.length >= 4
                    ? styles.addMoreButtonDisabled
                    : null,
                ]}
                onPress={uploadAdditionalPhoto}
                activeOpacity={0.7}
                disabled={
                  (uploadingPhotoType !== null && uploadingPhotoType.startsWith("additional-")) ||
                  loading ||
                  additionalPhotos.length >= 4
                }
              >
                {uploadingPhotoType !== null && uploadingPhotoType.startsWith("additional-") ? (
                  <Spinner size={20} color={colors.primary} thickness={2} />
                ) : (
                  <AddMorePhotosButton />
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </GestureHandlerRootView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    marginBottom: 4,
  },
  photoCount: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginBottom: 16,
  },
  primaryPhotoSection: {
    alignItems: "center",
    marginTop: 8,
  },
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
  additionalPhotosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
    justifyContent: "space-between",
  },
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
  actionsSection: {
    paddingHorizontal: 20,
    marginTop: 32,
    gap: 12,
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 8,
  },
  addMoreButtonDisabled: {
    opacity: 0.5,
  },
  loadingGrid: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptySlotDisabled: {
    opacity: 0.5,
  },
  draggingBorder: {
    borderWidth: 3,
    borderStyle: "dashed",
  },
  gestureRoot: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
