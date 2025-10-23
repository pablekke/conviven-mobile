import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../context/ThemeContext";
import TabTransition from "../../../components/TabTransition";
import { FeedHeader } from "./FeedHeader";
import { MatchScoreBadge } from "./MatchScoreBadge";
import { RoomieCard } from "./RoomieCard";
import { FeedActions } from "./FeedActions";
import { EmptyFeedState } from "./EmptyFeedState";
import { FeedLoadingState } from "./FeedLoadingState";
import { useFeed } from "../hooks";
import { MatchActionType } from "../../../core/enums";

export function FeedScreen() {
  const { colors } = useTheme();
  const { roomies, isLoading, error, activeRoomie, nextRoomie, handleChoice, refresh } = useFeed();

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
        <View className="px-6 pt-2 pb-2 flex-1">
          <FeedHeader roomie={activeRoomie ?? null} onClose={() => {}} onInfo={() => {}} />

          {activeRoomie && <MatchScoreBadge score={activeRoomie.matchScore} />}

          <View className="flex-1 justify-center">
            <View className="relative">
              {nextRoomie && <RoomieCard roomie={nextRoomie} isNext />}

              {activeRoomie && <RoomieCard roomie={activeRoomie} />}
            </View>
          </View>

          <FeedActions
            onLike={() => handleChoice(MatchActionType.LIKE)}
            onPass={() => handleChoice(MatchActionType.PASS)}
            onSuperLike={() => handleChoice(MatchActionType.SUPERLIKE)}
            disabled={isLoading}
          />
        </View>
      </SafeAreaView>
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
