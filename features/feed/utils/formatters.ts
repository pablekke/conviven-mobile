export function calcAge(dobISO: string, asOf = new Date()) {
  const dob = new Date(dobISO);
  let age = asOf.getFullYear() - dob.getFullYear();
  const monthDiff = asOf.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function toInt(value: unknown) {
  if (value == null) return "—";
  const numeric = typeof value === "string" ? parseFloat(value) : (value as number);
  if (Number.isNaN(numeric)) return "—";
  return String(Math.round(numeric));
}
