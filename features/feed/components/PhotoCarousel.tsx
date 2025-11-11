import { View, Image, useWindowDimensions } from "react-native";
import PagerView from "react-native-pager-view";

interface PhotoCarouselProps {
  photos: string[];
  height: number;
  scrollEnabled?: boolean;
}

export function PhotoCarousel({ photos, height, scrollEnabled = true }: PhotoCarouselProps) {
  const { width: winW } = useWindowDimensions();

  if (!scrollEnabled || photos.length <= 5) {
    return (
      <View className="w-full h-full" style={{ height, width: winW }}>
        {photos[0] ? (
          <Image
            source={{ uri: photos[0] }}
            resizeMode="cover"
            style={{ width: winW, height }}
            fadeDuration={0}
          />
        ) : null}
      </View>
    );
  }

  return (
    <PagerView
      style={{ height, width: winW }}
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
            fadeDuration={0}
          />
        </View>
      ))}
    </PagerView>
  );
}
