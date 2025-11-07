import { memo } from "react";
import { ScrollView, View } from "react-native";
import { Pill } from "./Pill";

type BasicInfoPillsProps = {
  items: readonly string[];
};

function BasicInfoPillsComponent({ items }: BasicInfoPillsProps) {
  if (!items.length) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 mb-8">
      <View className="flex-row">
        {items.map(item => (
          <Pill key={item}>{item}</Pill>
        ))}
      </View>
    </ScrollView>
  );
}

export const BasicInfoPills = memo(BasicInfoPillsComponent);

export default BasicInfoPills;
