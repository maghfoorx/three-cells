import SignInWithGoogle from "@/components/SignInWithGoogle";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Redirect, router } from "expo-router";
import { Pressable, SafeAreaView, Text, View } from "react-native";

export default function TestLoggedOutPage() {
  const user = useQuery(api.auth.viewer);

  const isLoading = user === undefined;
  const isAuthenticated = user !== null;

  if (!isAuthenticated && !isLoading) {
    return <Redirect href={"/"} />;
  }
  return (
    <SafeAreaView>
      <View className="flex gap-4">
        <View className="flex gap-4">
          <SignInWithGoogle />
        </View>
        <View>
          <Pressable onPress={() => router.replace("/")}>
            <Text>Go to home page</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
