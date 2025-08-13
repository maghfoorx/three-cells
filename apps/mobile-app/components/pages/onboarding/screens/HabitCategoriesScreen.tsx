import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

interface HabitCategoriesScreenProps {
  onNext: (categories: string[]) => void;
}

const habitCategories = [
  {
    id: "health",
    name: "Health & Fitness",
    emoji: "💪",
    description: "Exercise, nutrition, sleep",
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    emoji: "🧘",
    description: "Meditation, breathing, presence",
  },
  {
    id: "learning",
    name: "Learning",
    emoji: "📚",
    description: "Reading, courses, skills",
  },
  {
    id: "creativity",
    name: "Creativity",
    emoji: "🎨",
    description: "Writing, art, music",
  },
  {
    id: "relationships",
    name: "Relationships",
    emoji: "❤️",
    description: "Family, friends, networking",
  },
  {
    id: "productivity",
    name: "Productivity",
    emoji: "⚡",
    description: "Focus, organization, goals",
  },
  {
    id: "finance",
    name: "Finance",
    emoji: "💰",
    description: "Saving, investing, budgeting",
  },
  {
    id: "environment",
    name: "Environment",
    emoji: "🏠",
    description: "Cleaning, organizing, decluttering",
  },
];

export default function HabitCategoriesScreen({
  onNext,
}: HabitCategoriesScreenProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleNext = () => {
    onNext(selectedCategories);
  };

  return (
    <OnboardingContainer backgroundColor="#faf5ff">
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={5} totalSteps={12} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center my-8">
            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              What Matters Most?
            </Text>

            <Text className="text-lg text-gray-600 text-center leading-relaxed">
              Select the areas where you would like to build better habits.
              Don't worry - you can always add more later!
            </Text>
          </View>

          <View className="flex gap-2">
            {habitCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => toggleCategory(category.id)}
                className={`bg-white rounded-xl p-4 border-2 ${
                  selectedCategories.includes(category.id)
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-3xl mr-4">{category.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">
                      {category.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {category.description}
                    </Text>
                  </View>
                  {selectedCategories.includes(category.id) && (
                    <View className="bg-purple-500 rounded-full w-6 h-6 items-center justify-center">
                      <Text className="text-white text-xs font-bold">✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View className="pb-8">
          <OnboardingButton
            title={`Continue with ${selectedCategories.length} ${selectedCategories.length === 1 ? "category" : "categories"}`}
            onPress={handleNext}
            icon="arrow-right"
            disabled={selectedCategories.length === 0}
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
