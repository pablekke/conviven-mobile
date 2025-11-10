import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  StatusBar,
  StyleSheet,
  Animated,
} from "react-native";
import { UserInfoCard, BackgroundCard, PrimaryCard } from "./index";
import { incomingProfilesMock } from "../mocks/incomingProfile";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { FeedScrollContext } from "../context/ScrollContext";
import { useProfileCardData } from "../hooks";
import { useCallback, useMemo, useRef, useState } from "react";

// -------------------- mock data --------------------
const profiles = incomingProfilesMock;
// -------------------- Pantalla --------------------
function FeedScreen() {
  const TAB_BAR_HEIGHT = FEED_CONSTANTS.TAB_BAR_HEIGHT;

  const totalProfiles = profiles.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const { height: winH, width: screenWidth } = useWindowDimensions();
  const HERO_HEIGHT = Math.max(0, winH + TAB_BAR_HEIGHT);
  const HERO_BOTTOM_SPACING = TAB_BAR_HEIGHT + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const HERO_IMAGE_HEIGHT = Math.max(
    0,
    HERO_HEIGHT - HERO_BOTTOM_SPACING + FEED_CONSTANTS.HERO_IMAGE_EXTRA,
  );

  const [locW, setLocW] = useState<number | undefined>(undefined);
  const [primarySwipeX, setPrimarySwipeX] = useState<Animated.Value | null>(null);
  const mainRef = useRef<ScrollView | null>(null);

  const handleSwipeXChange = useCallback((value: Animated.Value) => {
    setPrimarySwipeX(prev => (prev === value ? prev : value));
  }, []);

  const safeIndex = useMemo(() => {
    if (totalProfiles === 0) return 0;
    return ((activeIndex % totalProfiles) + totalProfiles) % totalProfiles;
  }, [activeIndex, totalProfiles]);

  const primaryProfile = totalProfiles > 0 ? profiles[safeIndex] : null;
  const secondaryProfile = totalProfiles > 0 ? profiles[(safeIndex + 1) % totalProfiles] : null;

  const handleSwipeComplete = useCallback(
    (_direction: "like" | "dislike") => {
      if (totalProfiles <= 1) return;
      setActiveIndex(prev => (prev + 1) % totalProfiles);
    },
    [totalProfiles],
  );

  const primaryData = primaryProfile ? useProfileCardData(primaryProfile) : null;
  const {
    galleryPhotos: primaryPhotos = [],
    locationStrings: primaryLocations = [],
    longestLocation: primaryLongestLocation = "",
    budgetLabel: primaryBudget = "",
    headline: primaryHeadline = "",
    basicInfo: primaryBasicInfo = [],
  } = primaryData ?? {};

  const secondaryData = secondaryProfile ? useProfileCardData(secondaryProfile) : null;
  const {
    galleryPhotos: secondaryPhotos = [],
    locationStrings: secondaryLocations = [],
    budgetLabel: secondaryBudget = "",
    headline: secondaryHeadline = "",
    basicInfo: secondaryBasicInfo = [],
  } = secondaryData ?? {};

  const primaryCardKey = useMemo(() => {
    if (!primaryProfile) return "primary-empty";
    return `${primaryProfile.firstName}-${primaryProfile.lastName}-${primaryProfile.birthDate}`;
  }, [primaryProfile]);

  const secondaryCardKey = useMemo(() => {
    if (!secondaryProfile) return "secondary-empty";
    return `${secondaryProfile.firstName}-${secondaryProfile.lastName}-${secondaryProfile.birthDate}`;
  }, [secondaryProfile]);

  if (totalProfiles === 0 || !primaryProfile || !primaryData) {
    return (
      <View className="flex-1 items-center justify-center" style={styles.screenShell}>
        <Text className="text-white text-base font-medium">No hay perfiles disponibles por ahora.</Text>
      </View>
    );
  }

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
              key={`bg-${secondaryCardKey}`}
              photos={secondaryPhotos}
              locationStrings={secondaryLocations}
              locationWidth={locW}
              headline={secondaryHeadline}
              budget={secondaryBudget}
              basicInfo={secondaryBasicInfo}
              swipeX={primarySwipeX ?? undefined}
              screenWidth={screenWidth}
            />
            <PrimaryCard
              key={`primary-${primaryCardKey}`}
              photos={primaryPhotos}
              locationStrings={primaryLocations}
              locationWidth={locW}
              headline={primaryHeadline}
              budget={primaryBudget}
              basicInfo={primaryBasicInfo}
              onSwipeComplete={handleSwipeComplete}
              onSwipeXChange={handleSwipeXChange}
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
