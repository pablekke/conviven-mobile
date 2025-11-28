import { useRouter } from "expo-router";

import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Spinner from "../../components/Spinner";
import TabTransition from "../../components/TabTransition";
import { useTheme } from "../../context/ThemeContext";
import { ChatHeader, ChatList, ChatSearchBar, MatchesList } from "../../features/chat/components";
import { useCachedChats } from "../../features/chat/hooks";

// MOCK DATA - Eliminar cuando se integre con el backend
const MOCK_MATCHES = [
  {
    id: "1",
    name: "María González",
    avatar: "https://ui-avatars.com/api/?name=María+González&background=2563EB&color=fff",
    age: 24,
  },
  {
    id: "2",
    name: "Juan Pérez",
    avatar: "https://ui-avatars.com/api/?name=Juan+Pérez&background=10B981&color=fff",
    age: 26,
  },
  {
    id: "3",
    name: "Anto Martínez",
    avatar: "https://ui-avatars.com/api/?name=Ana+Martínez&background=F59E0B&color=fff",
    age: 23,
  },
  {
    id: "4",
    name: "Lucas Fernández",
    avatar: "https://ui-avatars.com/api/?name=Lucas+Fernández&background=8B5CF6&color=fff",
    age: 27,
  },
  {
    id: "5",
    name: "Sofía Rodríguez",
    avatar: "https://ui-avatars.com/api/?name=Sofía+Rodríguez&background=EC4899&color=fff",
    age: 25,
  },
];

export default function ChatScreen() {
  const { colors } = useTheme();
  const { chats, loading } = useCachedChats();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleMatchPress = (matchId: string) => {
    const match = MOCK_MATCHES.find(m => m.id === matchId);
    if (match) {
      router.push({
        pathname: "/conversation/[id]",
        params: {
          id: match.id,
          name: match.name,
          avatar: match.avatar,
        },
      });
    }
  };

  const filteredChats = React.useMemo(() => {
    if (!searchQuery) return chats;
    const query = searchQuery.toLowerCase();
    return chats.filter(chat => chat.name.toLowerCase().includes(query));
  }, [chats, searchQuery]);

  return (
    <TabTransition>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.conviven.blue }]}
        edges={["top"]}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center bg-background">
            <Spinner
              size={52}
              color={colors.conviven.blue}
              trackColor="rgba(37, 99, 235, 0.15)"
              thickness={5}
            />
          </View>
        ) : (
          <>
            <View className="pb-2">
              <ChatHeader />
              <MatchesList matches={MOCK_MATCHES} onMatchPress={handleMatchPress} />
            </View>

            <View className="flex-1 bg-background rounded-t-[32px] overflow-hidden">
              <ChatSearchBar value={searchQuery} onChangeText={setSearchQuery} />
              <ChatList chats={filteredChats} />
            </View>
          </>
        )}
      </SafeAreaView>
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
