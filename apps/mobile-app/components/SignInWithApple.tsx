import { useAuthActions } from "@convex-dev/auth/react";
import { AntDesign } from "@expo/vector-icons";
import { makeRedirectUri } from "expo-auth-session";
import { openAuthSessionAsync } from "expo-web-browser";
import { Platform, Text, TouchableOpacity } from "react-native";
import { useConvexAuth } from "convex/react";

const redirectTo = makeRedirectUri();

export default function SignInWithApple() {
  const { isAuthenticated } = useConvexAuth();

  const { signIn } = useAuthActions();
  const handleSignIn = async () => {
    if (!isAuthenticated) {
      const { redirect } = await signIn("apple", { redirectTo });
      if (Platform.OS === "web") {
        return;
      }
      const result = await openAuthSessionAsync(redirect!.toString());
      if (result.type === "success") {
        const { url } = result;
        const code = new URL(url).searchParams.get("code")!;
        await signIn("apple", { code });
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSignIn}
      className="w-full border-2 border-gray-200 rounded-sm py-4 px-6 flex-row items-center gap-2 justify-center shadow-sm"
      activeOpacity={0.8}
    >
      <AntDesign name="apple" size={24} />
      <Text className="font-semibold text-lg">Continue with Apple</Text>
    </TouchableOpacity>
  );
}
