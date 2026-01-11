import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { MessageStatus } from "../enums";

export interface MessageTicksProps {
  status: MessageStatus | string;
  size?: number;
}

export const MessageTicks: React.FC<MessageTicksProps> = ({ status, size = 14 }) => {
  // Caso: Pendiente
  if (status === "pending" || status === MessageStatus.PENDING) {
    return <Feather name="clock" size={size - 2} color="rgba(255, 255, 255, 0.7)" />;
  }

  // Caso: Error
  if (status === "error" || status === MessageStatus.ERROR) {
    return <Feather name="alert-circle" size={size} color="#EF4444" />;
  }

  // Caso: Enviado (Un tick blanco)
  if (status === "sent" || status === MessageStatus.SENT) {
    return <Feather name="check" size={size} color="rgba(255, 255, 255, 0.8)" />;
  }

  // Caso: Entregado (Doble tick blanco)
  if (status === "delivered" || status === MessageStatus.DELIVERED) {
    return (
      <View style={styles.doubleCheck}>
        <Feather name="check" size={size} color="rgba(255, 255, 255, 0.8)" />
        <Feather
          name="check"
          size={size}
          color="rgba(255, 255, 255, 0.8)"
          style={styles.secondCheck}
        />
      </View>
    );
  }

  // Caso: Leído (Doble tick NARANJA HEXADECIMAL)
  if (status === "read" || status === MessageStatus.READ) {
    // Usamos el color naranja directamente por si el tema falla en iOS
    return (
      <View style={styles.doubleCheck}>
        <Feather name="check" size={size} color="#F97316" />
        <Feather name="check" size={size} color="#F97316" style={styles.secondCheck} />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  doubleCheck: {
    flexDirection: "row",
    marginLeft: -6,
  },
  secondCheck: {
    marginLeft: -8,
  },
});
