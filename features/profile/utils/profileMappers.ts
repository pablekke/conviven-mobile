export const findOptionLabel = (
  value: string,
  options: { value: string; label: string }[],
): string => {
  const option = options.find(opt => opt.value === value);
  return option?.label ?? "";
};

export const mapFormToBackendValue = (formValue: string | undefined): string => {
  return formValue ?? "";
};

export const mapPets = (petsOwned: string[] | undefined): string => {
  if (!petsOwned || petsOwned.length === 0) return "none";
  return petsOwned[0];
};
