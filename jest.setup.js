import "@testing-library/jest-native/extend-expect";

global.jest = jest;

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
  show: jest.fn(),
}));

jest.mock("nativewind", () => ({
  withExpoSnack: () => component => component,
  styled: component => component,
}));

// Mock TurboModuleRegistry for SettingsManager used by RN Settings
jest.mock("react-native/Libraries/TurboModule/TurboModuleRegistry", () => {
  const actual = jest.requireActual("react-native/Libraries/TurboModule/TurboModuleRegistry");
  return {
    __esModule: true,
    ...actual,
    getEnforcing: name => {
      if (name === "SettingsManager") {
        return {
          getConstants: () => ({
            appSettings: {},
          }),
          get: () => null,
          setValues: () => {},
        };
      }
      if (name === "DeviceInfo") {
        return {
          getConstants: () => ({
            Dimensions: {
              window: { width: 375, height: 667, scale: 2, fontScale: 2 },
              screen: { width: 375, height: 667, scale: 2, fontScale: 2 },
            },
          }),
        };
      }
      if (name === "DevMenu") {
        return {
          show: () => {},
          dismiss: () => {},
        };
      }
      return actual.getEnforcing ? actual.getEnforcing(name) : {};
    },
  };
});

jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  return {
    ...RN,
    Alert: { alert: jest.fn() },
  };
});

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: "Link",
  Stack: jest.fn().mockImplementation(({ children }) => children),
}));

jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      apiUrl: "http://localhost:3000",
    },
  },
}));

jest.mock("../global.css", () => ({}), { virtual: true });
