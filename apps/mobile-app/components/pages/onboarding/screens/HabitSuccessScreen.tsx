import { useEffect, useRef, useState } from "react";
import { View, Text, Vibration, Animated, ScrollView } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { CheckCircleIcon, SparklesIcon } from "react-native-heroicons/solid";
import { TrophyIcon } from "react-native-heroicons/outline";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

interface HabitSuccessScreenProps {
  onNext: () => void;
  habitName: string;
}

export default function HabitSuccessScreen({
  onNext,
  habitName,
}: HabitSuccessScreenProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<ConfettiCannon | null>(null);

  useEffect(() => {
    // Start vibration
    Vibration.vibrate([100, 50, 100, 50, 200]);

    // Fire single confetti burst
    setTimeout(() => {
      confettiRef.current?.start();
    }, 100);

    // Start UI animations
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);
  }, [scaleAnim, fadeAnim]);

  return (
    <OnboardingContainer>
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={8} totalSteps={12} />

        {/* Single Confetti Burst */}
        <ConfettiCannon
          ref={confettiRef}
          count={80}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          fadeOut={true}
          colors={[
            "#10B981",
            "#34D399",
            "#6EE7B7",
            "#FFD700",
            "#FFA500",
            "#FF69B4",
          ]}
          explosionSpeed={350}
          fallSpeed={2000}
        />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-1 flex justify-center items-center gap-8">
            {/* Animated Success Icon */}
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
              }}
              className="items-center"
            >
              <View className="relative items-center justify-center">
                {/* Outer glow rings */}
                <View className="absolute inset-0 bg-green-200 rounded-full opacity-30 scale-150" />
                <View className="absolute inset-0 bg-green-300 rounded-full opacity-20 scale-125" />

                {/* Main icon container */}
                <View className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-8 shadow-2xl shadow-green-300">
                  <CheckCircleIcon width={72} height={72} color="white" />
                </View>

                {/* Floating sparkles */}
                <View className="absolute -top-4 -left-4">
                  <SparklesIcon width={24} height={24} color="#10B981" />
                </View>
                <View className="absolute -top-4 -right-4">
                  <SparklesIcon width={24} height={24} color="#34D399" />
                </View>
                <View className="absolute -bottom-4 -left-4">
                  <SparklesIcon width={24} height={24} color="#6EE7B7" />
                </View>
                <View className="absolute -bottom-4 -right-4">
                  <SparklesIcon width={24} height={24} color="#A7F3D0" />
                </View>
              </View>
            </Animated.View>

            {/* Success Message */}
            <Animated.View
              style={{ opacity: fadeAnim }}
              className="items-center gap-6"
            >
              <View className="items-center gap-4">
                <Text className="text-4xl font-bold text-gray-900 text-center">
                  Congratulations! 🎉
                </Text>

                <Text className="text-xl text-gray-700 text-center leading-relaxed max-w-sm">
                  You've just created your first habit. This is where your
                  transformation begins!
                </Text>
              </View>

              {/* Habit Card */}
              <View className="bg-white/90 backdrop-blur-sm rounded-md p-6 shadow-2xl shadow-green-200 border-2 border-green-200 max-w-sm">
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="bg-green-100 rounded-full p-2">
                    <TrophyIcon width={24} height={24} color="#10B981" />
                  </View>
                  <Text className="text-lg font-semibold text-green-800">
                    Your New Habit
                  </Text>
                </View>

                <Text className="text-base font-medium text-gray-800 text-center italic">
                  "{habitName}"
                </Text>
              </View>
            </Animated.View>

            {/* Success Stats Card */}
            <Animated.View
              style={{ opacity: fadeAnim }}
              className="w-full max-w-sm"
            >
              <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-md p-6 border border-green-200/50 shadow-lg">
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="bg-green-100 rounded-full p-2">
                    <CheckCircleIcon width={20} height={20} color="#059669" />
                  </View>
                  <Text className="text-lg font-semibold text-green-800">
                    You're Already Winning!
                  </Text>
                </View>

                <Text className="text-green-700 leading-relaxed mb-4">
                  Research shows that simply committing to a habit increases
                  your success rate by 65%. You've already taken the hardest
                  step.
                </Text>

                <View className="bg-white/60 rounded-md p-4">
                  <Text className="text-sm text-gray-600 text-center italic font-medium">
                    "A journey of a thousand miles begins with a single step."
                  </Text>
                  <Text className="text-xs text-gray-500 text-center mt-2">
                    — Lao Tzu
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </ScrollView>

        {/* CTA Button */}
        <View className="pb-8 px-2">
          <OnboardingButton
            title="Continue My Journey"
            onPress={onNext}
            icon="arrow-right"
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
