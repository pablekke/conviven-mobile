export const Flag = (name: string) => {
  const k = name.toLowerCase();
  if (/(español|spanish)/.test(k)) return "🇪🇸";
  if (/inglés|english/.test(k)) return "🇬🇧";
  if (/portugu(és|ese)/.test(k)) return "🇵🇹";
  if (/franc(és|h)/.test(k)) return "🇫🇷";
  if (/alem(án|an)/.test(k)) return "🇩🇪";
  if (/ital(iano|ian)/.test(k)) return "🇮🇹";
  return "🏳️";
};
