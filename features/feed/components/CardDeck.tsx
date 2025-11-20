import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { ScrollView, ViewStyle } from "react-native";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";

import { FeedScrollContext } from "../context/ScrollContext";
import { FEED_CONSTANTS, computeHeroImageHeight } from "../constants/feed.constants";
import { BackgroundCard } from "./BackgroundCard";
import type { PrimaryCardProps } from "./PrimaryCard";
import { useDeckSwipeTint } from "../hooks/useDeckSwipeTint";

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
  const [swipeOpacityEnabled, setSwipeOpacityEnabled] = useState(true);
  const pendingOpacityEnableRef = useRef(false);

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
      setSwipeOpacityEnabled(false);
      primaryOpacity.setValue(0);
      pendingOpacityEnableRef.current = true;
      setPrimarySnapshot(secondarySnapshot);
      tint.reset();
      Animated.timing(primaryOpacity, {
        toValue: 1,
        duration: 320,
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
      tint.setDriver(value);
      primaryOnSwipeXChange?.(value);
    },
    [primaryOnSwipeXChange],
  );

  useEffect(() => {
    primaryBlur.setValue(0);
    secondaryBlur.setValue(1);
  }, [primaryBlur, primaryIdentity, secondaryIdentity, secondaryBlur]);

  useEffect(() => {
    if (!pendingOpacityEnableRef.current) return;
    pendingOpacityEnableRef.current = false;
    const timeout = setTimeout(() => {
      setSwipeOpacityEnabled(true);
    }, 300); //retrasa que vuelva la opacidad para que vuelva a aparecer la primary
    return () => clearTimeout(timeout);
  }, [primarySnapshot]);

  const tint = useDeckSwipeTint(width);
  const { likeStyle, dislikeStyle } = tint;

  return (
    <View className={className} style={[{ height: heroImageHeight }, style]}>
      <FeedScrollContext.Provider value={scrollRef}>
        <View style={styles.secondaryLayer}>
          <BackgroundCard
            {...secondarySnapshot}
            blurProgress={secondaryBlur}
            blurEnabled
            enableSwipe={false}
            enableLocationToggle
            showScrollCue
            swipeOpacityEnabled={false}
          />
          <Animated.View pointerEvents="none" style={[styles.tintLayer, dislikeStyle]} />
          <Animated.View pointerEvents="none" style={[styles.tintLayer, likeStyle]} />
        </View>

        <Animated.View
          pointerEvents="auto"
          style={[styles.primaryLayer, { opacity: primaryOpacity }]}
        >
          <BackgroundCard
            {...primarySnapshot}
            blurProgress={primaryBlur}
            blurEnabled
            enableSwipe
            enableLocationToggle
            showScrollCue
            onSwipeComplete={handlePrimarySwipeComplete}
            onSwipeXChange={handlePrimarySwipeXChange}
            swipeOpacityEnabled={swipeOpacityEnabled}
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  primaryLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  tintLayer: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
});
