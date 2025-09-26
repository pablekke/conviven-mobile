# Conviven Mobile Expo Router Starter Guide

## Overview
This guide describes how to bootstrap the Expo Router mobile client so that it mirrors the provider stack and visual language of the existing Conviven web SPA. It covers project creation, dependency setup, directory layout, theming with NativeWind, global providers, platform configuration, and post-installation tasks.

## 1. Repository Structure
Create the following directory tree to organize Expo Router routes, core logic, features, shared UI, and theming assets. Folders containing an `AGENTS.md` file inherit any scope-specific conventions.

```
conviven-mobile/
├─ app/
│  ├─ (auth)/
│  │  ├─ login.tsx
│  │  └─ register.tsx
│  ├─ (onboarding)/
│  │  ├─ index.tsx
│  │  └─ complete.tsx
│  ├─ (tabs)/
│  │  ├─ _layout.tsx
│  │  ├─ home.tsx
│  │  └─ settings.tsx
│  ├─ _layout.tsx
│  └─ +not-found.tsx
├─ App.tsx
├─ src/
│  ├─ core/
│  │  ├─ api/
│  │  │  ├─ client.ts
│  │  │  └─ queryKeys.ts
│  │  ├─ config/
│  │  │  └─ env.ts
│  │  └─ store/
│  │     ├─ index.ts
│  │     ├─ persistConfig.ts
│  │     └─ rootReducer.ts
│  ├─ providers/
│  │  ├─ AppProviders.tsx
│  │  ├─ AuthProvider.tsx
│  │  ├─ ToastProvider.tsx
│  │  └─ queryClient.ts
│  ├─ features/
│  │  ├─ auth/
│  │  │  ├─ api.ts
│  │  │  ├─ hooks.ts
│  │  │  └─ slices.ts
│  │  ├─ onboarding/
│  │  │  ├─ api.ts
│  │  │  ├─ hooks.ts
│  │  │  └─ screens/
│  │  │     ├─ OnboardingIntro.tsx
│  │  │     └─ OnboardingComplete.tsx
│  │  └─ ...
│  ├─ shared/
│  │  ├─ ui/
│  │  │  ├─ Button.tsx
│  │  │  ├─ Typography.tsx
│  │  │  └─ Toast.tsx
│  │  ├─ hooks/
│  │  │  └─ useColorScheme.ts
│  │  └─ lib/
│  │     └─ navigation.ts
│  ├─ theme/
│  │  ├─ colors.ts
│  │  ├─ fonts.ts
│  │  ├─ nativewind.config.ts
│  │  └─ tailwind.css
│  └─ utils/
│     ├─ form.ts
│     └─ validation.ts
├─ assets/
│  ├─ fonts/
│  │  ├─ Inter-Regular.ttf
│  │  ├─ Inter-Medium.ttf
│  │  ├─ Inter-SemiBold.ttf
│  │  └─ Inter-Bold.ttf
│  ├─ icon.png
│  ├─ adaptive-icon.png
│  └─ splash.png
├─ babel.config.js
├─ eas.json
├─ app.config.ts
└─ tailwind.config.js
```

Expo Router reads all files in `app/`. The top-level `app/_layout.tsx` composes the shared layout (theme, providers, navigation containers) and wraps the nested route segments, including `(auth)` and `(tabs)` groups. Feature screens consume hooks and UI components from `src/`.

## 2. Project Creation & Dependencies

```bash
# Create a new Expo TypeScript app with the router template
npx create-expo-app@latest conviven-mobile -t expo-template-blank-typescript
cd conviven-mobile

# Install navigation and gesture essentials
expo install expo-router@latest react-native-safe-area-context react-native-screens
expo install react-native-gesture-handler react-native-reanimated

# State, data fetching, forms, validation
yarn add @reduxjs/toolkit react-redux redux-persist
yarn add @tanstack/react-query
yarn add @hookform/resolvers react-hook-form zod

# Storage & secure credentials
expo install @react-native-async-storage/async-storage expo-secure-store

# NativeWind + Tailwind ecosystem
yarn add nativewind tailwindcss@^3 postcss
npx tailwindcss init -p

# Theming & fonts
expo install expo-font expo-splash-screen expo-system-ui

# Toasts (example implementation)
yarn add react-native-toast-message

# Development utilities
yarn add -D typescript @types/react @types/react-native
```

If you prefer npm, replace `yarn add` with `npm install`.

## 3. NativeWind & Tailwind Theme

### Installation Scripts
Add `"postinstall": "expo prebuild --clean --platform android,ios"` only if you maintain a custom native codebase; otherwise rely on managed workflows. To regenerate Tailwind classes during development, add `"dev": "expo start --clear"` and run `npx tailwindcss -i ./src/theme/tailwind.css -o ./src/theme/output.css --watch` in a parallel shell if you prefer CSS artifacts (NativeWind can read the config directly and does not require generated CSS).

### `tailwind.config.js`

```js
const { fontFamily } = require("tailwindcss/defaultTheme");
const nativewind = require("nativewind/tailwind/native");

module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [nativewind],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        conviven: {
          orange: "#FEC6A1",
          peach: "#FDE1D3",
          blue: "#007BFF",
        },
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        conviven: ["Inter", ...fontFamily.sans],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "fade-in-right": {
          "0%": { opacity: 0, transform: "translateX(20px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-delay-1": "fade-in 0.5s ease-out 0.1s forwards",
        "fade-in-delay-2": "fade-in 0.5s ease-out 0.2s forwards",
        "fade-in-delay-3": "fade-in 0.5s ease-out 0.3s forwards",
        "fade-in-right": "fade-in-right 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
```

### `src/theme/nativewind.config.ts`

```ts
import { createNativeWindConfig } from "nativewind";

export default createNativeWindConfig({
  darkMode: "class",
  prefix: "",
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
});
```

Use the tailwind config as the source of truth; NativeWind will consume it via Babel (configured below).

### Fonts and Color Scheme

Load fonts once in `App.tsx` using `expo-font`.

```tsx
// src/theme/fonts.ts
export const fontMap = {
  InterRegular: require("../../assets/fonts/Inter-Regular.ttf"),
  InterMedium: require("../../assets/fonts/Inter-Medium.ttf"),
  InterSemiBold: require("../../assets/fonts/Inter-SemiBold.ttf"),
  InterBold: require("../../assets/fonts/Inter-Bold.ttf"),
};
```

## 4. Global Providers & Layout

### `App.tsx`

```tsx
import "expo-router/entry";
```

`expo-router/entry` registers the router and defers rendering to `app/_layout.tsx`.

### `app/_layout.tsx`

```tsx
import "react-native-gesture-handler";
import "react-native-reanimated";
import { Slot, SplashScreen } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useColorScheme } from "nativewind";
import { AppProviders } from "../src/providers/AppProviders";
import { useFonts } from "expo-font";
import * as SystemUI from "expo-system-ui";
import { fontMap } from "../src/theme/fonts";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { colorScheme, setColorScheme } = useColorScheme();

  const [fontsLoaded] = useFonts(fontMap);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync("transparent");
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      setAppIsReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const themeValue = useMemo(
    () => ({ colorScheme, setColorScheme }),
    [colorScheme, setColorScheme]
  );

  if (!appIsReady) {
    return null;
  }

  return (
    <AppProviders themeValue={themeValue}>
      <Slot />
    </AppProviders>
  );
}
```

### `src/providers/AppProviders.tsx`

```tsx
import { PropsWithChildren, useEffect, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "nativewind";
import { AuthProvider } from "./AuthProvider";
import { store, persistor } from "../core/store";
import { queryClient } from "./queryClient";

export type AppProvidersProps = PropsWithChildren<{
  themeValue: Parameters<typeof ThemeProvider>[0]["value"];
}>;

export function AppProviders({ children, themeValue }: AppProvidersProps) {
  const [rehydrated, setRehydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = persistor.subscribe(() => {
      const { bootstrapped } = persistor.getState();
      if (bootstrapped) {
        setRehydrated(true);
        unsubscribe();
      }
    });
    persistor.persist();
    return unsubscribe;
  }, []);

  if (!rehydrated) {
    return null; // Replace with custom splash or skeleton UI if desired
  }

  return (
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={themeValue}>
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <AuthProvider>
                  {children}
                  <Toast />
                </AuthProvider>
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
```

Hydration occurs by calling `persistor.persist()` and waiting for the `bootstrapped` flag before rendering UI. Until then, return a placeholder (splash screen is still visible because `AppProviders` mounts only after fonts are ready).

## 5. Platform Configuration

### `babel.config.js`

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      "react-native-reanimated/plugin",
      ["module-resolver", {
        root: ["./"],
        alias: {
          "@app": "./app",
          "@src": "./src",
          "@core": "./src/core",
          "@providers": "./src/providers",
          "@features": "./src/features",
          "@shared": "./src/shared",
          "@theme": "./src/theme",
        },
      }],
    ],
  };
};
```

Ensure `react-native-reanimated/plugin` is the last plugin.

### `app.json` / `app.config.ts`

```ts
import { ExpoConfig } from "expo-config";

const config: ExpoConfig = {
  name: "Conviven",
  slug: "conviven-mobile",
  scheme: "conviven",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },
  updates: {
    enabled: true,
    checkAutomatically: "ON_LOAD",
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.conviven.app",
  },
  android: {
    package: "com.conviven.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
  },
  extra: {
    eas: {
      projectId: "<EAS_PROJECT_ID>",
    },
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-secure-store",
  ],
};

export default config;
```

### `eas.json`

```json
{
  "cli": {
    "version": ">= 3.18.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

OTA updates are configured through the `updates` block in `app.config.ts`. Use `eas update` to publish OTA bundles.

### Assets Preparation
- Place optimized `icon.png`, `adaptive-icon.png`, and `splash.png` in `assets/`. Use 1024x1024 for icons and 1242x2436 for the splash (or highest resolution) with transparent or solid backgrounds.
- Run `npx expo-optimize` before releasing to compress assets.

## 6. Provider Implementations (Skeleton)

```ts
// src/core/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import { rootReducer } from "./rootReducer";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```ts
// src/core/store/persistConfig.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig } from "redux-persist";
import { RootState } from "./index";

export const persistConfig: PersistConfig<RootState> = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"],
};
```

```ts
// src/providers/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

## 7. Post-Installation Checklist

- [ ] Enable Reanimated by importing `react-native-reanimated` at the top of `app/_layout.tsx` (before other imports) and adding the Babel plugin (already configured). Remember to add `"react-native-reanimated/plugin"` last.
- [ ] Wrap the app with `GestureHandlerRootView` in the layout root or create `app/_layout.tsx` with `import "react-native-gesture-handler";` at the top and wrap the layout to avoid gesture conflicts.
- [ ] Verify `SafeAreaProvider` and `GestureHandlerRootView` wrap the tree (already in `AppProviders`).
- [ ] Configure the status bar using `expo-status-bar` or `react-native-safe-area-context` to ensure the dark/light theme matches.
- [ ] Create linting and type-check scripts in `package.json` (`"lint": "eslint ."`, `"typecheck": "tsc --noEmit"`).
- [ ] Add `prettier` and `eslint` configurations consistent with the web project if desired.
- [ ] Set up environment variables using `expo-constants` or `react-native-config` (with EAS secrets) and document them.
- [ ] Validate OTA update workflow (`expo publish` or `eas update`) and native builds (`eas build -p ios|android`).
- [ ] Ensure push notification certificates and authentication tokens are stored securely.

With these steps, the Expo Router mobile client will mirror the existing SPA provider stack, maintain Tailwind aesthetics via NativeWind, and be ready for Android/iOS deployment with EAS.
