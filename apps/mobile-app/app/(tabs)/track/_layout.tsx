import { Stack } from "expo-router";

export default function TrackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* <Stack.Screen name="index" /> */}
      <Stack.Screen name="[date]" />
    </Stack>
  );
}
