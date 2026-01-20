import { useAuth } from "../../../../../context/AuthContext";
import { useCallback } from "react";

export const useLocationLogic = (
  draftLocation: {
    neighborhoodId: string | null;
    cityId: string | null;
    departmentId: string | null;
  } | null,
  setDraftLocation: (location: any) => void,
) => {
  const { user } = useAuth();

  const getLocationLabel = useCallback(() => {
    if (draftLocation?.neighborhoodId) {
      const {
        getCachedNeighborhood,
      } = require("../../filters/neighborhoods/services/neighborhoodsService");
      const n = getCachedNeighborhood(draftLocation.neighborhoodId);
      if (n?.name) return n.name;
    }

    const loc = user?.location;
    if (loc?.neighborhood?.name) return loc.neighborhood.name;
    if (loc?.city?.name) return loc.city.name;
    if (loc?.department?.name) return loc.department.name;

    return "Seleccionar";
  }, [user, draftLocation]);

  const handleLocationConfirm = useCallback(
    (selectedIds: string[], mainNeighborhoodId?: string | null) => {
      if (!user || !mainNeighborhoodId) return;

      const {
        getCachedNeighborhood,
      } = require("../../filters/neighborhoods/services/neighborhoodsService");
      const neighborhood = getCachedNeighborhood(mainNeighborhoodId);

      let cityId: string | null = null;
      let departmentId: string | null = null;

      if (neighborhood) {
        cityId = neighborhood.cityId || null;
        departmentId = neighborhood.departmentId || null;
      }

      if (!cityId && user.location?.city?.id) {
        cityId = user.location.city.id;
      }
      if (!departmentId && user.location?.department?.id) {
        departmentId = user.location.department.id;
      }

      setDraftLocation({
        neighborhoodId: mainNeighborhoodId,
        cityId,
        departmentId,
      });
    },
    [user, setDraftLocation],
  );

  const calculateAge = useCallback((): number | null => {
    if (!user?.birthDate) return null;
    try {
      const birth = new Date(user.birthDate);
      if (isNaN(birth.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age >= 0 ? age : null;
    } catch {
      return null;
    }
  }, [user?.birthDate]);

  return {
    getLocationLabel,
    handleLocationConfirm,
    calculateAge,
  };
};
