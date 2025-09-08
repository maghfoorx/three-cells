import { useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

interface PersonalMotivationScreenProps {
  onNext: (motivation: string) => void;
}

export default function PersonalMotivationScreen({
  onNext,
}: PersonalMotivationScreenProps) {
  const [motivation, setMotivation] = useState("");

  const handleNext = () => {
    onNext(motivation);
  };

  return (
    <OnboardingContainer backgroundColor="#fefce8">
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={4} totalSteps={12} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center my-8">
            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              What Drives You?
            </Text>

            <Text className="text-lg text-gray-600 text-center leading-relaxed">
              Understanding your "why" is crucial for lasting change. Research
              shows that intrinsic motivation is 3x more powerful than external
              rewards.
            </Text>
          </View>

          <View className="bg-white rounded-md border border-gray-200 p-6 shadow-sm mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Complete this sentence:
            </Text>
            <Text className="text-base text-gray-700 mb-4">
              "I want to build better habits because..."
            </Text>

            <TextInput
              className="border border-gray-300 rounded-md p-4 text-base min-h-[120px] bg-gray-50"
              placeholder="I want to feel more confident, have more energy, be a better role model for my family..."
              multiline
              textAlignVertical="top"
              value={motivation}
              onChangeText={setMotivation}
              autoFocus
            />
          </View>

          <View className="bg-blue-50 rounded-md p-6 border border-blue-200">
            <Text className="text-sm text-blue-800 font-medium mb-2">
              💡 Pro Tip
            </Text>
            <Text className="text-sm text-blue-700">
              The more specific and personal your reason, the stronger your
              motivation will be during challenging moments. This becomes your
              North Star.
            </Text>
          </View>
        </ScrollView>

        <View className="pb-8">
          <OnboardingButton
            title="Continue"
            onPress={handleNext}
            icon="arrow-right"
            disabled={motivation.trim().length < 10}
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
