import { View, Text, ScrollView, useWindowDimensions, StatusBar, StyleSheet } from "react-native";
import { CardDeck, UserInfoCard } from "./index";
import {
  incomingProfilesMock,
  MockedBackendUser,
  mapBackendFiltersToUi,
  mapBackendLocationToUi,
  mapBackendProfileToUiProfile,
} from "../mocks/incomingProfile";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { useProfileDeck } from "../hooks/useProfileDeck";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// -------------------- mock data --------------------
const profiles: MockedBackendUser[] = incomingProfilesMock;
// -------------------- Pantalla --------------------
function FeedScreen() {
  const TAB_BAR_HEIGHT = FEED_CONSTANTS.TAB_BAR_HEIGHT;

  const { width: screenWidth } = useWindowDimensions();

  const [locW, setLocW] = useState<number | undefined>(undefined);
  const mainRef = useRef<ScrollView | null>(null);

  const deck = useProfileDeck(profiles);
  const { primaryCard, secondaryCard, primaryBackend, advance } = deck;
  const [noMoreProfiles, setNoMoreProfiles] = useState(deck.total === 0);

  const primaryLongestLocation = useMemo(
    () => primaryCard.longestLocation ?? "",
    [primaryCard.longestLocation],
  );

  useEffect(() => {
    setLocW(undefined);
  }, [primaryLongestLocation]);

  const handleSwipeComplete = useCallback(
    (direction: "like" | "dislike") => {
      console.log(`Swipe ${direction}`);
      const advanced = advance(direction);
      if (!advanced) {
        setNoMoreProfiles(true);
      }
    },
    [advance],
  );

  const activeBackend = primaryBackend ?? profiles[0];

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
        {noMoreProfiles ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No hay más personas</Text>
            <Text style={styles.emptySubtitle}>Vuelve más tarde para ver nuevos perfiles.</Text>
          </View>
        ) : (
          <>
            <CardDeck
              screenWidth={screenWidth}
              scrollRef={mainRef}
              primary={{
                photos: primaryCard.galleryPhotos,
                locationStrings: primaryCard.locationStrings,
                locationWidth: locW,
                headline: primaryCard.headline,
                budget: primaryCard.budgetLabel,
                basicInfo: primaryCard.basicInfo,
                onSwipeComplete: handleSwipeComplete,
              }}
              secondary={{
                photos: secondaryCard.galleryPhotos,
                locationStrings: secondaryCard.locationStrings,
                locationWidth: locW,
                headline: secondaryCard.headline,
                budget: secondaryCard.budgetLabel,
                basicInfo: secondaryCard.basicInfo,
              }}
            />
            <UserInfoCard
              profile={mapBackendProfileToUiProfile(activeBackend.profile)}
              location={mapBackendLocationToUi(activeBackend.location)}
              filters={mapBackendFiltersToUi(activeBackend.filters)}
              budgetFull={primaryCard.budgetLabel}
            />
          </>
        )}
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
  emptyState: {
    marginTop: 96,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
