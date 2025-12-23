import { useFeedProfiles, useFeedSwipeActions, useFeedUIState, useScrollToggle } from "../../hooks";
import { ProfilePhotoGallery } from "../../../profile/components/ProfilePhotoGallery";
import { View, ScrollView, useWindowDimensions, StyleSheet } from "react-native";
import { GlassBackground } from "../../../../components/GlassBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CardDeck, UserInfoCard, EmptyFeedCard } from "../index";
import { BioSection } from "../userInfoCard/sections/BioSection";
import { useProfileDeck } from "../../hooks/useProfileDeck";
import { useState, useEffect, useCallback } from "react";
import { HeroScrollCue } from "../ui/HeroScrollCue";
import { FeedHeader } from "./FeedHeader";
import {
  mapBackendFiltersToUi,
  mapBackendLocationToUi,
  mapBackendProfileToUiProfile,
} from "../../mocks/incomingProfile";

function FeedScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { profiles, isLoading, noMoreProfiles: initialNoMoreProfiles } = useFeedProfiles();
  const [noMoreProfiles, setNoMoreProfiles] = useState(initialNoMoreProfiles);

  const deck = useProfileDeck(profiles);
  const { primaryCard, secondaryCard, primaryBackend, advance, total } = deck;

  const uiState = useFeedUIState({
    primaryCard,
    total,
    onNoMoreProfilesChange: setNoMoreProfiles,
  });

  const { handleSwipeComplete } = useFeedSwipeActions({
    primaryBackend,
    onAdvance: advance,
    onNoMoreProfiles: () => setNoMoreProfiles(true),
    onScrollToTop: uiState.scrollToTop,
  });

  const {
    locationOpen,
    activeLocationIndex,
    galleryVisible,
    mainRef,
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

  useEffect(() => {
    setNoMoreProfiles(initialNoMoreProfiles);
  }, [initialNoMoreProfiles]);

  if (noMoreProfiles || total === 0 || !deck.primaryProfile) {
    return (
      <View className="flex-1 items-center justify-center" style={styles.screenShell}>
        <GlassBackground intensity={90} />
        <EmptyFeedCard />
      </View>
    );
  }

  return (
    <View className="flex-1" style={styles.screenShell}>
      <GlassBackground intensity={90} />

      {deck.primaryProfile && primaryCard.galleryPhotos && primaryCard.galleryPhotos.length > 0 && (
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
              onLayout={event => {
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
}

export default FeedScreen;

const styles = StyleSheet.create({
  screenShell: {
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
