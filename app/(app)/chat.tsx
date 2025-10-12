import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Spinner from "../../components/Spinner";
import { useTheme } from "../../context/ThemeContext";
import { ChatHeader, ChatList, MatchesList } from "../../features/chat/components";
import { useChats } from "../../features/chat/hooks";

// MOCK DATA - Eliminar cuando se integre con el backend
const MOCK_MATCHES = [
  {
    id: "1",
    name: "María González",
    avatar: "https://ui-avatars.com/api/?name=María+González&background=2563EB&color=fff",
  },
  {
    id: "2",
    name: "Juan Pérez",
    avatar: "https://ui-avatars.com/api/?name=Juan+Pérez&background=10B981&color=fff",
  },
  {
    id: "3",
    name: "Anto Martínez",
    avatar: "https://ui-avatars.com/api/?name=Ana+Martínez&background=F59E0B&color=fff",
  },
  {
    id: "4",
    name: "Lucas Fernández",
    avatar: "https://ui-avatars.com/api/?name=Lucas+Fernández&background=8B5CF6&color=fff",
  },
  {
    id: "5",
    name: "Sofía Rodríguez",
    avatar: "https://ui-avatars.com/api/?name=Sofía+Rodríguez&background=EC4899&color=fff",
  },
];

export default function ChatScreen() {
  const { colors } = useTheme();
  const { chats, loading } = useChats();
  const router = useRouter();

  const handleMatchPress = (matchId: string) => {
    const match = MOCK_MATCHES.find(m => m.id === matchId);
    if (match) {
      router.push({
        pathname: "/[id]",
        params: {
          id: match.id,
          name: match.name,
          avatar: match.avatar,
        },
      });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Spinner
            size={52}
            color={colors.conviven.blue}
            trackColor="rgba(37, 99, 235, 0.15)"
            thickness={5}
          />
        </View>
      ) : (
        <>
          <ChatHeader />
          <MatchesList matches={MOCK_MATCHES} onMatchPress={handleMatchPress} />
          <ChatList chats={chats} />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
