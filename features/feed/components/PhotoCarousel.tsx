import { useMemo } from "react";
import { View, Image, useWindowDimensions } from "react-native";
import PagerView from "react-native-pager-view";

interface PhotoCarouselProps {
  photos: string[];
  height: number;
  scrollEnabled?: boolean;
}

export function PhotoCarousel({ photos, height, scrollEnabled = true }: PhotoCarouselProps) {
  const { width: winW } = useWindowDimensions();
  const carouselKey = useMemo(() => photos.join("|"), [photos]);

  return (
    <PagerView
      key={carouselKey}
      style={{ height, width: winW }}
      initialPage={0}
      overdrag
      scrollEnabled={scrollEnabled}
    >
      {photos.map((src, idx) => (
        <View key={String(idx)} className="w-full h-full">
          <Image source={{ uri: src }} resizeMode="cover" style={{ width: winW, height }} />
        </View>
      ))}
    </PagerView>
  );
}
