/* eslint-env node */
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Evita errores tipo: "Tried to register two views with the same name RNSVGRect"
// forzando a que TODAS las importaciones de react-native-svg apunten a una sola copia.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  "react-native-svg": path.resolve(__dirname, "node_modules/react-native-svg"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
