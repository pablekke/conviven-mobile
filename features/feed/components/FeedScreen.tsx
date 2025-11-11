import { View, Text, ScrollView, useWindowDimensions, StatusBar, StyleSheet } from "react-native";
import { useRef, useState } from "react";

import { UserInfoCard } from "./index";
import { SwipeDeck, SwipeDeckItem } from "./SwipeDeck";
import { incomingProfilesMock } from "../mocks/incomingProfile";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { FeedScrollContext } from "../context/ScrollContext";
import { createProfileCardData } from "../hooks";

const profiles = incomingProfilesMock;
const deckProfiles = profiles.map((profile, index) => ({
  id: `profile-${index}`,
  profile,
  card: createProfileCardData(profile),
}));
function FeedScreen() {
  const TAB_BAR_HEIGHT = FEED_CONSTANTS.TAB_BAR_HEIGHT;

  const { height: winH, width: screenWidth } = useWindowDimensions();
  const HERO_HEIGHT = Math.max(0, winH + TAB_BAR_HEIGHT);
  const HERO_BOTTOM_SPACING = TAB_BAR_HEIGHT + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const HERO_IMAGE_HEIGHT = Math.max(
    0,
    HERO_HEIGHT - HERO_BOTTOM_SPACING + FEED_CONSTANTS.HERO_IMAGE_EXTRA,
  );

  const [locW, setLocW] = useState<number | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const mainRef = useRef<ScrollView | null>(null);
  const deckItems: SwipeDeckItem<(typeof profiles)[number]>[] = deckProfiles;

  const normalizedIndex = deckItems.length === 0 ? 0 : activeIndex % deckItems.length;
  const activeItem = deckItems[normalizedIndex];
  const longestLocation = activeItem?.card.longestLocation ?? "";
  const budgetLabel = activeItem?.card.budgetLabel ?? "";
  const activeProfile = activeItem?.profile;

  return (
    <View className="flex-1" style={styles.screenShell}>
      <StatusBar barStyle="light-content" />

      <View
        className="absolute -left-[9999px] top-0 flex-row items-center px-3"
        key={longestLocation}
        onLayout={e => {
          const measuredWidth = e.nativeEvent.layout.width;
          const maxWidth = screenWidth * 0.7;
          setLocW(Math.min(measuredWidth, maxWidth));
        }}
      >
        <Text className="text-[13px] font-semibold flex-1">{longestLocation}</Text>
        <View style={styles.iconSpacer} />
      </View>

      <ScrollView
        ref={mainRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: TAB_BAR_HEIGHT + 60 }]}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        style={styles.mainScroll}
      >
        <View className="relative w-full" style={{ height: HERO_IMAGE_HEIGHT }}>
          <FeedScrollContext.Provider value={mainRef}>
            <SwipeDeck
              items={deckItems}
              locationWidth={locW}
              onIndexChange={setActiveIndex}
            />
          </FeedScrollContext.Provider>
        </View>
        {activeProfile ? (
          <UserInfoCard
            profile={activeProfile.profile}
            location={activeProfile.location}
            filters={activeProfile.filters}
            budgetFull={budgetLabel}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

export default FeedScreen;

const styles = StyleSheet.create({
  screenShell: {
    backgroundColor: "transparent",
  },
  iconSpacer: {
    width: 14,
    height: 14,
  },
  mainScroll: {
    backgroundColor: "transparent",
  },
  scrollContent: {
    backgroundColor: "transparent",
  },
});
