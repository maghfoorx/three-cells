import React, { useEffect, useRef } from "react";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  Animated,
  SafeAreaView,
  Pressable,
  Platform,
} from "react-native";
import { useConvexAuth, useQuery } from "convex/react";
import SignInWithGoogle from "@/components/SignInWithGoogle";
import { Redirect } from "expo-router";
import SignInWithApple from "@/components/SignInWithApple";
import { api } from "@packages/backend/convex/_generated/api";

const FEATURES = [
  {
    id: 1,
    title: "Daily Journaling",
    subtitle: "Find your success pattern",
    description: "Just 3 questions. 2 minutes daily. Life-changing insights.",
    icon: "edit-3",
    color: "#3B82F6",
    backgroundColor: "#EFF6FF",
    bullets: [
      "Identify what makes your best days great",
      "Spot patterns you never noticed before",
      "Make small changes for massive improvements",
    ],
  },
  {
    id: 2,
    title: "Habit Tracking",
    subtitle: "Build unstoppable momentum",
    description: "One click. Visual progress. Motivation that lasts.",
    icon: "target",
    color: "#10B981",
    backgroundColor: "#ECFDF5",
    bullets: [
      "Gorgeous yearly heatmaps show your progress",
      "Color-coded streaks keep you motivated",
      "Weekly insights reveal your patterns",
    ],
  },
  {
    id: 3,
    title: "Task management",
    subtitle: "Focus without overwhelm",
    description:
      "Clean. Simple. Satisfying. Everything you need, nothing you don't.",
    icon: "check-square",
    color: "#8B5CF6",
    backgroundColor: "#F5F3FF",
    bullets: [
      "Edit tasks inline - no popup windows",
      "Satisfying completion animations",
      "Keyboard shortcuts for power users",
    ],
  },
];

export default function Homepage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  const user = useQuery(api.auth.viewer);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(30)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(40)).current;

  const featureAnimations = useRef(
    FEATURES.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
    })),
  ).current;

  useEffect(() => {
    const animateIn = () => {
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(taglineOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(taglineTranslateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 400);

      // Feature cards animation
      setTimeout(() => {
        const animations = featureAnimations.map(
          ({ opacity, translateY }, index) =>
            Animated.parallel([
              Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                delay: index * 100,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
              }),
            ]),
        );

        Animated.stagger(100, animations).start();
      }, 600);

      // Buttons animation (starts after tagline)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(buttonsOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(buttonsTranslateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 800);
    };

    animateIn();
  }, []);

  if (isAuthenticated && !isLoading) {
    if (!user?.hasCompletedOnboarding) {
      return <Redirect href="/onboarding" />;
    }
    return <Redirect href="/(tabs)/track" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        {/* Logo Section */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
          className="items-center"
        >
          {/* Three Cells Logo */}
          <View className="flex-row items-center justify-center">
            <Image
              source={require("../assets/images/three-cells-logo.svg")}
              contentFit="contain"
              transition={1000}
              style={{
                width: 100,
                height: 100,
              }}
            />
          </View>
        </Animated.View>

        {/* Tagline Section */}
        <Animated.View
          style={{
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslateY }],
          }}
          className="items-center"
        >
          <Text className="text-5xl font-bold text-gray-900 text-center leading-tight">
            Habits, journaling and tasks in one place
          </Text>
        </Animated.View>

        {/* Feature Cards */}
        <View className="flex-1 flex-col gap-4 w-full mt-6">
          {FEATURES.map((feature, index) => (
            <Animated.View
              key={feature.id}
              className="flex-row items-center rounded-md gap-4 p-6 mx-6"
              style={{
                backgroundColor: feature.backgroundColor,
                opacity: featureAnimations[index].opacity,
                transform: [
                  { translateY: featureAnimations[index].translateY },
                ],
              }}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: feature.color }}
              >
                <Feather name={feature.icon as any} size={20} color="white" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 flex-1">
                {feature.subtitle}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* Login Buttons */}
        <Animated.View
          style={{
            opacity: buttonsOpacity,
            transform: [{ translateY: buttonsTranslateY }],
          }}
          className="w-full max-w-sm mt-6"
        >
          {/* Google Login Button */}
          <View className="flex gap-4">
            <View className="flex gap-4">
              <SignInWithGoogle />
              {Platform.OS === "ios" && <SignInWithApple />}
            </View>
            {/* Apple Login Button */}
            {/* <TouchableOpacity
              onPress={handleAppleLogin}
              className="w-full bg-black rounded-sm py-4 px-6 flex-row items-center gap-2 justify-center"
              activeOpacity={0.8}
            >
              <AntDesign name="apple1" size={20} color="#FFFF" />
              <Text className="text-white font-semibold text-lg">
                Continue with Apple
              </Text>
            </TouchableOpacity> */}
          </View>
          {/* Terms Text */}
          <Text className="text-center text-gray-500 text-sm mt-6 leading-relaxed">
            By continuing, you agree to our{"\n"}
            <Text className="underline">Terms of Service</Text> and{" "}
            <Text className="underline">Privacy Policy</Text>
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
