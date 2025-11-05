import { View, Image, useWindowDimensions } from "react-native";
import PagerView from "react-native-pager-view";

interface PhotoCarouselProps {
  photos: string[];
  height: number;
}

export function PhotoCarousel({ photos, height }: PhotoCarouselProps) {
  const { width: winW } = useWindowDimensions();

  return (
    <PagerView style={{ height, width: winW }} initialPage={0} overdrag>
      {photos.map((src, idx) => (
        <View key={String(idx)} className="w-full h-full">
          <Image source={{ uri: src }} resizeMode="cover" style={{ width: winW, height }} />
        </View>
      ))}
    </PagerView>
  );
}
