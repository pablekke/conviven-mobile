import { useWindowDimensions } from "react-native";
import type { ScrollView } from "react-native";
import { useState, useCallback } from "react";
import type { RefObject } from "react";

interface UseScrollToggleParams {
  scrollRef: RefObject<ScrollView | null>;
  targetY?: number;
}

interface UseScrollToggleReturn {
  isScrolled: boolean;
  handleScrollToggle: () => void;
  handleScroll: (event: any) => void;
}

export function useScrollToggle({
  scrollRef,
  targetY,
}: UseScrollToggleParams): UseScrollToggleReturn {
  const { height: winH } = useWindowDimensions();
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollDestination = targetY || winH;

  // Manejar scroll interno
  const handleScroll = useCallback((event: any) => {
    const offsetY = event?.nativeEvent?.contentOffset?.y ?? 0;
    setIsScrolled(offsetY > 50);
  }, []);

  const handleScrollToggle = useCallback(() => {
    const scrollView = scrollRef.current;
    if (!scrollView) return;

    if (isScrolled) {
      scrollView.scrollTo({ y: 0, animated: true });
    } else {
      scrollView.scrollTo({ y: scrollDestination, animated: true });
    }
  }, [scrollRef, scrollDestination, isScrolled]);

  return {
    isScrolled,
    handleScrollToggle,
    handleScroll,
  };
}
