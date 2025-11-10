import { View, Text, ScrollView, useWindowDimensions, StatusBar, StyleSheet } from "react-native";
import { UserInfoCard, BackgroundCard, PrimaryCard } from "./index";
import { useRef, useState } from "react";
import { incomingProfilesMock } from "../mocks/incomingProfile";
import { useProfileCardData } from "../hooks";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { FeedScrollContext } from "../context/ScrollContext";

// -------------------- mock data --------------------
const profiles = incomingProfilesMock;
const primaryProfile = profiles[0];
const secondaryProfile = profiles[1] ?? profiles[0];

// -------------------- Pantalla --------------------
function FeedScreen() {
  const TAB_BAR_HEIGHT = 50;

  const { height: winH, width: screenWidth } = useWindowDimensions();
  const HERO_HEIGHT = Math.max(0, winH + TAB_BAR_HEIGHT);
  const HERO_BOTTOM_SPACING = TAB_BAR_HEIGHT + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const HERO_IMAGE_HEIGHT = Math.max(
    0,
    HERO_HEIGHT - HERO_BOTTOM_SPACING + FEED_CONSTANTS.HERO_IMAGE_EXTRA,
  );

  const [locW, setLocW] = useState<number | undefined>(undefined);
  const mainRef = useRef<ScrollView | null>(null);

  const primaryData = useProfileCardData(primaryProfile);
  const {
    galleryPhotos: primaryPhotos,
    locationStrings: primaryLocations,
    longestLocation: primaryLongestLocation,
    budgetLabel: primaryBudget,
    headline: primaryHeadline,
    basicInfo: primaryBasicInfo,
  } = primaryData;

  const secondaryData = useProfileCardData(secondaryProfile);
  const {
    galleryPhotos: secondaryPhotos,
    locationStrings: secondaryLocations,
    budgetLabel: secondaryBudget,
    headline: secondaryHeadline,
    basicInfo: secondaryBasicInfo,
  } = secondaryData;

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
        <Text className="text-[13px] font-semibold flex-1">{primaryLongestLocation}</Text>
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
            <BackgroundCard
              photos={secondaryPhotos}
              locationStrings={secondaryLocations}
              locationWidth={locW}
              headline={secondaryHeadline}
              budget={secondaryBudget}
              basicInfo={secondaryBasicInfo}
            />

            <PrimaryCard
              photos={primaryPhotos}
              locationStrings={primaryLocations}
              locationWidth={locW}
              headline={primaryHeadline}
              budget={primaryBudget}
              basicInfo={primaryBasicInfo}
              onSwipeComplete={direction => {
                console.log(`Swipe ${direction}`);
              }}
            />
          </FeedScrollContext.Provider>
        </View>
        <UserInfoCard
          profile={primaryProfile.profile}
          location={primaryProfile.location}
          filters={primaryProfile.filters}
          budgetFull={primaryBudget}
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
