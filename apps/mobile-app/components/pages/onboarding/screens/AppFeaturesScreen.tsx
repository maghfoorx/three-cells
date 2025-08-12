import { View, Text, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

interface AppFeaturesScreenProps {
  onNext: () => void;
}

const features = [
  {
    icon: "target" as keyof typeof Feather.glyphMap,
    title: "Habit Tracking",
    description:
      "Build streaks, see your progress, and celebrate wins with our GitHub-style heatmap.",
    color: "#10b981",
  },
  {
    icon: "book-open" as keyof typeof Feather.glyphMap,
    title: "Daily Journaling",
    description:
      "Reflect on your day, track your mood, and gain insights into your patterns.",
    color: "#3b82f6",
  },
  {
    icon: "check-square" as keyof typeof Feather.glyphMap,
    title: "Smart Todos",
    description:
      "Organize your tasks and connect them to your bigger goals and habits.",
    color: "#8b5cf6",
  },
  {
    icon: "trending-up" as keyof typeof Feather.glyphMap,
    title: "Personal Metrics",
    description:
      "Track anything that matters to you - sleep, focus hours, weight, or custom metrics.",
    color: "#f59e0b",
  },
];

export default function AppFeaturesScreen({ onNext }: AppFeaturesScreenProps) {
  return (
    <OnboardingContainer backgroundColor="#f8fafc">
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={10} totalSteps={12} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-8">
            <View className="bg-blue-100 rounded-full p-8 mb-6">
              <Text className="text-6xl">🚀</Text>
            </View>

            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              Everything You Need
            </Text>

            <Text className="text-lg text-gray-600 text-center leading-relaxed">
              Three Cells brings together the most powerful tools for personal
              growth in one beautifully designed app.
            </Text>
          </View>

          <View className="flex flex-col gap-4">
            {features.map((feature, index) => (
              <View
                key={index}
                className="bg-white rounded-md border border-gray-200 p-6 shadow-sm"
              >
                <View className="flex-row items-start">
                  <View
                    className="rounded-full p-3 mr-4"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <Feather
                      name={feature.icon}
                      size={24}
                      color={feature.color}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </Text>
                    <Text className="text-gray-700 leading-relaxed">
                      {feature.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-md p-6 mt-6 border border-blue-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3 text-center">
              🎯 The Three Cells Philosophy
            </Text>
            <Text className="text-gray-700 leading-relaxed text-center">
              Small daily actions in three key areas - habits, reflection, and
              tracking - compound into extraordinary life changes over time.
            </Text>
          </View>
        </ScrollView>

        <View className="pb-8">
          <OnboardingButton
            title="Explore the App"
            onPress={onNext}
            icon="arrow-right"
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
