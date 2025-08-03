import { Stack } from "expo-router";

export default function HabitsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="[editHabit]" options={{ presentation: "modal" }} />
    </Stack>
  );
}
