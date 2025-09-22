import { useAuthActions } from "@convex-dev/auth/react";
import { router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export default function SignOutButton() {
  const { signOut } = useAuthActions();

  const handleLogout = async () => {
    await signOut();
    router.replace("/logged-out");
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      className="w-full border border-gray-200 rounded-md py-4 px-6 flex-row items-center gap-2 justify-center shadow-sm"
      activeOpacity={1}
    >
      <Text className="font-semibold text-red-500">Sign out</Text>
    </TouchableOpacity>
  );
}
