import { useEffect } from "react";
import { View, Text, Vibration, Image, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";

interface CompletionScreenProps {
  onComplete: () => void;
}

export default function CompletionScreen({
  onComplete,
}: CompletionScreenProps) {
  useEffect(() => {
    // Final celebration vibration
    const celebrationPattern = [200, 100, 200, 100, 300];
    Vibration.vibrate(celebrationPattern);
  }, []);

  return (
    <OnboardingContainer backgroundColor="#f0fdf4">
      <View className="flex-1 px-6">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Success Animation */}
          <View className="items-center mb-8">
            <View className="w-full mb-4">
              <Image
                source={require("../../../../assets/images/habitCelebrate.png")}
                style={{
                  width: "100%",
                  height: 300,
                  objectFit: "contain",
                }}
              />
            </View>
            <Text className="text-4xl font-bold text-gray-900 text-center mb-4">
              You're All Set!
            </Text>
            <Text className="text-xl text-gray-700 text-center mb-8 leading-relaxed">
              Welcome to your personal growth journey with Three Cells. You now
              have everything you need to build lasting positive change.
            </Text>
          </View>

          <View className="flex gap-2 w-full">
            <View className="bg-white rounded-md p-6 shadow-lg border-2 border-green-200">
              <View className="flex-row items-center justify-center mb-4">
                <Feather name="target" size={24} color="#10b981" />
                <Text className="text-lg font-semibold text-green-800 ml-2">
                  Your First Steps
                </Text>
              </View>
              <View className="flex gap-1">
                <Text className="text-green-700">
                  • Complete your first habit today
                </Text>
                <Text className="text-green-700">
                  • Write your first journal entry
                </Text>
                <Text className="text-green-700">
                  • Add a personal metric to track
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="pb-8">
          <OnboardingButton
            title="Start My Journey"
            onPress={onComplete}
            icon="play"
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
