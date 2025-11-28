import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, View } from "react-native";

interface ChatSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const ChatSearchBar: React.FC<ChatSearchBarProps> = ({ value, onChangeText }) => {
  return (
    <View className="px-6 py-2">
      <View className="flex-row items-center bg-white border border-gray-200 rounded-full px-4 h-12 shadow-sm">
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          className="flex-1 ml-3 text-base font-conviven text-foreground"
          placeholder="Buscar compañero"
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
};
