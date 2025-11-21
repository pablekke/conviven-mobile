import type { RefObject } from "react";
import type { ScrollView, ViewStyle } from "react-native";

import type { PrimaryCardProps } from "../components/PrimaryCard";

export type CardDeckCardProps = Pick<
  PrimaryCardProps,
  "photos" | "locationStrings" | "locationWidth" | "headline" | "budget" | "basicInfo"
>;

export type CardDeckPrimaryProps = CardDeckCardProps & {
  onSwipeComplete?: (direction: "like" | "dislike") => void;
};

export type CardDeckProps = {
  screenWidth?: number;
  scrollRef: RefObject<ScrollView | null>;
  className?: string;
  style?: ViewStyle;
  primary: CardDeckPrimaryProps;
  secondary: CardDeckCardProps;
};
