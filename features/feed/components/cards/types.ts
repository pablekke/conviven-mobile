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
  style?: StyleProp<ViewStyle>;
  photosCount?: number;
  onPhotosPress?: () => void;
};
