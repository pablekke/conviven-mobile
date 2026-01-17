import { useMemo } from "react";

interface MatchCardLayoutConfig {
  dynamicWidth: number;
  showAgeBelow: boolean;
}

export const useMatchCardLayout = (firstName: string, baseWidth: number): MatchCardLayoutConfig => {
  return useMemo(() => {
    const nameLength = firstName.length;

    let dynamicWidth = baseWidth;
    if (nameLength >= 9 && nameLength <= 12) {
      const extraPadding = (nameLength - 8) * 3;
      dynamicWidth = baseWidth + extraPadding;
    } else if (nameLength > 12) {
      dynamicWidth = baseWidth + 15;
    }

    const showAgeBelow = nameLength >= 10 && nameLength <= 12;

    return {
      dynamicWidth,
      showAgeBelow,
    };
  }, [firstName, baseWidth]);
};
