import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  StatusBar,
  StyleSheet,
  Animated,
} from "react-native";
import { CardDeck, UserInfoCard } from "./index";
import {
  incomingProfilesMock,
  MockedBackendUser,
  mapBackendFiltersToUi,
  mapBackendLocationToUi,
  mapBackendProfileToUiProfile,
  mapBackendToProfileLike,
} from "../mocks/incomingProfile";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { useProfileCardData } from "../hooks";
import { useCallback, useRef, useState } from "react";
// -------------------- mock data --------------------
const profiles: MockedBackendUser[] = incomingProfilesMock;
const primaryProfile = profiles[0];
const secondaryProfile = profiles[1] ?? profiles[0];
const primaryProfileLike = mapBackendToProfileLike(primaryProfile);
const secondaryProfileLike = mapBackendToProfileLike(secondaryProfile);

// -------------------- Pantalla --------------------
function FeedScreen() {
  const TAB_BAR_HEIGHT = FEED_CONSTANTS.TAB_BAR_HEIGHT;

  const { width: screenWidth } = useWindowDimensions();

  const [locW, setLocW] = useState<number | undefined>(undefined);
  const [primarySwipeX, setPrimarySwipeX] = useState<Animated.Value | null>(null);
  const mainRef = useRef<ScrollView | null>(null);

  const handleSwipeXChange = useCallback((value: Animated.Value) => {
    setPrimarySwipeX(prev => (prev === value ? prev : value));
  }, []);

  const primaryData = useProfileCardData(primaryProfileLike);
  const {
    galleryPhotos: primaryPhotos,
    locationStrings: primaryLocations,
    longestLocation: primaryLongestLocation,
    budgetLabel: primaryBudget,
    headline: primaryHeadline,
    basicInfo: primaryBasicInfo,
  } = primaryData;

  const secondaryData = useProfileCardData(secondaryProfileLike);
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
        <CardDeck
          screenWidth={screenWidth}
          scrollRef={mainRef}
          swipeX={primarySwipeX}
          primary={{
            photos: primaryPhotos,
            locationStrings: primaryLocations,
            locationWidth: locW,
            headline: primaryHeadline,
            budget: primaryBudget,
            basicInfo: primaryBasicInfo,
            onSwipeComplete: direction => {
              console.log(`Swipe ${direction}`);
            },
            onSwipeXChange: handleSwipeXChange,
          }}
          secondary={{
            photos: secondaryPhotos,
            locationStrings: secondaryLocations,
            locationWidth: locW,
            headline: secondaryHeadline,
            budget: secondaryBudget,
            basicInfo: secondaryBasicInfo,
          }}
        />
        <UserInfoCard
          profile={mapBackendProfileToUiProfile(primaryProfile.profile)}
          location={mapBackendLocationToUi(primaryProfile.location)}
          filters={mapBackendFiltersToUi(primaryProfile.filters)}
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
