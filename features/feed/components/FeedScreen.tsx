import React from "react";
import { View, StyleSheet, TouchableOpacity, PanResponder, Animated } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import TabTransition from "../../../components/TabTransition";
import { RoomieCard } from "./RoomieCard";
import { RoomieInfoSection } from "./RoomieInfoSection";
import { EmptyFeedState } from "./EmptyFeedState";
import { FeedLoadingState } from "./FeedLoadingState";
import { useFeed } from "../hooks";
import { MatchActionType } from "../../../core/enums";

export function FeedScreen() {
  const { colors } = useTheme();
  const { roomies, isLoading, error, activeRoomie, nextRoomie, handleChoice, refresh } = useFeed();
  const [showDetails, setShowDetails] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragDx, setDragDx] = React.useState(0);
  const translateX = React.useRef(new Animated.Value(0)).current;
  const MAX_DRAG = 260;
  const ROTATION_DEG = 8;
  const rotate = translateX.interpolate({
    inputRange: [-MAX_DRAG, 0, MAX_DRAG],
    outputRange: [`-${ROTATION_DEG}deg`, "0deg", `${ROTATION_DEG}deg`],
    extrapolate: "clamp",
  });
  const COLOR_RANGE = MAX_DRAG * 0.6;
  const bgColor = translateX.interpolate({
    inputRange: [-COLOR_RANGE, 0, COLOR_RANGE],
    outputRange: ["rgba(239,68,68,0.45)", "transparent", "rgba(37,99,235,0.45)"],
    extrapolate: "clamp",
  });

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => setIsDragging(true),
      onPanResponderMove: (_, gesture) => {
        const dx = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, gesture.dx));
        translateX.setValue(dx);
        setDragDx(dx);
      },
      onPanResponderRelease: (_, gesture) => {
        const threshold = 140;
        if (gesture.dx > threshold) {
          Animated.timing(translateX, { toValue: 800, duration: 180, useNativeDriver: true }).start(
            () => {
              translateX.setValue(0);
              handleChoice(MatchActionType.LIKE);
              setIsDragging(false);
              setDragDx(0);
            },
          );
          return;
        }
        if (gesture.dx < -threshold) {
          Animated.timing(translateX, {
            toValue: -800,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            handleChoice(MatchActionType.PASS);
            setIsDragging(false);
            setDragDx(0);
          });
          return;
        }
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
          speed: 15,
        }).start(() => {
          setIsDragging(false);
          setDragDx(0);
        });
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
          speed: 15,
        }).start(() => {
          setIsDragging(false);
          setDragDx(0);
        });
      },
    }),
  ).current;

  if (isLoading && roomies.length === 0) {
    return (
      <TabTransition>
        <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <FeedLoadingState />
        </View>
      </TabTransition>
    );
  }

  if (error && roomies.length === 0) {
    return (
      <TabTransition>
        <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <EmptyFeedState onRefresh={refresh} />
        </View>
      </TabTransition>
    );
  }

  if (roomies.length === 0) {
    return (
      <TabTransition>
        <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <EmptyFeedState onRefresh={refresh} />
        </View>
      </TabTransition>
    );
  }

  return (
    <TabTransition>
      <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.fullBleed}>
          {/* Stack de cards ocupando toda la pantalla */}
          <View style={styles.stackFill}>
            {isDragging && Math.abs(dragDx) > 4 && (
              <Animated.View
                pointerEvents="none"
                style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]}
              />
            )}
            {!isDragging && nextRoomie && (
              <View style={[styles.fillLayer, styles.nextCardLayer]}>
                <RoomieCard roomie={nextRoomie} isNext />
              </View>
            )}

            {activeRoomie && (
              <Animated.View
                style={[
                  styles.fillLayer,
                  styles.cardGestureLayer,
                  { transform: [{ translateX }, { rotate }] },
                ]}
                {...panResponder.panHandlers}
              >
                <RoomieCard roomie={activeRoomie} />
              </Animated.View>
            )}
          </View>

          {/* Acciones por gestos - sin botones visibles */}

          {/* Flecha para ver detalles */}
          <TouchableOpacity
            style={styles.bottomChevron}
            activeOpacity={0.8}
            onPress={() => setShowDetails(prev => !prev)}
          >
            <View style={styles.chevronHandle} />
          </TouchableOpacity>

          {/* Overlay de detalles a pantalla completa */}
          {showDetails && activeRoomie && (
            <View style={[styles.detailsOverlay, { backgroundColor: colors.background }]}>
              <RoomieInfoSection roomie={activeRoomie} />
            </View>
          )}
        </View>
      </View>
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  fullBleed: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  stackFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fillLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardGestureLayer: {
    backgroundColor: "transparent",
  },
  nextCardLayer: {
    top: 12,
    left: 10,
    right: -10,
  },
  floatingActions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 12,
  },
  bottomChevron: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 92,
    alignItems: "center",
  },
  chevronHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  detailsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
