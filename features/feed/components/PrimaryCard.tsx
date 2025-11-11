import { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  View,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
  Text,
  TextStyle,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { PhotoCarousel } from "./PhotoCarousel";
import { LocationChip } from "./LocationChip";
import HeroScrollCue from "./HeroScrollCue";
import { ProfileHeadline } from "./ProfileHeadline";
import { BudgetHighlight } from "./BudgetHighlight";
import { BasicInfoPills } from "./BasicInfoPills";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { useSwipeCard } from "../hooks";
import { FeedScrollContext } from "../context/ScrollContext";

export type PrimaryCardProps = {
  photos: string[];
  locationStrings: string[];
  locationWidth?: number;
  headline: string;
  budget: string;
  basicInfo: readonly string[];
  blurOverlayStyle?: StyleProp<ViewStyle>;
  onSwipeComplete?: (direction: "like" | "dislike") => void;
  onSwipeXChange?: (value: Animated.Value) => void;
  enableSwipe?: boolean;
  enableLocationToggle?: boolean;
  showScrollCue?: boolean;
  locationChipStyle?: StyleProp<ViewStyle>;
  locationChipTextStyle?: StyleProp<TextStyle>;
  headlineStyle?: TextStyle;
  budgetStyle?: TextStyle;
  infoWrapperStyle?: StyleProp<ViewStyle>;
  onReady?: () => void;
};

function PrimaryCardComponent({
  photos,
  locationStrings,
  locationWidth,
  headline,
  budget,
  basicInfo,
  blurOverlayStyle,
  onSwipeComplete,
  onSwipeXChange,
  enableSwipe = true,
  enableLocationToggle = true,
  showScrollCue = true,
  locationChipStyle,
  locationChipTextStyle,
  headlineStyle,
  budgetStyle,
  infoWrapperStyle,
  onReady,
}: PrimaryCardProps) {
  const { height: winH, width: winW } = useWindowDimensions();
  const tabBarHeight = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const computedHeroHeight = Math.max(0, winH + tabBarHeight);
  const heroBottomSpacing = tabBarHeight + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const cardHeight = Math.max(
    0,
    computedHeroHeight - heroBottomSpacing + FEED_CONSTANTS.HERO_IMAGE_EXTRA,
  );

  const swipeHandlers = useSwipeCard({
    screenWidth: winW,
    onComplete: onSwipeComplete,
    disabled: !enableSwipe,
  });

  const { swipeX, swipeActive, cardStyle: animatedCardStyle, panHandlers } = swipeHandlers;

  useEffect(() => {
    if (!onSwipeXChange) return;
    onSwipeXChange(swipeX);
  }, [onSwipeXChange, swipeX]);

  const scrollRef = useContext(FeedScrollContext);
  const arrowTranslate = useRef(new Animated.Value(0)).current;
  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    if (!showScrollCue) return;
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowTranslate, {
          toValue: 10,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(arrowTranslate, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );

    bounce.start();
    return () => {
      bounce.stop();
      arrowTranslate.setValue(0);
    };
  }, [arrowTranslate, showScrollCue]);

  const overlayStyle = useMemo(() => {
    const blurHeight = Math.min(cardHeight * 0.65, FEED_CONSTANTS.HERO_BLUR_MAX_HEIGHT);
    const top = Math.max(0, cardHeight - (blurHeight + FEED_CONSTANTS.HERO_BLUR_OVERHANG));
    return [
      styles.blurOverlay,
      { top, height: blurHeight + FEED_CONSTANTS.HERO_BLUR_OVERHANG },
      blurOverlayStyle,
    ] as StyleProp<ViewStyle>;
  }, [blurOverlayStyle, cardHeight]);

  const toggleLocation = () => {
    if (!enableLocationToggle) return;
    setLocationOpen(v => !v);
  };

  const mainLocation = locationStrings[0] ?? "—";

  return (
    <Animated.View
      style={[styles.cardContainer, { height: cardHeight }, animatedCardStyle]}
      {...panHandlers}
    >
      <PhotoCarousel
        photos={photos}
        height={cardHeight}
        scrollEnabled={enableSwipe ? !swipeActive : false}
        onFirstPhotoLoaded={onReady}
      />

      {enableLocationToggle ? (
        <LocationChip
          locations={locationStrings}
          width={locationWidth}
          isOpen={locationOpen}
          onToggle={toggleLocation}
        />
      ) : (
        <View
          style={[
            styles.staticLocationChip,
            locationWidth != null ? { width: locationWidth } : null,
            locationChipStyle,
          ]}
        >
          <Text style={[styles.staticLocationChipText, locationChipTextStyle]} numberOfLines={1}>
            {mainLocation}
          </Text>
        </View>
      )}

      <View pointerEvents="none" style={overlayStyle}>
        <MaskedView
          style={StyleSheet.absoluteFillObject}
          maskElement={
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.1)", "rgba(0,0,0,1)"]}
              locations={[0, 0.3, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          }
        >
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />
        </MaskedView>
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.12)", "rgba(0,0,0,0.24)"]}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={[styles.callout, styles.calloutAnchor]}>
        <View style={[styles.infoWrapper, infoWrapperStyle]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryText}>
              <ProfileHeadline text={headline} style={headlineStyle} />
              <BudgetHighlight value={budget} className="mt-1" style={budgetStyle} />
            </View>
            {showScrollCue ? (
              <HeroScrollCue
                translateY={arrowTranslate}
                onPress={() => {
                  const scrollView = scrollRef?.current;
                  if (!scrollView) return;
                  scrollView.scrollTo({
                    y: cardHeight,
                    animated: true,
                  });
                }}
                style={styles.scrollCue}
              />
            ) : null}
          </View>
          <BasicInfoPills items={basicInfo} />
        </View>
      </View>
    </Animated.View>
  );
}

export const PrimaryCard = memo(PrimaryCardComponent);

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    overflow: "hidden",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  blurOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    overflow: "hidden",
  },
  callout: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 30,
  },
  calloutAnchor: {
    bottom: 0,
  },
  infoWrapper: {
    width: "100%",
    paddingHorizontal: 16,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  summaryText: {
    flex: 1,
  },
  scrollCue: {
    marginBottom: 0,
    marginLeft: 16,
    alignSelf: "flex-start",
  },
  staticLocationChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  staticLocationChipText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
