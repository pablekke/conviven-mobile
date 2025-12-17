import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Roomie } from "../../types";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.95;
const CARD_HEIGHT = height * 0.75;

interface UserCardProps {
  user: Roomie;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const { name, age, budget, budgetCurrency, location, photo } = user;

  const formatBudget = () => {
    if (!budget?.min && !budget?.max) return "Budget negotiable";
    const currency = budgetCurrency || "$";
    if (budget.min && budget.max) return `${currency}${budget.min} - ${currency}${budget.max}`;
    return `${currency}${budget.min || budget.max}`;
  };

  return (
    <View style={styles.cardContainer}>
      <Image source={{ uri: photo }} style={styles.image} resizeMode="cover" />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
      >
        <View style={styles.infoContainer}>
          <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
            <View style={styles.textContainer}>
              <View style={styles.headerRow}>
                <Text style={styles.name}>
                  {name}, <Text style={styles.age}>{age}</Text>
                </Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>📍 {location || "No location preference"}</Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>💰 {formatBudget()}</Text>
              </View>
            </View>
          </BlurView>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    justifyContent: "flex-end",
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  infoContainer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  blurContainer: {
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  textContainer: {
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  age: {
    fontSize: 24,
    fontWeight: "400",
    color: "rgba(255,255,255,0.9)",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});

