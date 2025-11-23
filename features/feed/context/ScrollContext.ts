import { createContext, RefObject } from "react";
import { ScrollView } from "react-native";

export const FeedScrollContext = createContext<RefObject<ScrollView | null> | null>(null);
