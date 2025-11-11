import { useCallback, useEffect, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

import { PrimaryCard } from "./PrimaryCard";

export type SwipeDirection = "like" | "dislike";

type DeckCardData = {
  galleryPhotos: string[];
  locationStrings: string[];
  longestLocation: string;
  headline: string;
  budgetLabel: string;
  basicInfo: readonly string[];
};

export type SwipeDeckItem<TProfile> = {
  id: string;
  profile: TProfile;
  card: DeckCardData;
};

type SwipeDeckProps<TProfile> = {
  items: SwipeDeckItem<TProfile>[];
  onSwipe?: (direction: SwipeDirection, item: SwipeDeckItem<TProfile>) => void;
  onIndexChange?: (index: number) => void;
  locationWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function SwipeDeck<TProfile>({
  items,
  onSwipe,
  onIndexChange,
  locationWidth,
  style,
}: SwipeDeckProps<TProfile>) {
  const { width } = useWindowDimensions();
  const deckLength = items.length;
  const [index, setIndex] = useState(0);
  const [canSwipe, setCanSwipe] = useState(true);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const nextProgress = useSharedValue(0);
  const blurOpacity = useSharedValue(1);

  useEffect(() => {
    if (deckLength === 0) return;
    onIndexChange?.(index % deckLength);
  }, [deckLength, index, onIndexChange]);

  const activeIndex = deckLength === 0 ? 0 : index % deckLength;
  const activeItem = deckLength === 0 ? undefined : items[activeIndex];
  const nextItem = deckLength > 1 ? items[(activeIndex + 1) % deckLength] : undefined;

  useEffect(() => {
    setIndex(prev => {
      if (deckLength === 0) return 0;
      return prev % deckLength;
    });
  }, [deckLength]);

  const finishSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (deckLength === 0) return;
      const currentItem = items[index % deckLength];
      const nextIndex = (index + 1) % deckLength;
      blurOpacity.value = 1;
      nextProgress.value = 0;
      translateX.value = 0;
      translateY.value = 0;
      setIndex(nextIndex);
      setCanSwipe(true);
      onSwipe?.(direction, currentItem);
    },
    [blurOpacity, deckLength, index, items, nextProgress, onSwipe, translateX, translateY],
  );

  const panGesture = Gesture.Pan()
    .enabled(deckLength > 0 && canSwipe)
    .onUpdate(event => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.25;
    })
    .onEnd(event => {
      if (deckLength === 0) return;
      const threshold = width * 0.24;
      const shouldSwipe = Math.abs(event.translationX) > threshold || Math.abs(event.velocityX) > 900;
      if (!shouldSwipe) {
        translateX.value = withSpring(0, { damping: 18, stiffness: 160 });
        translateY.value = withSpring(0, { damping: 18, stiffness: 160 });
        return;
      }
      runOnJS(setCanSwipe)(false);
      blurOpacity.value = 0;
      const direction: SwipeDirection = event.translationX >= 0 ? "like" : "dislike";
      const destination = (width + 120) * (direction === "like" ? 1 : -1);
      translateX.value = withTiming(destination, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(translateY.value + event.translationY * 0.1, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
      nextProgress.value = withTiming(1, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      }, finished => {
        if (finished) {
          runOnJS(finishSwipe)(direction);
        }
      });
    });

  const activeCardStyle = useAnimatedStyle(() => {
    const rotate = `${interpolate(translateX.value, [-width, 0, width], [-12, 0, 12])}deg`;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate },
      ],
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(nextProgress.value, [0, 1], [0.94, 1]);
    const offsetY = interpolate(nextProgress.value, [0, 1], [18, 0]);
    return {
      transform: [
        { scale },
        { translateY: offsetY },
      ],
    };
  });

  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  const tintStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      translateX.value,
      [-width, 0, width],
      ["rgba(220, 38, 38, 0.32)", "rgba(8, 11, 20, 0.36)", "rgba(34, 197, 94, 0.28)"],
    );
    return { backgroundColor: color };
  });

  if (!activeItem) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.deck, style]}>
      {nextItem ? (
        <View pointerEvents="none" style={styles.backCard}>
          <PrimaryCard
            photos={nextItem.card.galleryPhotos}
            locationStrings={nextItem.card.locationStrings}
            locationWidth={locationWidth}
            headline={nextItem.card.headline}
            budget={nextItem.card.budgetLabel}
            basicInfo={nextItem.card.basicInfo}
            showScrollCue={false}
            enableLocationToggle={false}
            animatedStyle={nextCardStyle}
            scrollEnabled={false}
          />
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, blurStyle]}>
            <BlurView tint="systemUltraThinMaterialDark" intensity={40} style={StyleSheet.absoluteFillObject} />
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, tintStyle]}
          />
        </View>
      ) : null}
      <GestureDetector gesture={panGesture}>
        <PrimaryCard
          photos={activeItem.card.galleryPhotos}
          locationStrings={activeItem.card.locationStrings}
          locationWidth={locationWidth}
          headline={activeItem.card.headline}
          budget={activeItem.card.budgetLabel}
          basicInfo={activeItem.card.basicInfo}
          animatedStyle={activeCardStyle}
          scrollEnabled={false}
        />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  deck: {
    justifyContent: "flex-start",
  },
  backCard: {
    ...StyleSheet.absoluteFillObject,
  },
});
