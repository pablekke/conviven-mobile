import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { ScrollView, ViewStyle } from "react-native";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";

import { FeedScrollContext } from "../context/ScrollContext";
import { FEED_CONSTANTS, computeHeroImageHeight } from "../constants/feed.constants";
import { BackgroundCard } from "./BackgroundCard";
import type { PrimaryCardProps } from "./PrimaryCard";

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

const buildCardIdentity = (card: CardDeckCardProps) => {
  const firstPhoto = card.photos?.[0] ?? "";
  return `${firstPhoto}|${card.headline}|${card.budget}`;
};

function CardDeckComponent({
  screenWidth,
  scrollRef,
  swipeX: _swipeX,
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

  const primaryBlur = useRef(new Animated.Value(0)).current;
  const secondaryBlur = useRef(new Animated.Value(1)).current;
  const primaryOpacity = useRef(new Animated.Value(1)).current;

  const {
    onSwipeComplete: primaryOnSwipeComplete,
    onSwipeXChange: primaryOnSwipeXChange,
    ...primaryCardProps
  } = primary;

  const [primarySnapshot, setPrimarySnapshot] = useState<CardDeckCardProps>(primaryCardProps);
  const [secondarySnapshot, setSecondarySnapshot] = useState<CardDeckCardProps>(secondary);

  const primaryIdentity = buildCardIdentity(primaryCardProps);
  const secondaryIdentity = buildCardIdentity(secondary);
  const primaryIdentityRef = useRef(primaryIdentity);
  const secondaryIdentityRef = useRef(secondaryIdentity);

  useEffect(() => {
    console.log(
      "[CardDeck] primary photos",
      primaryCardProps.photos?.[0],
      primaryCardProps.photos?.length,
    );
  }, [primaryCardProps.photos]);

  useEffect(() => {
    console.log("[CardDeck] secondary photos", secondary.photos?.[0], secondary.photos?.length);
  }, [secondary.photos]);

  useEffect(() => {
    if (primaryIdentityRef.current === primaryIdentity) {
      return;
    }
    primaryIdentityRef.current = primaryIdentity;
    setPrimarySnapshot(primaryCardProps);
    primaryOpacity.setValue(1);
  }, [primaryCardProps, primaryIdentity, primaryOpacity]);

  useEffect(() => {
    if (secondaryIdentityRef.current === secondaryIdentity) {
      return;
    }
    secondaryIdentityRef.current = secondaryIdentity;
    setSecondarySnapshot(secondary);
  }, [secondary, secondaryIdentity]);

  const handlePrimarySwipeComplete = useCallback(
    (direction: "like" | "dislike") => {
      primaryOpacity.setValue(0);
      setPrimarySnapshot(secondarySnapshot);
      Animated.timing(primaryOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        primaryOnSwipeComplete?.(direction);
      });
    },
    [primaryOnSwipeComplete, primaryOpacity, secondarySnapshot],
  );

  const handlePrimarySwipeXChange = useCallback(
    (value: Animated.Value) => {
      primaryOnSwipeXChange?.(value);
    },
    [primaryOnSwipeXChange],
  );

  useEffect(() => {
    primaryBlur.setValue(0);
    secondaryBlur.setValue(1);
  }, [primaryBlur, primaryIdentity, secondaryIdentity, secondaryBlur]);

  return (
    <View className={className} style={[{ height: heroImageHeight }, style]}>
      <FeedScrollContext.Provider value={scrollRef}>
        <View style={styles.secondaryLayer}>
          <BackgroundCard
            {...secondarySnapshot}
            screenWidth={width}
            blurProgress={secondaryBlur}
            blurEnabled
            enableSwipe={false}
            enableLocationToggle
            showScrollCue
          />
        </View>

        <Animated.View
          pointerEvents="auto"
          style={[styles.primaryLayer, { opacity: primaryOpacity }]}
        >
          <BackgroundCard
            {...primarySnapshot}
            screenWidth={width}
            blurProgress={primaryBlur}
            blurEnabled
            enableSwipe
            enableLocationToggle
            showScrollCue
            onSwipeComplete={handlePrimarySwipeComplete}
            onSwipeXChange={handlePrimarySwipeXChange}
          />
        </Animated.View>
      </FeedScrollContext.Provider>
    </View>
  );
}

export const CardDeck = memo(CardDeckComponent);

const styles = StyleSheet.create({
  secondaryLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  primaryLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
});
