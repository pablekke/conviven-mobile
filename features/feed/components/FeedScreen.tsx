import { View, Text, ScrollView, useWindowDimensions, StatusBar, StyleSheet } from "react-native";
import { UserInfoCard, ProfileDeck } from "./index";
import { incomingProfilesMock } from "../mocks/incomingProfile";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { FeedScrollContext } from "../context/ScrollContext";
import { mapProfileToCardData } from "../hooks";
import { useCallback, useRef, useState } from "react";

// -------------------- mock data --------------------
type FeedProfile = (typeof incomingProfilesMock)[number];

const DUPLICATE_BATCH_SIZE = 3;

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
  const [profilePool, setProfilePool] = useState<FeedProfile[]>(() => incomingProfilesMock.slice());
  const [activeProfile, setActiveProfile] = useState<FeedProfile | null>(() => incomingProfilesMock[0] ?? null);
  const [activeSnapshot, setActiveSnapshot] = useState(() =>
    incomingProfilesMock[0] ? mapProfileToCardData(incomingProfilesMock[0]) : null,
  );
  const mainRef = useRef<ScrollView | null>(null);

  const handleActiveProfileChange = useCallback((profile: FeedProfile) => {
    setActiveProfile(profile);
    setActiveSnapshot(mapProfileToCardData(profile));
  }, []);

  const handleDeckExhausted = useCallback(() => {
    setActiveProfile(null);
    setActiveSnapshot(null);
  }, []);

  const handleSwipeAction = useCallback((profile: FeedProfile, direction: "like" | "dislike") => {
    const label = profile.displayName ?? `${profile.firstName} ${profile.lastName}`;
    console.log(`Swipe ${direction} → ${label}`);
  }, []);

  const createDuplicateBatch = useCallback((): FeedProfile[] => {
    return incomingProfilesMock
      .slice(0, DUPLICATE_BATCH_SIZE)
      .map(profile => JSON.parse(JSON.stringify(profile)) as FeedProfile);
  }, []);

  const handleRequestMore = useCallback(() => {
    setProfilePool(prev => {
      const extra = createDuplicateBatch();
      if (extra.length === 0) return prev;
      return [...prev, ...extra];
    });
  }, [createDuplicateBatch]);

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
        <Text className="text-[13px] font-semibold flex-1">
          {activeSnapshot?.longestLocation ?? ""}
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
        {/* HERO */}
        <View className="relative w-full" style={{ height: HERO_IMAGE_HEIGHT }}>
          <FeedScrollContext.Provider value={mainRef}>
            <ProfileDeck
              profiles={profilePool}
              locationWidth={locW}
              onActiveProfileChange={handleActiveProfileChange}
              onSwipeAction={handleSwipeAction}
              onRequestMore={handleRequestMore}
              onDeckExhausted={handleDeckExhausted}
            />
          </FeedScrollContext.Provider>
        </View>
        {activeProfile && activeSnapshot ? (
          <UserInfoCard
            profile={activeProfile.profile}
            location={activeProfile.location}
            filters={activeProfile.filters}
            budgetFull={activeSnapshot.budgetLabel}
          />
        ) : (
          <View style={styles.emptyInfoBlock}>
            <Text style={styles.emptyInfoTitle}>No quedan perfiles disponibles.</Text>
            <Text style={styles.emptyInfoSubtitle}>
              Estamos cargando nuevas personas para vos.
            </Text>
          </View>
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
  emptyInfoBlock: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 6,
  },
  emptyInfoSubtitle: {
    fontSize: 14,
    color: "rgba(248, 250, 252, 0.72)",
    textAlign: "center",
  },
});
