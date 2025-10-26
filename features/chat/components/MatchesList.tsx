/**
 * Componente que muestra los matches con los que aún no se ha iniciado conversación
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface Match {
  id: string;
  name: string;
  avatar: string;
}

export interface MatchesListProps {
  matches: Match[];
  onMatchPress?: (matchId: string) => void;
}

const GRADIENT_COLORS = [
  ["#EC4899", "#8B5CF6"], // Rosa a Púrpura
  ["#3B82F6", "#06B6D4"], // Azul a Cyan
  ["#F59E0B", "#EF4444"], // Naranja a Rojo
  ["#10B981", "#059669"], // Verde a Verde oscuro
  ["#8B5CF6", "#6366F1"], // Púrpura a Índigo
];

export const MatchesList: React.FC<MatchesListProps> = ({ matches, onMatchPress }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (!matches || matches.length === 0) {
    return null;
  }

  const getGradientColor = (index: number) => {
    return GRADIENT_COLORS[index % GRADIENT_COLORS.length];
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtStart = contentOffset.x <= 10;
    const isAtEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 10;

    setShowLeftArrow(!isAtStart);
    setShowRightArrow(!isAtEnd);
  };

  return (
    <View className="pb-5 pt-2 border-b border-border" style={styles.container}>
      <View style={styles.scrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {matches.map((match, index) => {
            const [color1] = getGradientColor(index);
            return (
              <TouchableOpacity
                key={match.id}
                onPress={() => onMatchPress?.(match.id)}
                className="items-center"
                style={[styles.matchItem, index === matches.length - 1 && styles.matchItemLast]}
                activeOpacity={0.7}
              >
                <View style={styles.avatarContainer}>
                  {/* Glow effect background */}
                  <View
                    style={[
                      styles.glowBackground,
                      {
                        backgroundColor: color1,
                      },
                    ]}
                  />
                  {/* Gradient border */}
                  <View
                    style={[
                      styles.gradientBorder,
                      {
                        borderColor: color1,
                      },
                    ]}
                  >
                    <View style={styles.innerBorder}>
                      <Image source={{ uri: match.avatar }} style={styles.avatar} />
                    </View>
                  </View>
                  {/* Online badge with pulse */}
                  <View style={styles.onlineBadgeContainer}>
                    <View style={styles.onlineBadgePulse} />
                    <View style={styles.onlineBadge}>
                      <Ionicons name="flame" size={9} color="#fff" />
                    </View>
                  </View>
                </View>
                <Text
                  className="text-xs font-conviven-bold text-foreground mt-3"
                  numberOfLines={1}
                  style={styles.nameText}
                >
                  {match.name.split(" ")[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Flecha izquierda */}
        {showLeftArrow && (
          <View style={styles.leftArrow}>
            <View style={styles.arrowBackground}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </View>
          </View>
        )}

        {/* Flecha derecha */}
        {showRightArrow && (
          <View style={styles.rightArrow}>
            <View style={styles.arrowBackground}>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "visible",
  },
  scrollContainer: {
    position: "relative",
  },
  scrollView: {
    overflow: "visible",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  leftArrow: {
    position: "absolute",
    left: 4,
    top: 30,
    zIndex: 10,
    pointerEvents: "none",
  },
  rightArrow: {
    position: "absolute",
    right: 4,
    top: 30,
    zIndex: 10,
    pointerEvents: "none",
  },
  arrowBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(37, 99, 235, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  matchItem: {
    marginRight: 20,
    alignItems: "center",
  },
  matchItemLast: {
    marginRight: 0,
  },
  avatarContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    height: 72,
  },
  glowBackground: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    transform: [{ scale: 1.1 }],
    opacity: 0.2,
  },
  gradientBorder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  innerBorder: {
    width: "100%",
    height: "100%",
    borderRadius: 29,
    borderWidth: 2.5,
    borderColor: "#fff",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  onlineBadgeContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  onlineBadgePulse: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF6B35",
    opacity: 0.3,
    transform: [{ scale: 1.2 }],
  },
  onlineBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF6B35",
    borderWidth: 2.5,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B35",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  nameText: {
    maxWidth: 64,
  },
});
