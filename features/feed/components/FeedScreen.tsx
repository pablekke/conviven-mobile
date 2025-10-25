import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../context/ThemeContext";
import TabTransition from "../../../components/TabTransition";
import { RoomieCard } from "./RoomieCard";
import { FeedActions } from "./FeedActions";
import { EmptyFeedState } from "./EmptyFeedState";
import { FeedLoadingState } from "./FeedLoadingState";
import { useFeed } from "../hooks";
import { MatchActionType } from "../../../core/enums";
import { FeedTopBar } from "./FeedTopBar";
import { RoomieInfoSection } from "./RoomieInfoSection";

export function FeedScreen() {
  const { colors } = useTheme();
  const {
    roomies,
    currentIndex,
    isLoading,
    error,
    activeRoomie,
    nextRoomie,
    handleChoice,
    refresh,
  } = useFeed();

  if (isLoading && roomies.length === 0) {
    return (
      <TabTransition>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <FeedLoadingState />
        </SafeAreaView>
      </TabTransition>
    );
  }

  if (error && roomies.length === 0) {
    return (
      <TabTransition>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <EmptyFeedState title="Ups, algo salió mal" subtitle={error} onRefresh={refresh} />
        </SafeAreaView>
      </TabTransition>
    );
  }

  if (roomies.length === 0) {
    return (
      <TabTransition>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <EmptyFeedState onRefresh={refresh} />
        </SafeAreaView>
      </TabTransition>
    );
  }

  return (
    <TabTransition>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View className="flex-1">
          <FeedTopBar
            totalRoomies={roomies.length}
            currentIndex={currentIndex}
            isLoading={isLoading}
            onRefresh={refresh}
          />

          <View className="flex-1 px-6">
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.cardStack}>
                {nextRoomie && (
                  <View style={[styles.cardLayer, styles.nextCardLayer]}>
                    <RoomieCard roomie={nextRoomie} isNext />
                  </View>
                )}

                {activeRoomie && (
                  <View style={styles.cardLayer}>
                    <RoomieCard roomie={activeRoomie} />
                  </View>
                )}
              </View>

              {activeRoomie && <RoomieInfoSection roomie={activeRoomie} />}
            </ScrollView>
          </View>

          <View className="px-6 pb-6 pt-4">
            <FeedActions
              onLike={() => handleChoice(MatchActionType.LIKE)}
              onPass={() => handleChoice(MatchActionType.PASS)}
              onSuperLike={() => handleChoice(MatchActionType.SUPERLIKE)}
              disabled={isLoading}
            />
          </View>
        </View>
      </SafeAreaView>
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  cardStack: {
    height: 520,
    position: "relative",
    marginTop: 12,
    width: "100%",
  },
  cardLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  nextCardLayer: {
    top: 14,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
