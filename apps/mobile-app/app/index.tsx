import React, { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GoogleIcon from "@/components/GoogleIcon";

const { width, height } = Dimensions.get("window");

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
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(30)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(40)).current;
  const featureAnimations = FEATURES.map(() => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20),
  }));

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
                duration: 500,
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

  const handleGoogleLogin = () => {
    // Implement Google login logic
    console.log("Google login pressed");
  };

  const handleAppleLogin = () => {
    // Implement Apple login logic
    console.log("Apple login pressed");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

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
          <Text className="text-4xl font-bold text-gray-900 text-center leading-tight">
            Habits, journaling and tasks in one place
          </Text>
        </Animated.View>

        {/* Feature Cards */}
        <Animated.View className="flex-1 flex-col gap-4 w-full mt-6">
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
        </Animated.View>

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
            <TouchableOpacity
              onPress={handleGoogleLogin}
              className="w-full bg-primary-foreground border-2 border-gray-200 rounded-sm py-4 px-6 flex-row items-center gap-2 justify-center shadow-sm"
              activeOpacity={0.8}
            >
              <GoogleIcon size={20} />
              <Text className="font-semibold text-lg">
                Continue with Google
              </Text>
            </TouchableOpacity>

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
