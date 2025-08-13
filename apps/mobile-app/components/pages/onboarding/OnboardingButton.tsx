import { Text, ActivityIndicator, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  icon?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  disabled?: boolean;
}

export default function OnboardingButton({
  title,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
}: OnboardingButtonProps) {
  const isPrimary = variant === "primary";
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    });
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        className={`rounded-md p-4 flex-row justify-center items-center ${
          isPrimary ? "bg-blue-600" : "bg-gray-100 border border-gray-300"
        } ${disabled || loading ? "opacity-50" : ""}`}
      >
        {loading ? (
          <ActivityIndicator color={isPrimary ? "white" : "#374151"} />
        ) : (
          <>
            {icon && (
              <Feather
                name={icon}
                size={20}
                color={isPrimary ? "white" : "#374151"}
                style={{ marginRight: 8 }}
              />
            )}
            <Text
              className={`font-semibold text-base ${isPrimary ? "text-white" : "text-gray-700"}`}
            >
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
