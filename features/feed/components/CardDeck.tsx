import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  const [deckZ, setDeckZ] = useState<{ primary: number; secondary: number }>({
    primary: 100,
    secondary: 50,
  });
  const [activeCard, setActiveCard] = useState<"primary" | "secondary">("primary");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [internalSwipeX, setInternalSwipeX] = useState<Animated.Value | undefined>(undefined);

  const primaryBlur = useRef(new Animated.Value(0)).current;
  const secondaryBlur = useRef(new Animated.Value(1)).current;
  const primaryOpacity = useRef(new Animated.Value(1)).current;
  const secondaryOpacity = useRef(new Animated.Value(1)).current;

  const {
    onSwipeComplete: primaryOnSwipeComplete,
    onSwipeXChange: primaryOnSwipeXChange,
    ...primaryCardProps
  } = primary;

  const sharedSwipeX = useMemo(() => swipeX ?? internalSwipeX, [internalSwipeX, swipeX]);

  const animateSwap = useCallback(
    (from: "primary" | "secondary", direction: "like" | "dislike") => {
      const to = from === "primary" ? "secondary" : "primary";
      const outgoingOpacity = from === "primary" ? primaryOpacity : secondaryOpacity;
      const incomingOpacity = from === "primary" ? secondaryOpacity : primaryOpacity;
      const outgoingBlur = from === "primary" ? primaryBlur : secondaryBlur;
      const incomingBlur = from === "primary" ? secondaryBlur : primaryBlur;

      setIsTransitioning(true);
      setDeckZ({
        primary: to === "primary" ? 100 : 50,
        secondary: to === "secondary" ? 100 : 50,
      });
      incomingOpacity.setValue(1);

      Animated.parallel([
        Animated.timing(outgoingOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(outgoingBlur, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(incomingBlur, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) {
          return;
        }
        outgoingOpacity.setValue(1);
        setActiveCard(to);
        setInternalSwipeX(undefined);
        setIsTransitioning(false);
        primaryOnSwipeComplete?.(direction);
      });
    },
    [primaryBlur, primaryOnSwipeComplete, primaryOpacity, secondaryBlur, secondaryOpacity],
  );

  const handlePrimarySwipeComplete = useCallback(
    (direction: "like" | "dislike") => animateSwap("primary", direction),
    [animateSwap],
  );

  const handleSecondarySwipeComplete = useCallback(
    (direction: "like" | "dislike") => animateSwap("secondary", direction),
    [animateSwap],
  );

  const handlePrimarySwipeXChange = useCallback(
    (value: Animated.Value) => {
      if (activeCard !== "primary") return;
      setInternalSwipeX(value);
      primaryOnSwipeXChange?.(value);
    },
    [activeCard, primaryOnSwipeXChange],
  );

  const handleSecondarySwipeXChange = useCallback(
    (value: Animated.Value) => {
      if (activeCard !== "secondary") return;
      setInternalSwipeX(value);
      primaryOnSwipeXChange?.(value);
    },
    [activeCard, primaryOnSwipeXChange],
  );

  useEffect(() => {
    setDeckZ({ primary: 100, secondary: 50 });
    setActiveCard("primary");
    primaryBlur.setValue(0);
    secondaryBlur.setValue(1);
    primaryOpacity.setValue(1);
    secondaryOpacity.setValue(1);
    setInternalSwipeX(undefined);
    setIsTransitioning(false);
  }, [
    primaryBlur,
    primaryCardProps.photos?.[0],
    secondary.photos?.[0],
    secondaryBlur,
    primaryOpacity,
    secondaryOpacity,
  ]);

  return (
    <View className={className} style={[{ height: heroImageHeight }, style]}>
      <FeedScrollContext.Provider value={scrollRef}>
        <Animated.View
          pointerEvents={!isTransitioning && activeCard === "secondary" ? "auto" : "none"}
          style={[
            StyleSheet.absoluteFillObject,
            { zIndex: deckZ.secondary },
            { opacity: secondaryOpacity },
          ]}
        >
          <BackgroundCard
            {...secondary}
            swipeX={sharedSwipeX}
            screenWidth={width}
            blurProgress={secondaryBlur}
            blurEnabled
            enableSwipe={!isTransitioning && activeCard === "secondary"}
            enableLocationToggle={!isTransitioning && activeCard === "secondary"}
            showScrollCue={activeCard === "secondary"}
            onSwipeComplete={activeCard === "secondary" ? handleSecondarySwipeComplete : undefined}
            onSwipeXChange={activeCard === "secondary" ? handleSecondarySwipeXChange : undefined}
          />
        </Animated.View>

        <Animated.View
          pointerEvents={!isTransitioning && activeCard === "primary" ? "auto" : "none"}
          style={[
            StyleSheet.absoluteFillObject,
            { zIndex: deckZ.primary },
            { opacity: primaryOpacity },
          ]}
        >
          <BackgroundCard
            {...primaryCardProps}
            screenWidth={width}
            blurProgress={primaryBlur}
            blurEnabled
            enableSwipe={!isTransitioning && activeCard === "primary"}
            enableLocationToggle={!isTransitioning && activeCard === "primary"}
            showScrollCue={activeCard === "primary"}
            onSwipeComplete={activeCard === "primary" ? handlePrimarySwipeComplete : undefined}
            onSwipeXChange={activeCard === "primary" ? handlePrimarySwipeXChange : undefined}
          />
        </Animated.View>
      </FeedScrollContext.Provider>
    </View>
  );
}

export const CardDeck = memo(CardDeckComponent);
