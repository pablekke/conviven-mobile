import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface AvatarFallbackProps {
  name: string;
  size?: number;
}

// Función para obtener las iniciales del nombre
function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 0) return "U";

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  // Primera letra del nombre y primera letra del apellido
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Colores cool predefinidos
const COLORS = [
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Amber
  "#06B6D4", // Cyan
  "#F97316", // Orange
];

// Función para obtener un color basado en el nombre
function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function AvatarFallback({ name, size = 200 }: AvatarFallbackProps) {
  const initials = getInitials(name);
  const backgroundColor = getColorForName(name);

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontFamily: "Conviven-Bold",
    fontWeight: "bold",
  },
});
