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
    if (!user?.firstName || !user?.lastName || !user?.departmentId || !user?.neighborhoodId) {
      return "/";
    }
    return "/";
  }, [user]);

  const handleNavigation = useCallback(async () => {
    const inAuthGroup = segments[0] === "auth";

    if (isLoading) {
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/auth/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace(getTargetRoute());
    }
    // No redirigir si ya está en app - evita loops
  }, [isAuthenticated, segments, isLoading, router, getTargetRoute]);

  useEffect(() => {
    handleNavigation().catch(error => {
      console.warn("[useAuthNavigation] Error manejando navegación:", error);
    });
  }, [handleNavigation]);
}
