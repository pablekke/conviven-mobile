import { StyleProp, TextStyle, ViewStyle } from "react-native";

export type PrimaryCardProps = {
  photos: string[];
  locationStrings: string[];
  locationWidth?: number;
  headline: string;
  budget: string;
  basicInfo: readonly string[];
  blurOverlayStyle?: StyleProp<ViewStyle>;
  enableLocationToggle?: boolean;
  hideLocationChip?: boolean;
  showScrollCue?: boolean;
  locationChipStyle?: StyleProp<ViewStyle>;
  locationChipTextStyle?: StyleProp<TextStyle>;
  headlineStyle?: TextStyle;
  budgetStyle?: TextStyle;
  infoWrapperStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};
