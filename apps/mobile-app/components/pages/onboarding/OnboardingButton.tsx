import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";

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

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-xl p-4 flex-row justify-center items-center ${
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
    </TouchableOpacity>
  );
}
