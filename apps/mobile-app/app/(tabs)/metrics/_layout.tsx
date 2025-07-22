import { Stack } from "expo-router";

export default function MetricsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[singleMetric]" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="add-metric-entry"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}
