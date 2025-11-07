import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "../../../context/ThemeContext";
import { MessageStatus } from "../enums";

export interface MessageTicksProps {
  status: MessageStatus;
  size?: number;
}

export const MessageTicks: React.FC<MessageTicksProps> = ({ status, size = 14 }) => {
  const { colors } = useTheme();

  if (status === MessageStatus.SENT) {
    return <Feather name="check" size={size} color={colors.mutedForeground} />;
  }

  if (status === MessageStatus.DELIVERED) {
    return (
      <View style={styles.doubleCheck}>
        <Feather name="check" size={size} color={colors.mutedForeground} />
        <Feather name="check" size={size} color={colors.mutedForeground} />
      </View>
    );
  }

  if (status === MessageStatus.READ) {
    return (
      <View style={styles.doubleCheck}>
        <Feather name="check" size={size} color={colors.conviven.blue} />
        <Feather name="check" size={size} color={colors.conviven.blue} />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  doubleCheck: {
    flexDirection: "row",
    marginLeft: -4,
  },
});
