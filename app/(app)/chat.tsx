import { ChatHeader, ChatList, ChatSearchBar, MatchesList } from "../../features/chat/components";
import { useCachedChats, useMatches } from "../../features/chat/hooks";
import { GlassBackground } from "../../components/GlassBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import TabTransition from "../../components/TabTransition";
import { StatusBar, StyleSheet, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import Spinner from "../../components/Spinner";
import React from "react";

export default function ChatScreen() {
  const { colors, isDark } = useTheme();
  const { chats, loading: chatsLoading } = useCachedChats();
  const { matches, loading: matchesLoading } = useMatches();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  const loading = chatsLoading || matchesLoading;

  const handleMatchPress = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      router.push({
        pathname: "/(app)/conversation/[id]",
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

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle(isDark ? "dark-content" : "light-content", true);
      return () => {};
    }, [isDark]),
  );

  return (
    <>
      <TabTransition>
        <View style={styles.container}>
          <LinearGradient
            colors={["#0052D4", "#007BFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          />
          <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
                  <ChatHeader subtitle="Charlá, coordiná y fluí" />
                  <MatchesList matches={matches} onMatchPress={handleMatchPress} />
                </View>

                <View
                  className="flex-1 bg-background rounded-t-[32px]"
                  style={styles.chatsContainer}
                >
                  <GlassBackground />
                  <ChatSearchBar value={searchQuery} onChangeText={setSearchQuery} />
                  <View className="flex-1 overflow-hidden">
                    <ChatList chats={filteredChats} />
                  </View>
                </View>
              </>
            )}
          </SafeAreaView>
        </View>
      </TabTransition>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  safeArea: {
    flex: 1,
  },
  chatsContainer: {
    position: "relative",
    overflow: "hidden",
  },
});
