import { Match } from "../types/chat.types";

/**
 * Mocks de matches - Personas con las que hiciste match
 * Pueden tener o no conversación abierta (se marca automáticamente en getMatches)
 * Los matches con ID que coinciden con conversaciones ya tienen chat abierto
 */
export const mockMatches: Match[] = [
  // Matches con conversación existente (aparecen en ChatList)
  {
    id: "user-federico",
    name: "Federico",
    avatar: "https://i.pravatar.cc/300?img=12",
    age: 28,
  },
  {
    id: "user-fernanda",
    name: "Fernanda",
    avatar: "https://i.pravatar.cc/300?img=47",
    age: 26,
  },
  {
    id: "user-agustin",
    name: "Agustin",
    avatar: "https://i.pravatar.cc/300?img=33",
    age: 25,
  },
  // Matches sin conversación (solo aparecen en MatchesList con indicador amarillo)
  {
    id: "user-maria",
    name: "María González",
    avatar: "https://i.pravatar.cc/300?img=20",
    age: 24,
  },
  {
    id: "user-juan",
    name: "Juan Pérez",
    avatar: "https://i.pravatar.cc/300?img=15",
    age: 26,
  },
  {
    id: "user-anto",
    name: "Anto Martínez",
    avatar: "https://i.pravatar.cc/300?img=25",
    age: 23,
  },
  {
    id: "user-lucas",
    name: "Lucas Fernández",
    avatar: "https://i.pravatar.cc/300?img=18",
    age: 27,
  },
  {
    id: "user-sofia",
    name: "Sofía Rodríguez",
    avatar: "https://i.pravatar.cc/300?img=29",
    age: 25,
  },
];
