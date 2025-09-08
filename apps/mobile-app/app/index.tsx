import React, { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { View, Text, Animated, SafeAreaView, Platform } from "react-native";
import { useConvexAuth, useQuery } from "convex/react";
import SignInWithGoogle from "@/components/SignInWithGoogle";
import { Redirect } from "expo-router";
import SignInWithApple from "@/components/SignInWithApple";
import { api } from "@packages/backend/convex/_generated/api";
import Purchases from "react-native-purchases";
import LoadingScreen from "@/components/LoadingScreen";
import { Asset } from "expo-asset";
import { openLink } from "@/utils/openLink";

const FEATURES = [
  {
    id: 1,
    title: "Daily Journaling",
    subtitle: "Find your success pattern",
    image: require("../assets/images/analysing.png"),
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
    image: require("../assets/images/running.png"),
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
    image: require("../assets/images/meditating.png"),
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

const imagesToPrefetch = [
  require("../assets/images/terrible.png"),
  require("../assets/images/bad.png"),
  require("../assets/images/okay.png"),
  require("../assets/images/good.png"),
  require("../assets/images/amazing.png"),
];

export default function Homepage() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const [loadingData, setLoadingData] = useState(false);

  const isLoading = authLoading || loadingData;
  const user = useQuery(api.auth.viewer);

  console.log(user, "IS_USER");

  async function checkAccess() {
    try {
      setLoadingData(true);
      const customerInfo = await Purchases.getCustomerInfo();

      if (customerInfo.entitlements.active["three-cells-subscriptions"]) {
        console.log("✅ User has subscription access");
        setIsSubscribed(true);
      } else {
        console.log("❌ User does not have subscription access");
        setIsSubscribed(false);
      }
    } catch (e) {
      console.error("Error fetching customer info", e);
    } finally {
      setLoadingData(false);
    }
  }

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
    checkAccess();
  }, []);

  const navigateToOnboarding =
    !isLoading && isAuthenticated && !user?.hasCompletedOnboarding;

  const navigateToHomePage =
    !isLoading &&
    isAuthenticated &&
    isSubscribed &&
    user?.hasCompletedOnboarding;

  const navigateToSubscribePage =
    !isLoading &&
    isAuthenticated &&
    !isSubscribed &&
    user?.hasCompletedOnboarding;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (navigateToOnboarding) {
    return <Redirect href="/onboarding" />;
  } else if (navigateToHomePage) {
    return <Redirect href="/(tabs)/track" />;
  } else if (navigateToSubscribePage) {
    return <Redirect href="/subscribe" />;
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
          <View className="flex-row items-center justify-center mt-4">
            <Image
              source={require("../assets/images/icon.png")}
              contentFit="contain"
              transition={1000}
              style={{
                width: 120,
                height: 120,
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
            Finally become <Text>THAT</Text> person
          </Text>
        </Animated.View>

        {/* Feature Cards */}
        <View className="flex-1 flex-col items-center justify-center gap-4 w-full mt-6">
          {FEATURES.map((feature, index) => (
            <Animated.View
              key={feature.id}
              className="flex-row items-center rounded-md gap-8 p-4 mx-10"
              style={{
                // backgroundColor: feature.backgroundColor,
                opacity: featureAnimations[index].opacity,
                transform: [
                  { translateY: featureAnimations[index].translateY },
                ],
              }}
            >
              <View className="w-12 h-12 rounded-full items-center justify-center">
                <Image
                  source={feature.image}
                  style={{ width: 90, height: 90 }}
                  transition={300}
                />
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
          </View>
          {/* Terms Text */}
          <Text className="text-center text-gray-500 text-sm mt-6 leading-relaxed">
            <Text className="text-xs text-gray-500 text-center leading-relaxed">
              By continuing, you agree to our{" "}
              <Text
                className="underline"
                onPress={() => openLink("https://three-cells.com/terms")}
              >
                Terms of Service
              </Text>{" "}
              and{" "}
              <Text
                className="underline"
                onPress={() => openLink("https://three-cells.com/privacy")}
              >
                Privacy Policy
              </Text>
              . Cancel anytime. No commitments.
            </Text>
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
