import { DEFAULT_LOCATION_LABELS } from "../../constants";
import { formatLabel } from "../../utils/formatters";
import { User } from "../../../../types/user";
import { LocationLabels } from "../../types";
import { useEffect, useState } from "react";

export function useProfileLocationLabels(user: User | null) {
  const [locationLabels, setLocationLabels] = useState<LocationLabels>(DEFAULT_LOCATION_LABELS);

  useEffect(() => {
    if (!user?.location) {
      setLocationLabels(DEFAULT_LOCATION_LABELS);
      return;
    }

    setLocationLabels({
      department: formatLabel(user.location.department?.name, DEFAULT_LOCATION_LABELS.department),
      city: formatLabel(user.location.city?.name, DEFAULT_LOCATION_LABELS.city),
      neighborhood: formatLabel(
        user.location.neighborhood?.name,
        DEFAULT_LOCATION_LABELS.neighborhood,
      ),
    });
  }, [user?.location]);

  return { locationLabels, setLocationLabels };
}
