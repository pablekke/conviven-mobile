import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SectionHeaderProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title }) => {
  return (
    <View style={styles.sectionHeader}>
      <Feather name={icon} size={16} color="#007BFF" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    fontFamily: "Inter-Bold",
  },
});
