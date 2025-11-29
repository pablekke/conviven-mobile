import { Dimensions } from "react-native";

export const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const PRIMARY_PHOTO_SIZE = SCREEN_WIDTH * 0.85;
export const ADDITIONAL_PHOTO_SIZE = (SCREEN_WIDTH - 64 - 12) / 2; // 64 = padding, 12 = gap entre fotos
