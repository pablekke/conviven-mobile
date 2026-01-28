import { useState, useEffect, useCallback, useRef } from "react";
import type { DeckCardSnapshot } from "./useProfileDeck";
import { ScrollView } from "react-native";

export interface UseFeedUIStateParams {
  primaryCard: DeckCardSnapshot;
}

export interface UseFeedUIStateReturn {
  locationOpen: boolean;
  activeLocationIndex: number;
  galleryVisible: boolean;
  mainRef: React.RefObject<ScrollView | null>;
  scrollToTop: (animated?: boolean) => void;
  setLocationOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  setActiveLocationIndex: (value: number) => void;
  setGalleryVisible: (value: boolean) => void;
}

export function useFeedUIState({ primaryCard }: UseFeedUIStateParams): UseFeedUIStateReturn {
  const [locationOpen, setLocationOpen] = useState(false);
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const mainRef = useRef<ScrollView | null>(null);

  const scrollToTop = useCallback((animated = true) => {
    const scrollView = mainRef.current;
    if (!scrollView) return;
    scrollView.scrollTo({
      y: 0,
      animated,
    });
  }, []);

  // Reset location state when primary card changes
  useEffect(() => {
    setActiveLocationIndex(0);
    setLocationOpen(false);
  }, [primaryCard.headline]);

  return {
    locationOpen,
    activeLocationIndex,
    galleryVisible,
    mainRef,
    scrollToTop,
    setLocationOpen,
    setActiveLocationIndex,
    setGalleryVisible,
  };
}
