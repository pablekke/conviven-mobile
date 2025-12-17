import { Image as ExpoImage } from "expo-image";
import { StyleSheet } from "react-native";
import { memo } from "react";

interface HeroImageProps {
  photo: string;
  height: number;
}

export const HeroImage = memo(({ photo, height }: HeroImageProps) => {
  if (!photo) return null;

  return (
    <ExpoImage
      source={{ uri: photo }}
      style={[styles.heroImage, { height }]}
      contentFit="cover"
      cachePolicy="memory-disk"
      recyclingKey={photo}
      transition={0}
    />
  );
});

HeroImage.displayName = "HeroImage";

const styles = StyleSheet.create({
  heroImage: {
    width: "100%",
  },
});
