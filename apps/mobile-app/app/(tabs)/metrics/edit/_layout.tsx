import { Stack } from "expo-router";

export default function HabitsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="[editMetric]" options={{ presentation: "modal" }} />
    </Stack>
  );
}
