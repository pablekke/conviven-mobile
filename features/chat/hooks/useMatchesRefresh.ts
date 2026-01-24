import { useCallback, useState } from "react";

export const useMatchesRefresh = () => {
  const [matchesRefreshTrigger, setMatchesRefreshTrigger] = useState(0);

  const triggerMatchesRefresh = useCallback(() => {
    setMatchesRefreshTrigger(prev => prev + 1);
  }, []);

  return { matchesRefreshTrigger, triggerMatchesRefresh };
};
