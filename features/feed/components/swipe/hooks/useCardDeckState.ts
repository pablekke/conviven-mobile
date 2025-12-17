import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CardDeckCardProps } from "../../../types";
import { Image as ExpoImage } from "expo-image";

const buildCardIdentity = (card: CardDeckCardProps) => {
  const firstPhoto = card.photos?.[0] ?? "";
  return `${firstPhoto}|${card.headline}|${card.budget}`;
};

export function useCardDeckState(
  primary: CardDeckCardProps,
  secondary: CardDeckCardProps,
  translationX: { value: number },
  translationY: { value: number },
) {
  const [currentPrimaryId, setCurrentPrimaryId] = useState(buildCardIdentity(primary));
  const [isSwipeLocked, setIsSwipeLocked] = useState(false);
  const swipeUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const secondaryId = useMemo(() => buildCardIdentity(secondary), [secondary]);

  useEffect(() => {
    const newId = buildCardIdentity(primary);
    if (newId !== currentPrimaryId) {
      translationX.value = 0;
      translationY.value = 0;
      setCurrentPrimaryId(newId);
    }
  }, [primary, currentPrimaryId, translationX, translationY]);

  useEffect(() => {
    return () => {
      if (swipeUnlockTimerRef.current) {
        clearTimeout(swipeUnlockTimerRef.current);
        swipeUnlockTimerRef.current = null;
      }
    };
  }, []);

  const prefetchSecondary = useCallback(() => {
    const urls = (secondary.photos ?? []).filter(Boolean);
    if (urls.length === 0) return;
    ExpoImage.prefetch(urls, { cachePolicy: "memory-disk" }).catch(() => undefined);
  }, [secondary.photos]);

  useEffect(() => {
    prefetchSecondary();
  }, [prefetchSecondary, secondaryId]);

  const unlockSwipe = () => {
    if (swipeUnlockTimerRef.current) {
      clearTimeout(swipeUnlockTimerRef.current);
    }
    swipeUnlockTimerRef.current = setTimeout(() => {
      setIsSwipeLocked(false);
      swipeUnlockTimerRef.current = null;
    }, 700);
  };

  return {
    isSwipeLocked,
    setIsSwipeLocked,
    prefetchSecondary,
    unlockSwipe,
  };
}
