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

export function formatBudgetToThousands(value: unknown): string {
  if (value == null) return "—";
  const numeric = typeof value === "string" ? parseFloat(value) : (value as number);
  if (Number.isNaN(numeric)) return "—";

  const str = Math.floor(numeric).toString();
  const firstTwoDigits = parseInt(str.slice(0, 2), 10);
  const rounded = firstTwoDigits * 1000;

  const roundedStr = rounded.toString();
  const parts: string[] = [];
  for (let i = roundedStr.length - 3; i >= 0; i -= 3) {
    parts.unshift(roundedStr.slice(Math.max(0, i), i + 3));
  }
  if (roundedStr.length % 3 !== 0) {
    parts.unshift(roundedStr.slice(0, roundedStr.length % 3));
  }
  return parts.join(".");
}
