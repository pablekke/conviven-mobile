import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { View, StyleSheet, Dimensions, ActivityIndicator, Text } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import swipeService from "../services/swipeService";
import feedService from "../services/feedService";
import { UserCard } from "./UserCard";
import { Roomie } from "../types";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.3;

export const SwipeFeed: React.FC = () => {
  const [users, setUsers] = useState<Roomie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardScale = useSharedValue(1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await feedService.getMatchingFeed();
      setUsers(response.items);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSwipeComplete = (direction: "left" | "right") => {
    const currentUser = users[currentIndex];
    if (currentUser) {
      void swipeService.createSwipe({
        toUserId: currentUser.id,
        action: direction === "right" ? "like" : "pass",
      });
    }

    setCurrentIndex(prev => prev + 1);
    translateX.value = 0;
    translateY.value = 0;
    cardScale.value = 1;
  };

  const gesture = Gesture.Pan()
    .onUpdate(event => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      cardScale.value = interpolate(
        Math.abs(event.translationX),
        [0, width],
        [1, 0.9],
        Extrapolation.CLAMP,
      );
    })
    .onEnd(event => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? "right" : "left";
        translateX.value = withSpring(
          direction === "right" ? width * 1.5 : -width * 1.5,
          {},
          () => {
            runOnJS(handleSwipeComplete)(direction);
          },
        );
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        cardScale.value = withSpring(1);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-width, width], [-15, 15])}deg` },
      { scale: cardScale.value },
    ],
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(Math.abs(translateX.value), [0, width], [0.9, 1], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(Math.abs(translateX.value), [0, width], [0.6, 1], Extrapolation.CLAMP),
  }));

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.text}>No more profiles to show</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.cardStack}>
        {users[currentIndex + 1] && (
          <Animated.View style={[styles.cardWrapper, styles.nextCard, nextCardStyle]}>
            <UserCard user={users[currentIndex + 1]} />
          </Animated.View>
        )}

        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.cardWrapper, animatedCardStyle]}>
            <UserCard user={users[currentIndex]} />
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  cardStack: {
    width: width,
    height: height,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    position: "absolute",
    zIndex: 1,
  },
  nextCard: {
    zIndex: 0,
  },
  text: {
    color: "#ffffff",
    fontSize: 18,
  },
});
