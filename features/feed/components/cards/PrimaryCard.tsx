import { useScrollCueAnimation } from "../../hooks/useScrollCueAnimation";
import { Animated, StyleSheet, useWindowDimensions } from "react-native";
import { FEED_CONSTANTS } from "../../constants/feed.constants";
import type { PrimaryCardProps } from "./types";
import { BlurOverlay } from "./BlurOverlay";
import { CardCallout } from "./CardCallout";
import { HeroImage } from "./HeroImage";
import { memo } from "react";

function PrimaryCardComponent({
  photos,
  headline,
  budget,
  basicInfo,
  blurOverlayStyle,
  showScrollCue = true,
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
  const arrowTranslate = useScrollCueAnimation(showScrollCue);

  return (
    <Animated.View style={[styles.cardContainer, { height: cardHeight }, style]}>
      <HeroImage photo={mainPhoto ?? ""} height={cardHeight} />

      <BlurOverlay cardHeight={cardHeight} style={blurOverlayStyle} />

      <CardCallout
        headline={headline}
        budget={budget}
        basicInfo={basicInfo}
        cardHeight={cardHeight}
        showScrollCue={showScrollCue}
        arrowTranslate={arrowTranslate}
        headlineStyle={headlineStyle}
        budgetStyle={budgetStyle}
        infoWrapperStyle={infoWrapperStyle}
      />
    </Animated.View>
  );
}

export const PrimaryCard = memo(PrimaryCardComponent);

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 24,
  },
});
