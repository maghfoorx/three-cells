import { Stack } from "expo-router";

export default function HabitsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[singleHabit]" options={{ presentation: "modal" }} />
    </Stack>
  );
}
