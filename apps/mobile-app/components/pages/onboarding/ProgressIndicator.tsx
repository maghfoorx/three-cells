import { View } from "react-native";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  return (
    <View className="flex-row justify-center items-center py-4">
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          className={`h-2 mx-1 rounded-full ${
            index < currentStep
              ? "bg-blue-600 w-8"
              : index === currentStep
                ? "bg-blue-300 w-8"
                : "bg-gray-200 w-2"
          }`}
        />
      ))}
    </View>
  );
}
