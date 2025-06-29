import { useAuthActions } from "@convex-dev/auth/react";
import { Text, TouchableOpacity } from "react-native";

export default function SignOutButton() {
  const { signOut } = useAuthActions();
  const handleLogout = async () => {
    await signOut();
  };
  return (
    <TouchableOpacity
      onPress={handleLogout}
      className="w-full bg-red-500 border-2 border-gray-200 rounded-sm py-4 px-6 flex-row items-center gap-2 justify-center shadow-sm"
      activeOpacity={1}
    >
      <Text className="font-semibold text-lg text-white">Sign out</Text>
    </TouchableOpacity>
  );
}
