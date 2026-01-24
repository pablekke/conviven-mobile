import { ScrollView, TextInput, Platform } from "react-native";
import { useRef, useCallback } from "react";

interface UseKeyboardScrollReturn {
  scrollViewRef: React.RefObject<ScrollView | null>;
  handleInputFocus: (inputRef: TextInput | null, extraOffset?: number) => void;
}

export const useKeyboardScroll = (): UseKeyboardScrollReturn => {
  const scrollViewRef = useRef<ScrollView | null>(null);

  const handleInputFocus = useCallback((inputRef: TextInput | null, extraOffset = 0) => {
    if (!inputRef || !scrollViewRef.current) return;

    setTimeout(
      () => {
        inputRef.measureLayout(
          scrollViewRef.current as unknown as number,
          (_x, y, _width, height) => {
            const scrollOffset = y - 100 + height + extraOffset;
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, scrollOffset),
              animated: true,
            });
          },
          () => {},
        );
      },
      Platform.OS === "android" ? 300 : 100,
    );
  }, []);

  return {
    scrollViewRef,
    handleInputFocus,
  };
};
