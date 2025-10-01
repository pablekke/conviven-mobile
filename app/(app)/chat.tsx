import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../context/ThemeContext";

const CHAT_PREVIEWS = [
  {
    id: "1",
    name: "Sofía",
    lastMessage: "¿Te va brunch el domingo?",
    time: "2m",
    unread: 2,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "2",
    name: "Andrés",
    lastMessage: "Te mando fotos del depa en la tarde",
    time: "15m",
    unread: 0,
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "3",
    name: "Mariana",
    lastMessage: "¡Amo que también tengas gatos!",
    time: "1h",
    unread: 1,
    avatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "4",
    name: "Leo",
    lastMessage: "Si quieres hacemos videollamada",
    time: "2h",
    unread: 0,
    avatar:
      "https://images.unsplash.com/photo-1485206412256-701ccc5b93ca?auto=format&fit=crop&w=400&q=80",
  },
];

export default function ChatScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View className="px-6 pt-4 pb-2">
        <Text className="text-xs uppercase tracking-[3px] text-muted-foreground font-conviven">
          Mensajes
        </Text>
        <Text className="text-3xl font-conviven-bold text-foreground mt-1">Conecta y coordina</Text>
        <Text className="text-sm font-conviven text-muted-foreground mt-3">
          Mantén la vibra chill, agenda visitas y construye confianza con tus próximos roomies.
        </Text>
      </View>

      <FlatList
        data={CHAT_PREVIEWS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            className="flex-row items-center gap-4 px-4 py-4 rounded-2xl border"
            style={{
              backgroundColor: colors.card,
              borderColor: item.unread ? colors.conviven.blue : colors.border,
            }}
          >
            <Image source={{ uri: item.avatar }} className="w-14 h-14 rounded-full" />
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-conviven-semibold text-foreground">
                  {item.name}
                </Text>
                <Text className="text-xs font-conviven text-muted-foreground">{item.time}</Text>
              </View>
              <Text className="text-sm font-conviven text-muted-foreground mt-1" numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            {item.unread > 0 ? (
              <View
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.conviven.blue }}
              >
                <Text className="text-xs font-conviven-semibold text-white">{item.unread}</Text>
              </View>
            ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
});
