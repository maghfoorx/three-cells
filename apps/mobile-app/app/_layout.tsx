import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Platform } from "react-native";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import * as SecureStore from "expo-secure-store";
import { ConvexReactClient } from "convex/react";
import { useEffect } from "react";
import MonitorUserLoggedInAndSubscription from "@/components/MonitorUserLoggedInAndSubscription";
import { NewDayProvider } from "@/hooks/useNewDay";

const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL as string,
);

const secureStorage = {
  getItem: async (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: any) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.ERROR);

    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: "appl_xqjpqZdQqdKCdKTTPdKUoSCkxmN" });
    } else if (Platform.OS === "android") {
      Purchases.configure({ apiKey: "" });
    }
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ConvexAuthProvider
      client={convex}
      storage={
        window.localStorage === undefined ? secureStorage : window.localStorage
      }
    >
      <NewDayProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <KeyboardProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="subscribe" options={{ headerShown: false }} />
              <Stack.Screen
                name="yearly-view"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="three-cell-log"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="create-new-task"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="create-new-habit"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="create-new-metric"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="+not-found"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="logged-out"
                options={{ headerShown: false }}
              />
            </Stack>
          </KeyboardProvider>
          <StatusBar style="auto" />
          <MonitorUserLoggedInAndSubscription />
        </ThemeProvider>
      </NewDayProvider>
    </ConvexAuthProvider>
  );
}
