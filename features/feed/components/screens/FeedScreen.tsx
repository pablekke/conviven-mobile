import { ProfilePhotoGallery } from "../../../profile/components/ProfilePhotoGallery";
import { CardDeck, UserInfoCard, EmptyFeedCard, FeedLoadingCard } from "../index";
import { View, ScrollView, useWindowDimensions, StyleSheet } from "react-native";
import { mapBackendItemToMockedUser } from "../../adapters/backendToMockedUser";
import { useFeedPrefetchHydrator } from "../../hooks/useFeedPrefetchHydrator";
import { GlassBackground } from "../../../../components/GlassBackground";
import { useDataPreload } from "../../../../context/DataPreloadContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { prefetchRoomiesImages } from "../../utils/prefetchImages";
import { useCallback, useEffect, useRef, useState } from "react";
import { FEED_CONSTANTS } from "../../constants/feed.constants";
import { useProfileDeck } from "../../hooks/useProfileDeck";
import { feedService, swipeService } from "../../services";
import { useAuth } from "../../../../context/AuthContext";
import { FEED_USE_MOCK } from "../../../../config/env";
import Toast from "react-native-toast-message";
import { FeedHeader } from "./FeedHeader";
import {
  incomingProfilesMock,
  MockedBackendUser,
  mapBackendFiltersToUi,
  mapBackendLocationToUi,
  mapBackendProfileToUiProfile,
} from "../../mocks/incomingProfile";

function FeedScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [profiles, setProfiles] = useState<MockedBackendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  const mainRef = useRef<ScrollView | null>(null);
  const { hydratePrefetchedFeed } = useFeedPrefetchHydrator();
  const { isPreloading, preloadCompleted } = useDataPreload();
  const { isAuthenticated } = useAuth();

  const [locationOpen, setLocationOpen] = useState(false);
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (isPreloading || !preloadCompleted) {
      return;
    }

    let isMounted = true;

    const prefetched = hydratePrefetchedFeed({ invalidate: false });
    if (prefetched) {
      if (isMounted) {
        setProfiles(prefetched.profiles);
        setNoMoreProfiles(prefetched.profiles.length === 0);
        setIsLoading(false);

        prefetchRoomiesImages(prefetched.profiles).catch(error => {
          console.debug("[FeedScreen] Error precargando imágenes:", error);
        });
      }

      return () => {
        isMounted = false;
      };
    }

    const loadProfiles = async () => {
      if (FEED_USE_MOCK) {
        if (isMounted) {
          setProfiles(incomingProfilesMock);
          setNoMoreProfiles(incomingProfilesMock.length === 0);
          setIsLoading(false);

          prefetchRoomiesImages(incomingProfilesMock).catch(error => {
            console.debug("[FeedScreen] Error precargando imágenes (mock):", error);
          });
        }
        return;
      }

      try {
        const response = await feedService.getMatchingFeed(1, FEED_CONSTANTS.ROOMIES_PER_PAGE);
        const backendProfiles = response.raw.items
          .map(mapBackendItemToMockedUser)
          .filter(Boolean) as MockedBackendUser[];

        if (!isMounted) return;

        if (backendProfiles.length > 0) {
          setProfiles(backendProfiles);
          setNoMoreProfiles(false);

          prefetchRoomiesImages(backendProfiles).catch(error => {
            console.debug("[FeedScreen] Error precargando imágenes:", error);
          });
        } else {
          setProfiles([]);
          setNoMoreProfiles(true);
        }
      } catch (error) {
        console.warn("[FeedScreen] Backend feed unavailable:", error);
        if (isMounted) {
          setProfiles([]);
          setNoMoreProfiles(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfiles();

    return () => {
      isMounted = false;
    };
  }, [hydratePrefetchedFeed, isPreloading, preloadCompleted, isAuthenticated]);

  const deck = useProfileDeck(profiles);
  const { primaryCard, secondaryCard, primaryBackend, advance, total } = deck;

  useEffect(() => {
    setActiveLocationIndex(0);
    setLocationOpen(false);
  }, [primaryCard.headline]);

  const scrollToTop = useCallback(() => {
    const scrollView = mainRef.current;
    if (!scrollView) return;
    scrollView.scrollTo({
      y: 0,
      animated: true,
    });
  }, []);

  const handleSwipeComplete = useCallback(
    (direction: "like" | "dislike") => {
      if (!FEED_USE_MOCK) {
        const toUserId =
          primaryBackend?.profile?.userId ?? primaryBackend?.filters?.userId ?? undefined;

        if (toUserId) {
          const action = direction === "like" ? "like" : "pass";
          swipeService.createSwipe({ toUserId, action }).catch(() => {
            Toast.show({
              type: "error",
              text1: "No se pudo enviar la acción",
              text2: "Reintentá en unos segundos.",
              position: "bottom",
            });
          });
        } else {
          console.warn("[FeedScreen] No se pudo resolver toUserId para enviar swipe.");
        }
      }

      scrollToTop();
      const advanced = advance(direction);
      if (!advanced) {
        setNoMoreProfiles(true);
      }
    },
    [advance, primaryBackend, scrollToTop],
  );

  useEffect(() => {
    if (total > 0) {
      setNoMoreProfiles(false);
    }
  }, [total]);

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
      >
        {isLoading ? (
          <FeedLoadingCard />
        ) : noMoreProfiles || total === 0 || !deck.primaryProfile ? (
          <EmptyFeedCard />
        ) : (
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
                photosCount={primaryCard.galleryPhotos?.length ?? 0}
                onPhotosPress={() => setGalleryVisible(true)}
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
              }}
              secondary={{
                photos: secondaryCard.galleryPhotos,
                locationStrings: secondaryCard.locationStrings,
                headline: secondaryCard.headline,
                budget: secondaryCard.budgetLabel,
                basicInfo: secondaryCard.basicInfo,
              }}
            />
            {primaryBackend && primaryCard.galleryPhotos.length > 0 ? (
              <UserInfoCard
                profile={mapBackendProfileToUiProfile(primaryBackend.profile)}
                location={mapBackendLocationToUi(primaryBackend.location)}
                filters={mapBackendFiltersToUi(primaryBackend.filters)}
                budgetFull={primaryCard.budgetLabel}
              />
            ) : null}
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

  mainScroll: {
    backgroundColor: "transparent",
  },
  scrollContent: {
    backgroundColor: "transparent",
  },
});
