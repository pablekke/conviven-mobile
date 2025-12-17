import { memo } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { Pill } from "./Pill";

type BasicInfoPillsProps = {
  items: readonly string[];
};

function BasicInfoPillsComponent({ items }: BasicInfoPillsProps) {
  if (!items.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      <View style={styles.row}>
        {items.map((item, index) => (
          <Pill key={`${item}-${index}`}>{item}</Pill>
        ))}
      </View>
    </ScrollView>
  );
}

export const BasicInfoPills = memo(BasicInfoPillsComponent);

export default BasicInfoPills;

const styles = StyleSheet.create({
  scroll: {
    marginTop: 8,
    marginBottom: 24,
  },
  content: {
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
  },
});

