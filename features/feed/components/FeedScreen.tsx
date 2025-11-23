import { View, ScrollView, useWindowDimensions, StatusBar, StyleSheet } from "react-native";
import { CardDeck, UserInfoCard, EmptyFeedCard } from "./index";
import {
  incomingProfilesMock,
  MockedBackendUser,
  mapBackendFiltersToUi,
  mapBackendLocationToUi,
  mapBackendProfileToUiProfile,
} from "../mocks/incomingProfile";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { useProfileDeck } from "../hooks/useProfileDeck";
import { useCallback, useEffect, useRef, useState } from "react";
import { feedService } from "../services";
import { mapBackendItemToMockedUser } from "../adapters/backendToMockedUser";
import { FEED_USE_MOCK } from "../../../config/env";
// -------------------- Pantalla --------------------
function FeedScreen() {
  const TAB_BAR_HEIGHT = FEED_CONSTANTS.TAB_BAR_HEIGHT;

  const { width: screenWidth } = useWindowDimensions();

  const [profiles, setProfiles] = useState<MockedBackendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  const mainRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfiles = async () => {
      if (FEED_USE_MOCK) {
        if (isMounted) {
          setProfiles(incomingProfilesMock);
          setNoMoreProfiles(incomingProfilesMock.length === 0);
          setIsLoading(false);
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
  }, []);

  const deck = useProfileDeck(profiles);
  const { primaryCard, secondaryCard, primaryBackend, advance, total } = deck;

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
      scrollToTop();
      const advanced = advance(direction);
      if (!advanced) {
        setNoMoreProfiles(true);
      }
    },
    [advance, scrollToTop],
  );

  useEffect(() => {
    if (total > 0) {
      setNoMoreProfiles(false);
    }
  }, [total]);

  return (
    <View className="flex-1" style={styles.screenShell}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        ref={mainRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: TAB_BAR_HEIGHT + 60 }]}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        scrollEnabled={!noMoreProfiles && total > 0 && !!deck.primaryProfile}
        style={styles.mainScroll}
      >
        {isLoading ? null : noMoreProfiles || total === 0 || !deck.primaryProfile ? (
          <EmptyFeedCard />
        ) : (
          <>
            <CardDeck
              screenWidth={screenWidth}
              scrollRef={mainRef}
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
