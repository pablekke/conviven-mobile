import { useEffect, useRef } from "react";
import { View, Image, useWindowDimensions } from "react-native";
import PagerView from "react-native-pager-view";

interface PhotoCarouselProps {
  photos: string[];
  height: number;
  scrollEnabled?: boolean;
  onFirstPhotoLoaded?: () => void;
}

export function PhotoCarousel({
  photos,
  height,
  scrollEnabled = true,
  onFirstPhotoLoaded,
}: PhotoCarouselProps) {
  const { width: winW } = useWindowDimensions();
  const firstPhotoLoadedRef = useRef(false);

  const handleFirstPhotoLoad = () => {
    if (firstPhotoLoadedRef.current) return;
    firstPhotoLoadedRef.current = true;
    onFirstPhotoLoaded?.();
  };

  useEffect(() => {
    firstPhotoLoadedRef.current = false;
    if (!photos.length) {
      onFirstPhotoLoaded?.();
    }
  }, [onFirstPhotoLoaded, photos.length]);

  return (
    <PagerView
      style={{ height, width: winW }}
      key={photos[0] ?? `carousel-${photos.length}`}
      initialPage={0}
      overdrag
      scrollEnabled={scrollEnabled}
    >
      {photos.map((src, idx) => (
        <View key={String(idx)} className="w-full h-full">
          <Image
            source={{ uri: src }}
            resizeMode="cover"
            style={{ width: winW, height }}
            onLoadEnd={idx === 0 ? handleFirstPhotoLoad : undefined}
          />
        </View>
      ))}
    </PagerView>
  );
}
