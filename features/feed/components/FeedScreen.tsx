import { View, Text, ScrollView, useWindowDimensions, StatusBar, StyleSheet } from "react-native";
import { useCallback, useRef, useState } from "react";

import { UserInfoCard, SwipeDeck } from "./index";
import { incomingProfilesMock } from "../mocks/incomingProfile";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { FeedScrollContext } from "../context/ScrollContext";
import {
  ProfileCardData,
  ProfileCardSource,
  createProfileCardData,
} from "../utils/createProfileCardData";

// -------------------- mock data --------------------
const profiles = incomingProfilesMock;

// -------------------- Pantalla --------------------
type ActiveSnapshot = {
  profile: ProfileCardSource;
  card: ProfileCardData;
};

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
  const [activeSnapshot, setActiveSnapshot] = useState<ActiveSnapshot | null>(() => {
    if (!profiles.length) return null;
    return { profile: profiles[0], card: createProfileCardData(profiles[0]) };
  });
  const mainRef = useRef<ScrollView | null>(null);

  const longestLocation = activeSnapshot?.card.longestLocation ?? "";
  const budgetFull = activeSnapshot?.card.budgetFull ?? "";
  const activeProfile = activeSnapshot?.profile;
  const handleDeckActiveChange = useCallback((snapshot: ActiveSnapshot | null) => {
    setActiveSnapshot(snapshot);
  }, []);

  return (
    <View className="flex-1" style={styles.screenShell}>
      <StatusBar barStyle="light-content" />

      {/* Medidor oculto del ancho del chip de ubicación */}
      <View
        className="absolute -left-[9999px] top-0 flex-row items-center px-3"
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
        {/* HERO */}
        <View className="relative w-full" style={{ height: HERO_IMAGE_HEIGHT }}>
          <FeedScrollContext.Provider value={mainRef}>
            <SwipeDeck
              profiles={profiles}
              locationWidth={locW}
              screenWidth={screenWidth}
              onActiveProfileChange={handleDeckActiveChange}
              onDecision={({ direction }) => {
                console.log(`Swipe ${direction}`);
              }}
            />
          </FeedScrollContext.Provider>
        </View>
        {activeProfile ? (
          <UserInfoCard
            profile={activeProfile.profile}
            location={activeProfile.location ?? activeProfile.filters.mainPreferredLocation}
            filters={activeProfile.filters}
            budgetFull={budgetFull}
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
