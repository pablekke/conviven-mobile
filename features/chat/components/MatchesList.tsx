/**
 * Componente que muestra los matches con los que aún no se ha iniciado conversación
 */

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export interface Match {
  id: string;
  name: string;
  avatar: string;
  age?: number;
}

export interface MatchesListProps {
  matches: Match[];
  onMatchPress?: (matchId: string) => void;
}

const PulseIndicator: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.indicatorContainer}>
      <Animated.View
        style={[
          styles.indicatorPulse,
          {
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({
              inputRange: [1, 1.3],
              outputRange: [0.4, 0],
            }),
          },
        ]}
      />
      <View style={styles.indicator} />
    </View>
  );
};

export const MatchesList: React.FC<MatchesListProps> = ({ matches, onMatchPress }) => {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 48) / 3.6;

  if (!matches || matches.length === 0) {
    return null;
  }

  return (
    <View className="pb-4 pt-1" style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {matches.map(match => (
          <TouchableOpacity
            key={match.id}
            onPress={() => onMatchPress?.(match.id)}
            className="items-center justify-center rounded-3xl mr-3"
            style={[styles.matchCard, { width: cardWidth }]}
            activeOpacity={0.8}
          >
            <PulseIndicator />
            <View style={styles.avatarContainer}>
              <Image source={{ uri: match.avatar }} style={styles.avatar} />
            </View>
            <View className="flex-row items-baseline mt-2">
              <Text className="text-base font-conviven-bold text-white" numberOfLines={1}>
                {match.name.split(" ")[0]}
              </Text>
              {match.age && (
                <Text className="text-sm font-conviven text-white/90 ml-1">{match.age}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "visible",
  },
  scrollView: {
    overflow: "visible",
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  matchCard: {
    height: 110,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  indicatorContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    width: 10,
    height: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 4,
  },
  indicatorPulse: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFD700",
  },
});
