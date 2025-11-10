import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  StatusBar,
  StyleSheet,
  Animated,
  Easing,
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

  const { height: winH, width: screenWidth } = useWindowDimensions();
  const HERO_HEIGHT = Math.max(0, winH + TAB_BAR_HEIGHT);
  const HERO_BOTTOM_SPACING = TAB_BAR_HEIGHT + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const HERO_IMAGE_HEIGHT = Math.max(
    0,
    HERO_HEIGHT - HERO_BOTTOM_SPACING + FEED_CONSTANTS.HERO_IMAGE_EXTRA,
  );

  const [locW, setLocW] = useState<number | undefined>(undefined);
  const [primarySwipeX, setPrimarySwipeX] = useState<Animated.Value | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const transitionProgress = useRef(new Animated.Value(0)).current;
  const primaryEntrance = useRef(new Animated.Value(1)).current;
  const mainRef = useRef<ScrollView | null>(null);

  const handleSwipeXChange = useCallback((value: Animated.Value) => {
    setPrimarySwipeX(prev => (prev === value ? prev : value));
  }, []);

  const profileCount = profiles.length;

  const safeIndex = profileCount > 0 ? currentIndex % profileCount : 0;

  const primaryProfile = profiles[safeIndex];
  const secondaryProfile = profiles[profileCount > 1 ? (safeIndex + 1) % profileCount : safeIndex];

  const handleTransitionEnd = useCallback(() => {
    transitionProgress.setValue(0);
    primaryEntrance.setValue(0);
    if (profileCount > 0) {
      setCurrentIndex(prev => (prev + 1) % profileCount);
    }
    setTransitioning(false);
    Animated.timing(primaryEntrance, {
      toValue: 1,
      duration: 220,
      delay: 40,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [primaryEntrance, profileCount, transitionProgress]);

  const handleSwipeComplete = useCallback(
    (direction: "like" | "dislike") => {
      console.log(`Swipe ${direction}`);
      if (transitioning || profileCount === 0) return;

      setTransitioning(true);
      Animated.timing(transitionProgress, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(handleTransitionEnd);
    },
    [handleTransitionEnd, profileCount, transitionProgress, transitioning],
  );

  if (!primaryProfile) {
    return (
      <View className="flex-1" style={styles.screenShell}>
        <StatusBar barStyle="light-content" />
      </View>
    );
  }

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

  const primaryRevealStyle = useMemo(
    () => ({
      ...StyleSheet.absoluteFillObject,
      opacity: primaryEntrance,
      transform: [
        {
          translateY: primaryEntrance.interpolate({
            inputRange: [0, 1],
            outputRange: [24, 0],
          }),
        },
        {
          scale: primaryEntrance.interpolate({
            inputRange: [0, 1],
            outputRange: [0.95, 1],
          }),
        },
      ],
    }),
    [primaryEntrance],
  );

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
              swipeX={primarySwipeX ?? undefined}
              screenWidth={screenWidth}
              revealProgress={transitionProgress}
            />
            {!transitioning && primaryProfile ? (
              <Animated.View style={primaryRevealStyle} pointerEvents={transitioning ? "none" : "auto"}>
                <PrimaryCard
                  photos={primaryPhotos}
                  locationStrings={primaryLocations}
                  locationWidth={locW}
                  headline={primaryHeadline}
                  budget={primaryBudget}
                  basicInfo={primaryBasicInfo}
                  onSwipeComplete={handleSwipeComplete}
                  onSwipeXChange={handleSwipeXChange}
                />
              </Animated.View>
            ) : null}
          </FeedScrollContext.Provider>
        </View>
        {primaryProfile ? (
          <UserInfoCard
            profile={primaryProfile.profile}
            location={primaryProfile.location}
            filters={primaryProfile.filters}
            budgetFull={primaryBudget}
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
