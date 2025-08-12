import { useEffect } from "react";
import { View, Text, Vibration } from "react-native";
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
        <View className="flex-1 justify-center items-center">
          {/* Success Animation */}
          <View className="items-center mb-8">
            <View className="bg-green-100 rounded-full p-12 mb-6 relative">
              <Feather name="check-circle" size={64} color="#10b981" />
              {/* Celebration elements */}
              <Text className="absolute -top-4 -left-4 text-3xl animate-bounce">
                🎉
              </Text>
              <Text className="absolute -top-4 -right-4 text-3xl animate-bounce delay-100">
                ✨
              </Text>
              <Text className="absolute -bottom-4 -left-4 text-3xl animate-bounce delay-200">
                🌟
              </Text>
              <Text className="absolute -bottom-4 -right-4 text-3xl animate-bounce delay-300">
                🎊
              </Text>
            </View>

            <Text className="text-4xl font-bold text-gray-900 text-center mb-4">
              You are All Set!
            </Text>

            <Text className="text-xl text-gray-700 text-center mb-8 leading-relaxed">
              Welcome to your personal growth journey with Three Cells. You now
              have everything you need to build lasting positive change.
            </Text>
          </View>

          <View className="space-y-4 w-full">
            <View className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
              <View className="flex-row items-center justify-center mb-4">
                <Feather name="target" size={24} color="#10b981" />
                <Text className="text-lg font-semibold text-green-800 ml-2">
                  Your First Steps
                </Text>
              </View>
              <View className="space-y-2">
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

            <View className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <Text className="text-blue-800 text-center font-medium mb-2">
                Remember: Progress, not perfection
              </Text>
              <Text className="text-blue-700 text-center text-sm">
                Small consistent actions lead to extraordinary results over
                time.
              </Text>
            </View>
          </View>
        </View>

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
