import { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, useWindowDimensions, StatusBar, StyleSheet } from "react-native";

import { UserInfoCard } from "./index";
import { SwipeDeck, type SwipeDirection } from "./SwipeDeck";
import { incomingProfilesMock } from "../mocks/incomingProfile";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { FeedScrollContext } from "../context/ScrollContext";
import { createProfileCardData } from "../utils/createProfileCardData";

const MAX_PROFILES = 20;

type DeckItem = {
  id: string;
  profile: (typeof incomingProfilesMock)[number];
  card: ReturnType<typeof createProfileCardData>;
};

function buildDeck(): DeckItem[] {
  return incomingProfilesMock.slice(0, MAX_PROFILES).map((profile, index) => ({
    id: (profile as { id?: string }).id ?? `${profile.firstName}-${profile.lastName}-${index}`,
    profile,
    card: createProfileCardData(profile),
  }));
}

function FeedScreen() {
  const TAB_BAR_HEIGHT = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const { height: winH, width: screenWidth } = useWindowDimensions();
  const HERO_HEIGHT = Math.max(0, winH + TAB_BAR_HEIGHT);
  const HERO_BOTTOM_SPACING = TAB_BAR_HEIGHT + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const HERO_IMAGE_HEIGHT = Math.max(
    0,
    HERO_HEIGHT - HERO_BOTTOM_SPACING + FEED_CONSTANTS.HERO_IMAGE_EXTRA,
  );

  const deck = useMemo(() => buildDeck(), []);
  const deckLength = deck.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [locationWidth, setLocationWidth] = useState<number | undefined>(undefined);
  const mainRef = useRef<ScrollView | null>(null);

  const activeItem = deck[activeIndex] ?? null;
  const nextIndex = deckLength > 1 ? (activeIndex + 1) % deckLength : null;
  const nextItem = typeof nextIndex === "number" ? deck[nextIndex] : null;

  const handleSwipeComplete = useCallback(
    (_direction: SwipeDirection) => {
      setActiveIndex(prev => {
        if (deckLength === 0) return prev;
        const next = prev + 1;
        return next % deckLength;
      });
    },
    [deckLength],
  );

  if (!activeItem) {
    return null;
  }

  return (
    <View className="flex-1" style={styles.screenShell}>
      <StatusBar barStyle="light-content" />

      <View
        className="absolute -left-[9999px] top-0 flex-row items-center px-3"
        onLayout={e => {
          const measuredWidth = e.nativeEvent.layout.width;
          const maxWidth = screenWidth * 0.7;
          setLocationWidth(Math.min(measuredWidth, maxWidth));
        }}
      >
        <Text className="text-[13px] font-semibold flex-1" key={activeItem.id}>
          {activeItem.card.longestLocation}
        </Text>
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
              active={{ id: activeItem.id, data: activeItem.card }}
              next={nextItem ? { id: nextItem.id, data: nextItem.card } : null}
              onSwipeComplete={handleSwipeComplete}
              locationWidth={locationWidth}
              screenWidth={screenWidth}
            />
          </FeedScrollContext.Provider>
        </View>

        <UserInfoCard
          profile={activeItem.profile.profile}
          location={activeItem.profile.location}
          filters={activeItem.profile.filters}
          budgetFull={activeItem.card.budgetLabel}
        />
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
