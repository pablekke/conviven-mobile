import { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import MaskedView from "@react-native-masked-view/masked-view";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { FeedScrollContext } from "../context/ScrollContext";
import { LinearGradient } from "expo-linear-gradient";
import { ProfileHeadline } from "./ProfileHeadline";
import { BudgetHighlight } from "./BudgetHighlight";
import { BasicInfoPills } from "./BasicInfoPills";
import { Image as ExpoImage } from "expo-image";
import { LocationChip } from "./LocationChip";
import HeroScrollCue from "./HeroScrollCue";
import { BlurView } from "expo-blur";
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

export type PrimaryCardProps = {
  photos: string[];
  locationStrings: string[];
  locationWidth?: number;
  headline: string;
  budget: string;
  basicInfo: readonly string[];
  onHeroImageLoadEnd?: () => void;
  heroPlaceholderEnabled?: boolean;
  blurOverlayStyle?: StyleProp<ViewStyle>;
  enableLocationToggle?: boolean;
  showScrollCue?: boolean;
  locationChipStyle?: StyleProp<ViewStyle>;
  locationChipTextStyle?: StyleProp<TextStyle>;
  headlineStyle?: TextStyle;
  budgetStyle?: TextStyle;
  infoWrapperStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

function PrimaryCardComponent({
  photos,
  locationStrings,
  headline,
  budget,
  basicInfo,
  onHeroImageLoadEnd,
  heroPlaceholderEnabled = false,
  blurOverlayStyle,
  enableLocationToggle = true,
  showScrollCue = true,
  locationChipStyle,
  locationChipTextStyle,
  headlineStyle,
  budgetStyle,
  infoWrapperStyle,
  style,
}: PrimaryCardProps) {
  const { height: winH } = useWindowDimensions();
  const tabBarHeight = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const computedHeroHeight = Math.max(0, winH + tabBarHeight);
  const heroBottomSpacing = tabBarHeight + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const cardHeight = Math.max(
    0,
    computedHeroHeight - heroBottomSpacing + FEED_CONSTANTS.HERO_IMAGE_EXTRA,
  );
  const mainPhoto = photos?.[0];

  const scrollRef = useContext(FeedScrollContext);
  const arrowTranslate = useRef(new Animated.Value(0)).current;
  const [locationOpen, setLocationOpen] = useState(false);
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);

  useEffect(() => {
    setLocationOpen(false);
    setActiveLocationIndex(0);
  }, [locationStrings, headline, budget]);

  useEffect(() => {
    if (!showScrollCue) return;
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowTranslate, {
          toValue: 10,
          duration: 100,
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

  const mainLocation = locationStrings[activeLocationIndex] ?? locationStrings[0] ?? "—";

  return (
    <Animated.View style={[styles.cardContainer, { height: cardHeight }, style]}>
      {/* <PhotoCarousel
        photos={photos}
        height={cardHeight}
        scrollEnabled={false}
      /> */}

      {mainPhoto ? (
        <View style={[styles.heroImageShell, { height: cardHeight }]}>
          <ExpoImage
            source={{ uri: mainPhoto }}
            style={[StyleSheet.absoluteFillObject, styles.heroImage]}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={mainPhoto}
            transition={0}
            onLoadEnd={onHeroImageLoadEnd}
          />

          {heroPlaceholderEnabled ? (
            <View pointerEvents="none" style={styles.heroPlaceholderOverlay}>
              <ExpoImage
                source={{ uri: mainPhoto }}
                style={[StyleSheet.absoluteFillObject, styles.heroImage]}
                contentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={mainPhoto}
                transition={0}
                onLoadEnd={onHeroImageLoadEnd}
              />
              <View pointerEvents="none" style={styles.heroPlaceholderTint} />
            </View>
          ) : null}
        </View>
      ) : null}

      {enableLocationToggle ? (
        <LocationChip
          locations={locationStrings ?? ["Sin ubicación"]}
          activeLabel={mainLocation}
          isOpen={locationOpen}
          onToggle={() => setLocationOpen(v => !v)}
          onSelect={(_loc, index) => {
            setActiveLocationIndex(index);
          }}
        />
      ) : (
        <View style={[styles.staticLocationChip, locationChipStyle]}>
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
  heroImageShell: {
    width: "100%",
    backgroundColor: "rgb(10, 16, 28)",
  },
  heroImage: {
    width: "100%",
  },
  heroPlaceholderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  heroPlaceholderLogo: {
    width: 96,
    height: 96,
    opacity: 0.22,
  },
  heroPlaceholderTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 16, 28, 0.0)",
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
