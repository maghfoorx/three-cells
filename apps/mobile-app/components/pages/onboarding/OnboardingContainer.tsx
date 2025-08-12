import type React from "react";
import { View, SafeAreaView, StatusBar } from "react-native";

interface OnboardingContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

export default function OnboardingContainer({
  children,
  backgroundColor = "#ffffff",
}: OnboardingContainerProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}
