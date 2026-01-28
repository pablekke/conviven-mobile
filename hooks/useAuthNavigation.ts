import { useCallback, useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../context/AuthContext";

/**
 * Hook para manejar la navegación basada en el estado de autenticación
 */
export function useAuthNavigation() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const getTargetRoute = useCallback(() => {
    const hasLocation =
      Boolean(user?.location?.department?.id) &&
      Boolean(user?.location?.city?.id) &&
      Boolean(user?.location?.neighborhood?.id);
    if (!user?.firstName || !user?.lastName || !hasLocation) {
      return "/";
    }
    return "/";
  }, [user]);

  const handleNavigation = useCallback(async () => {
    const inAuthGroup = segments[0] === "auth";

    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace("/auth/login");
      }
      return;
    }

    // Authenticated user checks
    const hasFilters = user?.filters && Object.keys(user.filters).length > 0;

    if (!hasFilters) {
      const isAtStep1 = segments[0] === "onboarding" && segments[1] === "step1";
      if (!isAtStep1) {
        router.replace("/onboarding/step1");
      }
      return;
    }

    if (inAuthGroup) {
      router.replace(getTargetRoute());
    }
  }, [isAuthenticated, segments, isLoading, router, getTargetRoute, user]);

  useEffect(() => {
    handleNavigation().catch(error => {
      console.warn("[useAuthNavigation] Error manejando navegación:", error);
    });
  }, [handleNavigation]);
}
