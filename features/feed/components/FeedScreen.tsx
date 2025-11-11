import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, View, useWindowDimensions } from "react-native";

import { CardDeck, UserInfoCard } from "./index";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { incomingProfilesMock } from "../mocks/incomingProfile";
import { createProfileDeckData } from "../utils/createProfileCardData";

function FeedScreen() {
  const TAB_BAR_HEIGHT = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const { width: screenWidth } = useWindowDimensions();
  const mainRef = useRef<ScrollView | null>(null);

  const deckData = useMemo(() => createProfileDeckData(incomingProfilesMock), []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [deckEnded, setDeckEnded] = useState(false);

  const handleActiveIndexChange = useCallback((index: number) => {
    setDeckEnded(false);
    setActiveIndex(index);
  }, []);

  const handleDeckEnd = useCallback(() => {
    setDeckEnded(true);
  }, []);

  const safeIndex = useMemo(() => {
    if (deckData.length === 0) return -1;
    const maxIndex = deckData.length - 1;
    if (deckEnded) {
      return Math.min(activeIndex, maxIndex);
    }
    return Math.min(indexOrZero(activeIndex), maxIndex);
  }, [activeIndex, deckData, deckEnded]);

  const activeItem = safeIndex >= 0 ? deckData[safeIndex] : undefined;
  const userInfo = activeItem?.userInfo;

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
        style={styles.mainScroll}
      >
        <CardDeck
          data={deckData}
          scrollRef={mainRef}
          screenWidth={screenWidth}
          hapticsEnabled
          onActiveIndexChange={handleActiveIndexChange}
          onSwipeComplete={direction => {
            console.log(`Swipe ${direction}`);
          }}
          onEnd={handleDeckEnd}
        />

        {userInfo ? (
          <UserInfoCard
            profile={userInfo.profile}
            location={userInfo.location}
            filters={userInfo.filters}
            budgetFull={userInfo.budgetFull}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function indexOrZero(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
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
