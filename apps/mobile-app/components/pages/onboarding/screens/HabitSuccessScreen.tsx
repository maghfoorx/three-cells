import { useEffect, useRef } from "react";
import InAppReview from "react-native-in-app-review";
import {
  View,
  Text,
  Vibration,
  Animated,
  ScrollView,
  Image,
} from "react-native";
import LottieView from "lottie-react-native";
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
  const confettiRef = useRef<LottieView>(null);

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

      // Play confetti
      confettiRef.current?.play();

      // ask for app review
      if (InAppReview.isAvailable()) {
        InAppReview.RequestInAppReview()
          .then((hasFlowFinishedSuccessfully) => {
            console.log(
              "In-app review flow completed:",
              hasFlowFinishedSuccessfully,
            );
          })
          .catch((error) => {
            console.warn("In-app review error:", error);
          });
      }
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
                  height: 300,
                  resizeMode: "contain",
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

        <View className="pb-8 px-2 z-40">
          <OnboardingButton
            title="Continue My Journey"
            onPress={onNext}
            icon="arrow-right"
          />
        </View>

        <LottieView
          ref={confettiRef}
          source={require("../../../../assets/animations/Confetti.json")}
          autoPlay={false}
          loop={false}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
          }}
        />
      </View>
    </OnboardingContainer>
  );
}
