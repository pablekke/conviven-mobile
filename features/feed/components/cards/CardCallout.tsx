import { StyleSheet, View, StyleProp, ViewStyle, TextStyle, Animated } from "react-native";
import { FeedScrollContext } from "../../context/ScrollContext";
import { ProfileHeadline } from "../ui/ProfileHeadline";
import { BudgetHighlight } from "../ui/BudgetHighlight";
import { BasicInfoPills } from "../ui/BasicInfoPills";
import HeroScrollCue from "../ui/HeroScrollCue";
import { memo, useContext } from "react";

interface CardCalloutProps {
  headline: string;
  budget: string;
  basicInfo: readonly string[];
  cardHeight: number;
  showScrollCue?: boolean;
  arrowTranslate: Animated.Value;
  headlineStyle?: TextStyle;
  budgetStyle?: TextStyle;
  infoWrapperStyle?: StyleProp<ViewStyle>;
}

export const CardCallout = memo(
  ({
    headline,
    budget,
    basicInfo,
    cardHeight,
    showScrollCue = true,
    arrowTranslate,
    headlineStyle,
    budgetStyle,
    infoWrapperStyle,
  }: CardCalloutProps) => {
    const scrollRef = useContext(FeedScrollContext);

    const handleScrollPress = () => {
      const scrollView = scrollRef?.current;
      if (!scrollView) return;
      scrollView.scrollTo({
        y: cardHeight,
        animated: true,
      });
    };

    return (
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
                onPress={handleScrollPress}
                style={styles.scrollCue}
              />
            ) : null}
          </View>
          <BasicInfoPills items={basicInfo} />
        </View>
      </View>
    );
  },
);

CardCallout.displayName = "CardCallout";

const styles = StyleSheet.create({
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
});
