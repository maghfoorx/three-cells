import { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoadingScreen({
  pictureName = "loading-icon.png",
}: {
  pictureName?: string;
}) {
  const fadeAnim = useRef(new Animated.Value(1)).current; // start fully visible

  const images: Record<string, any> = {
    "loading-icon.png": require("../assets/images/loading-icon.png"),
    "todos-loading.png": require("../assets/images/todos-loading.png"),
    "habits-loading.png": require("../assets/images/habits-loading.png"),
    "tracking-page-loading.png": require("../assets/images/tracking-page-loading.png"),
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image
            source={images[pictureName]}
            contentFit="contain"
            transition={1000}
            style={{ width: 200, height: 200 }}
            className="rounded-md"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
