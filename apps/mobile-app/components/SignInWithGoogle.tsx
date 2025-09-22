import { useAuthActions } from "@convex-dev/auth/react";
import { makeRedirectUri } from "expo-auth-session";
import { openAuthSessionAsync } from "expo-web-browser";
import { Platform, Text, TouchableOpacity } from "react-native";
import GoogleIcon from "./GoogleIcon";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

const redirectTo = makeRedirectUri();

export default function SignInWithGoogle() {
  const user = useQuery(api.auth.viewer);

  const { signIn } = useAuthActions();
  const handleSignIn = async () => {
    if (user !== undefined && user === null) {
      console.log("Sign in With Google Pressed");
      const { redirect } = await signIn("google", { redirectTo });
      if (Platform.OS === "web") {
        return;
      }
      const result = await openAuthSessionAsync(redirect!.toString());
      if (result.type === "success") {
        const { url } = result;
        const code = new URL(url).searchParams.get("code")!;
        await signIn("google", { code });
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSignIn}
      className="w-full border-2 border-gray-200 rounded-sm py-4 px-6 flex-row items-center gap-2 justify-center shadow-sm"
      activeOpacity={0.8}
    >
      <GoogleIcon size={20} />
      <Text className="font-semibold text-lg">Continue with Google</Text>
    </TouchableOpacity>
  );
}
