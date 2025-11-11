import { memo } from "react";
import type { RefObject } from "react";
import type { ScrollView, ViewStyle } from "react-native";
import { Animated, View, useWindowDimensions } from "react-native";

import { FeedScrollContext } from "../context/ScrollContext";
import { FEED_CONSTANTS, computeHeroImageHeight } from "../constants/feed.constants";
import { BackgroundCard } from "./BackgroundCard";
import { PrimaryCard, type PrimaryCardProps } from "./PrimaryCard";

type CardDeckCardProps = Pick<
  PrimaryCardProps,
  "photos" | "locationStrings" | "locationWidth" | "headline" | "budget" | "basicInfo"
>;

type CardDeckPrimaryProps = CardDeckCardProps &
  Pick<PrimaryCardProps, "onSwipeComplete" | "onSwipeXChange">;

type CardDeckProps = {
  screenWidth?: number;
  scrollRef: RefObject<ScrollView | null>;
  swipeX?: Animated.Value | null;
  className?: string;
  style?: ViewStyle;
  primary: CardDeckPrimaryProps;
  secondary: CardDeckCardProps;
};

function CardDeckComponent({
  screenWidth,
  scrollRef,
  swipeX,
  className = "relative w-full",
  style,
  primary,
  secondary,
}: CardDeckProps) {
  const { height: winH, width: winW } = useWindowDimensions();
  const tabBarHeight = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const heroHeight = Math.max(0, winH + tabBarHeight);
  const heroBottomSpacing = tabBarHeight + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const heroImageHeight = computeHeroImageHeight(heroHeight, heroBottomSpacing);
  const width = screenWidth ?? winW;

  return (
    <View className={className} style={[{ height: heroImageHeight }, style]}>
      <FeedScrollContext.Provider value={scrollRef}>
        <BackgroundCard
          photos={secondary.photos}
          locationStrings={secondary.locationStrings}
          locationWidth={secondary.locationWidth}
          headline={secondary.headline}
          budget={secondary.budget}
          basicInfo={secondary.basicInfo}
          swipeX={swipeX ?? undefined}
          screenWidth={width}
        />
        <PrimaryCard
          photos={primary.photos}
          locationStrings={primary.locationStrings}
          locationWidth={primary.locationWidth}
          headline={primary.headline}
          budget={primary.budget}
          basicInfo={primary.basicInfo}
          onSwipeComplete={primary.onSwipeComplete}
          onSwipeXChange={primary.onSwipeXChange}
        />
      </FeedScrollContext.Provider>
    </View>
  );
}

export const CardDeck = memo(CardDeckComponent);
