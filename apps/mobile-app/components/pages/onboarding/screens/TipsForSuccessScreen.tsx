import { View, Text, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

interface TipsForSuccessScreenProps {
  onNext: () => void;
}

const tips = [
  {
    icon: "sunrise" as keyof typeof Feather.glyphMap,
    title: "Start Your Day Right",
    description:
      "Check in with Three Cells each morning. Review your habits, set intentions, and plan your day.",
    color: "#f59e0b",
  },
  {
    icon: "calendar" as keyof typeof Feather.glyphMap,
    title: "Consistency Over Perfection",
    description:
      "Missing one day won't break your progress. What matters is getting back on track quickly.",
    color: "#10b981",
  },
  {
    icon: "heart" as keyof typeof Feather.glyphMap,
    title: "Be Kind to Yourself",
    description:
      "Celebrate small wins and learn from setbacks. Self-compassion is key to lasting change.",
    color: "#ef4444",
  },
  {
    icon: "users" as keyof typeof Feather.glyphMap,
    title: "Share Your Journey",
    description:
      "Tell friends and family about your goals. Social accountability increases success rates by 65%.",
    color: "#8b5cf6",
  },
];

export default function TipsForSuccessScreen({
  onNext,
}: TipsForSuccessScreenProps) {
  return (
    <OnboardingContainer backgroundColor="#fffbeb">
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={11} totalSteps={12} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-8">
            <View className="bg-yellow-100 rounded-full p-8 mb-6">
              <Text className="text-6xl">💡</Text>
            </View>

            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              Tips for Success
            </Text>

            <Text className="text-lg text-gray-600 text-center leading-relaxed">
              Here are some science-backed strategies to help you make the most
              of your Three Cells journey.
            </Text>
          </View>

          <View className="flex gap-2">
            {tips.map((tip, index) => (
              <View
                key={index}
                className="bg-white rounded-md p-6 shadow-sm border border-gray-200"
              >
                <View className="flex-row items-start">
                  <View
                    className="rounded-full p-3 mr-4"
                    style={{ backgroundColor: `${tip.color}20` }}
                  >
                    <Feather name={tip.icon} size={24} color={tip.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-2">
                      {tip.title}
                    </Text>
                    <Text className="text-gray-700 leading-relaxed">
                      {tip.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View className="bg-blue-50 rounded-xl p-6 mt-6 border border-blue-200">
            <Text className="text-lg font-semibold text-blue-900 mb-3 text-center">
              📚 Recommended Reading
            </Text>
            <Text className="text-blue-800 text-center leading-relaxed">
              "Atomic Habits" by James Clear • "The Power of Now" by Eckhart
              Tolle • "Mindset" by Carol Dweck
            </Text>
          </View>
        </ScrollView>

        <View className="pb-8">
          <OnboardingButton
            title="Almost Done!"
            onPress={onNext}
            icon="arrow-right"
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
