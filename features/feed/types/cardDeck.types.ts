import type { PrimaryCardProps } from "../components/cards/types";
import type { ScrollView, ViewStyle } from "react-native";
import type { RefObject } from "react";

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
  hideLocationChip?: boolean;
  primary: CardDeckPrimaryProps;
  secondary: CardDeckCardProps;
};
