interface LocationData {
  department?: { name?: string } | null;
  city?: { name?: string } | null;
  neighborhood?: { name?: string } | null;
  departmentName?: string | null;
  cityName?: string | null;
  neighborhoodName?: string | null;
}

function isMontevideo(location: LocationData): boolean {
  const departmentName =
    location.department?.name?.toLowerCase().trim() ||
    location.departmentName?.toLowerCase().trim() ||
    "";
  return departmentName === "montevideo";
}
export function formatLocationForOtherZones(location: LocationData): string {
  const neighborhoodName =
    location.neighborhood?.name?.trim() || location.neighborhoodName?.trim() || "";
  const cityName = location.city?.name?.trim() || location.cityName?.trim() || "";

  if (isMontevideo(location)) {
    return neighborhoodName || "";
  }

  if (cityName && neighborhoodName) {
    return `${cityName}, ${neighborhoodName}`;
  }
  if (neighborhoodName) {
    return neighborhoodName;
  }
  return "";
}

export function formatLocationForPreferences(location: LocationData): string {
  const neighborhoodName =
    location.neighborhood?.name?.trim() || location.neighborhoodName?.trim() || "";
  const cityName = location.city?.name?.trim() || location.cityName?.trim() || "";
  const departmentName = location.department?.name?.trim() || location.departmentName?.trim() || "";

  if (isMontevideo(location)) {
    if (departmentName && neighborhoodName) {
      return `${departmentName} · ${neighborhoodName}`;
    }
    if (neighborhoodName) {
      return neighborhoodName;
    }
  }

  const parts: string[] = [];
  if (departmentName) parts.push(departmentName);
  if (cityName) parts.push(cityName);
  if (neighborhoodName) parts.push(neighborhoodName);

  return parts.join(" · ") || "";
}
