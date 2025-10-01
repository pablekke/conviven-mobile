import React, { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../context/ThemeContext";

type Roomie = {
  id: string;
  name: string;
  age: number;
  profession: string;
  bio: string;
  interests: string[];
  matchScore: number;
  photo: string;
};

const ROOMIES: Roomie[] = [
  {
    id: "1",
    name: "Sofía",
    age: 26,
    profession: "Product Designer",
    bio: "Amante del café, el arte y los espacios luminosos. Busco roomie responsable y chill.",
    interests: ["Yoga", "Plantitas", "Brunch"],
    matchScore: 93,
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "2",
    name: "Andrés",
    age: 28,
    profession: "Software Engineer",
    bio: "Me encantan las bicis, cocinar pastas y mantener la casa en orden. Fan del home office.",
    interests: ["Cocina", "Cycling", "Series"],
    matchScore: 88,
    photo:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "3",
    name: "Mariana",
    age: 24,
    profession: "Community Manager",
    bio: "Siempre ando buscando conciertos y plan de fin de semana. Amo los gatos y la decoración minimalista.",
    interests: ["Gatos", "Conciertos", "Minimal"],
    matchScore: 91,
    photo:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeRoomie = useMemo(() => ROOMIES[currentIndex % ROOMIES.length], [currentIndex]);
  const nextRoomie = useMemo(() => ROOMIES[(currentIndex + 1) % ROOMIES.length], [currentIndex]);

  const handleChoice = () => {
    setCurrentIndex(prev => (prev + 1) % ROOMIES.length);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View className="px-6 pt-4 pb-2 flex-1">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-xs uppercase tracking-[3px] text-muted-foreground font-conviven">
              Explora roomies
            </Text>
            <Text className="text-3xl font-conviven-bold text-foreground mt-1">
              Descubre a tu match
            </Text>
          </View>
          <View
            className="rounded-full items-center justify-center"
            style={[styles.sparkIcon, { backgroundColor: `${colors.conviven.blue}15` }]}
          >
            <Ionicons name="sparkles-outline" size={22} color={colors.conviven.blue} />
          </View>
        </View>

        <View className="flex-row justify-end mb-5">
          <View
            className="flex-row items-center gap-2 px-3 py-1 rounded-full"
            style={{ backgroundColor: `${colors.conviven.blue}15` }}
          >
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.conviven.blue }}
            />
            <Text
              className="text-xs font-conviven-semibold"
              style={{ color: colors.conviven.blue }}
            >
              {activeRoomie.matchScore}% afinidad
            </Text>
          </View>
        </View>

        <View className="flex-1 justify-center">
          <View className="relative">
            <View
              className="absolute left-4 right-4 top-4 rounded-3xl border"
              style={[
                styles.nextCard,
                {
                  borderColor: `${colors.border}70`,
                  backgroundColor: colors.card,
                  transform: [{ scale: 0.96 }],
                },
              ]}
            >
              <View className="flex-1 items-center justify-center px-6">
                <Text className="font-conviven-semibold text-muted-foreground">
                  Próximo match: {nextRoomie.name}
                </Text>
              </View>
            </View>

            <View
              className="rounded-3xl overflow-hidden border"
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Image
                source={{ uri: activeRoomie.photo }}
                className="w-full h-72"
                resizeMode="cover"
              />

              <View className="p-5 gap-3">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-2xl font-conviven-bold text-foreground">
                      {activeRoomie.name}, {activeRoomie.age}
                    </Text>
                    <Text className="text-sm text-muted-foreground font-conviven">
                      {activeRoomie.profession}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-[10px] font-conviven text-muted-foreground uppercase tracking-wide">
                      match score
                    </Text>
                    <Text
                      className="text-xl font-conviven-semibold"
                      style={{ color: colors.conviven.blue }}
                    >
                      {activeRoomie.matchScore}%
                    </Text>
                  </View>
                </View>

                <Text className="text-base text-foreground font-conviven leading-5">
                  {activeRoomie.bio}
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  {activeRoomie.interests.map(interest => (
                    <View
                      key={interest}
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${colors.conviven.blue}12` }}
                    >
                      <Text
                        className="text-xs font-conviven-semibold"
                        style={{ color: colors.conviven.blue }}
                      >
                        #{interest}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-8 mb-6">
          <Pressable
            accessibilityRole="button"
            onPress={handleChoice}
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.muted }}
          >
            <Ionicons name="close" size={28} color={colors.mutedForeground} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleChoice}
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.conviven.blue }}
          >
            <Ionicons name="heart" size={32} color={colors.primaryForeground} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleChoice}
            className="w-16 h-16 rounded-full items-center justify-center"
            style={[
              styles.outlineAction,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons name="star" size={26} color={colors.conviven.orange} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  sparkIcon: {
    width: 46,
    height: 46,
  },
  nextCard: {
    height: 380,
  },
  card: {
    height: 420,
  },
  outlineAction: {
    borderWidth: 1,
  },
});
