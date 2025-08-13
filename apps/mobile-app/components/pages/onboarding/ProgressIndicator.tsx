import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

interface ProgressDotProps {
  index: number;
  progress: Animated.SharedValue<number>;
}

function ProgressDot({ index, progress }: ProgressDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const isCompleted = index < progress.value;
    const isCurrent = index === Math.floor(progress.value);

    const width = interpolate(
      progress.value,
      [index - 0.5, index, index + 0.5],
      [16, 32, 16],
      "clamp",
    );

    const opacity = interpolate(
      progress.value,
      [index - 1, index, index + 1],
      [0.4, 1, 0.4],
      "clamp",
    );

    const scale = interpolate(
      progress.value,
      [index - 0.5, index, index + 0.5],
      [1, 1, 1],
      "clamp",
    );

    return {
      width: width,
      opacity: opacity,
      transform: [{ scale }],
      backgroundColor: isCompleted
        ? "#2563eb"
        : isCurrent
          ? "#60a5fa"
          : "#e5e7eb",
    };
  });

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          height: 6,
          borderRadius: 3,
        },
      ]}
    />
  );
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(currentStep, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [currentStep, progress]);

  return (
    <View className="flex-row justify-center items-center py-6">
      <View className="flex-row gap-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <ProgressDot key={index} index={index} progress={progress} />
        ))}
      </View>
    </View>
  );
}
