export type ConvivenFontMap = Record<string, any>;

export const getConvivenFonts = (): ConvivenFontMap => {
  const fonts: ConvivenFontMap = {};

  try {
    // These requires will succeed only if the font files exist
    fonts.InterRegular = require("@/assets/fonts/Inter-Regular.ttf");
  } catch {}

  try {
    fonts.InterMedium = require("@/assets/fonts/Inter-Medium.ttf");
  } catch {}

  try {
    fonts.InterSemiBold = require("@/assets/fonts/Inter-SemiBold.ttf");
  } catch {}

  return fonts;
};
