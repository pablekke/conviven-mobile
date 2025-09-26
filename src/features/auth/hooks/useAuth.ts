import { useMemo } from "react";

import { useAppSelector } from "@/src/core/store/hooks";

export const useAuth = () => {
  const { accessToken, user } = useAppSelector((state) => state.auth);

  return useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated: Boolean(accessToken && user),
    }),
    [accessToken, user]
  );
};
