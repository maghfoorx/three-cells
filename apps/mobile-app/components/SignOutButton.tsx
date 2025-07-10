import { useAuthActions } from "@convex-dev/auth/react";
import { router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export default function SignOutButton() {
  const { signOut } = useAuthActions();
  const handleLogout = async () => {
    await signOut();
    router.navigate("/");
  };
  return (
    <TouchableOpacity
      onPress={handleLogout}
      className="w-full bg-red-500 border border-gray-200 rounded-md py-4 px-6 flex-row items-center gap-2 justify-center shadow-sm"
      activeOpacity={1}
    >
      <Text className="font-semibold text-lg text-white">Sign out</Text>
    </TouchableOpacity>
  );
}
