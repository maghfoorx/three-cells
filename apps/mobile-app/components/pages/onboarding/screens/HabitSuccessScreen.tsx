import { useEffect, useRef } from "react";
import {
  View,
  Text,
  Vibration,
  Animated,
  ScrollView,
  Image,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { TrophyIcon } from "react-native-heroicons/outline";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

const confettiCannons = [
  {
    autoStartDelay: 100,
  },
  {
    autoStartDelay: 500,
  },
  {
    autoStartDelay: 750,
  },
];

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

  useEffect(() => {
    // Start vibration
    Vibration.vibrate([100, 50, 100, 50, 200]);

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

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-1 flex justify-center items-center gap-8">
            <View className="w-full">
              <Image
                source={require("../../../../assets/images/habitCelebrate.png")}
                style={{
                  width: "100%",
                  height: 300, // or adjust based on your image's aspect ratio
                  objectFit: "contain",
                }}
              />
            </View>

            {/* Success Message */}
            <Animated.View
              style={{ opacity: fadeAnim }}
              className="items-center gap-4"
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

        {/* Confetti Cannons - Moved to the end so they render on top */}
        {confettiCannons.map((cannon, index) => (
          <ConfettiCannon
            key={index}
            count={80}
            origin={{ x: -10, y: 0 }}
            autoStart={true}
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
            autoStartDelay={cannon.autoStartDelay}
          />
        ))}
      </View>
    </OnboardingContainer>
  );
}
