import { useFeedProfiles, useFeedSwipeActions, useFeedUIState, useScrollToggle } from "../../hooks";
import { ProfilePhotoGallery } from "../../../profile/components/ProfilePhotoGallery";
import { GlassBackground } from "../../../../components/GlassBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BioSection } from "../userInfoCard/sections/BioSection";
import { useProfileDeck } from "../../hooks/useProfileDeck";
import { useFocusEffect } from "@react-navigation/native";
import { EmptyFeedCard } from "../cards/EmptyFeedCard";
import { HeroScrollCue } from "../ui/HeroScrollCue";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { UserInfoCard } from "../userInfoCard";
import { useState, useCallback } from "react";
import { CardDeck } from "../swipe/CardDeck";
import { MatchModal } from "../MatchModal";
import { FeedHeader } from "./FeedHeader";
import { useRouter } from "expo-router";
import {
  mapBackendFiltersToUi,
  mapBackendLocationToUi,
  mapBackendProfileToUiProfile,
} from "../../mocks/incomingProfile";
import {
  View,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  StatusBar as RNStatusBar,
} from "react-native";

function FeedScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { profiles, isLoading, noMoreProfiles: serverNoMoreProfiles, refresh } = useFeedProfiles();
  const [localNoMoreProfiles, setLocalNoMoreProfiles] = useState(false);

  // Total derived from profiles or hook
  const noMoreProfiles = serverNoMoreProfiles || localNoMoreProfiles;
  const [matchData, setMatchData] = useState<{
    profile: any;
  } | null>(null);

  const deck = useProfileDeck(profiles);
  const { primaryCard, secondaryCard, primaryBackend, advance, total } = deck;

  const uiState = useFeedUIState({
    primaryCard,
  });

  const { handleSwipeComplete } = useFeedSwipeActions({
    primaryBackend,
    onAdvance: advance,
    onNoMoreProfiles: () => setLocalNoMoreProfiles(true),
    onScrollToTop: uiState.scrollToTop,
    onMatch: matchedProfile => {
      setMatchData({ profile: matchedProfile });
    },
  });

  const {
    locationOpen,
    activeLocationIndex,
    galleryVisible,
    mainRef,
    scrollToTop,
    setLocationOpen,
    setActiveLocationIndex,
    setGalleryVisible,
  } = uiState;

  const showScrollCue = !!(
    primaryBackend &&
    primaryCard.galleryPhotos &&
    primaryCard.galleryPhotos.length > 0
  );

  const [scrollTarget, setScrollTarget] = useState(0);

  const {
    isScrolled,
    handleScrollToggle,
    handleScroll: handleScrollInternal,
  } = useScrollToggle({
    scrollRef: mainRef,
    targetY: scrollTarget,
  });

  const handleScroll = useCallback(
    (event: any) => {
      handleScrollInternal(event);
    },
    [handleScrollInternal],
  );

  const handleRefresh = useCallback(async () => {
    setLocalNoMoreProfiles(false);
    await refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      RNStatusBar.setBarStyle(isDark ? "light-content" : "dark-content", true);
      const timer = setTimeout(() => {
        scrollToTop(false);
      }, 10);
      return () => clearTimeout(timer);
    }, [isDark, scrollToTop]),
  );

  const content =
    noMoreProfiles || total === 0 || !deck.primaryProfile ? (
      <View className="flex-1 items-center justify-center" style={styles.screenShell}>
        <GlassBackground intensity={90} />
        <EmptyFeedCard onReload={handleRefresh} isLoading={isLoading} />
      </View>
    ) : (
      <View className="flex-1" style={styles.screenShell}>
        <GlassBackground intensity={90} />

        {deck.primaryProfile &&
          primaryCard.galleryPhotos &&
          primaryCard.galleryPhotos.length > 0 && (
            <ProfilePhotoGallery
              visible={galleryVisible}
              photos={primaryCard.galleryPhotos}
              initialIndex={0}
              onClose={() => setGalleryVisible(false)}
            />
          )}

        <ScrollView
          ref={mainRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8 }]}
          bounces={false}
          alwaysBounceVertical={false}
          overScrollMode="never"
          scrollEnabled={!noMoreProfiles && total > 0 && !!deck.primaryProfile}
          style={styles.mainScroll}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <>
            {deck.primaryProfile && !noMoreProfiles && total > 0 && !isLoading && (
              <FeedHeader
                locations={primaryCard.locationStrings ?? ["Sin ubicación"]}
                activeLocationIndex={activeLocationIndex}
                activeLocation={
                  primaryCard.locationStrings?.[activeLocationIndex] ??
                  primaryCard.locationStrings?.[0] ??
                  ""
                }
                locationOpen={locationOpen}
                onToggleLocation={() => setLocationOpen(v => !v)}
                onSelectLocation={(_loc, index) => {
                  setActiveLocationIndex(index);
                }}
              />
            )}
            <CardDeck
              key={`${primaryCard.galleryPhotos?.[0] ?? ""}|${primaryCard.headline}|${primaryCard.budgetLabel}`}
              screenWidth={screenWidth}
              scrollRef={mainRef}
              hideLocationChip
              primary={{
                photos: primaryCard.galleryPhotos,
                locationStrings: primaryCard.locationStrings,
                headline: primaryCard.headline,
                budget: primaryCard.budgetLabel,
                basicInfo: primaryCard.basicInfo,
                onSwipeComplete: handleSwipeComplete,
                photosCount: primaryCard.galleryPhotos?.length ?? 0,
                onPhotosPress: () => setGalleryVisible(true),
              }}
              secondary={{
                photos: secondaryCard.galleryPhotos,
                locationStrings: secondaryCard.locationStrings,
                headline: secondaryCard.headline,
                budget: secondaryCard.budgetLabel,
                basicInfo: secondaryCard.basicInfo,
              }}
            />
            {showScrollCue && (
              <View
                className="items-center shadow-slate-200 shadow-lg rounded-2xl p-2"
                onLayout={() => {
                  setScrollTarget(720);
                }}
              >
                {primaryBackend?.profile?.bio ? (
                  <BioSection bio={primaryBackend.profile.bio} />
                ) : null}
              </View>
            )}
            {primaryBackend && primaryCard.galleryPhotos.length > 0 ? (
              <UserInfoCard
                profile={mapBackendProfileToUiProfile(primaryBackend.profile)}
                location={mapBackendLocationToUi(primaryBackend.location)}
                filters={mapBackendFiltersToUi(primaryBackend.filters)}
                budgetFull={primaryCard.budgetLabel}
              />
            ) : null}
          </>
        </ScrollView>

        {deck.primaryProfile && total > 0 && (
          <View style={[styles.floatingArrow, { bottom: insets.bottom + 60 }]}>
            <HeroScrollCue onPress={handleScrollToggle} rotated={isScrolled} />
          </View>
        )}
      </View>
    );

  return (
    <View style={styles.container}>
      {content}

      <MatchModal
        visible={!!matchData}
        userImage={user?.photoUrl ?? null}
        matchImage={matchData?.profile?.photoUrl ?? null}
        matchName={matchData?.profile?.firstName ?? "Alguien"}
        onSendMessage={() => {
          setMatchData(null);
          router.push("/chat");
        }}
        onKeepSwiping={() => setMatchData(null)}
      />
    </View>
  );
}

export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenShell: {
    flex: 1,
    backgroundColor: "transparent",
  },

  mainScroll: {
    backgroundColor: "transparent",
  },
  scrollContent: {
    backgroundColor: "transparent",
  },
  scrollCue: {
    alignSelf: "center",
  },
  floatingArrow: {
    position: "absolute",
    right: 20,
    zIndex: 10000,
    elevation: 10000,
  },
});
