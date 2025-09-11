import { useState, useRef } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SlideInRight,
  SlideOutLeft,
  Easing,
} from "react-native-reanimated";
import ScienceOfHabitsScreen from "@/components/pages/onboarding/screens/ScienceOfHabitsScreen";
import PowerOfJournalingScreen from "@/components/pages/onboarding/screens/PowerOfJournalingScreen";
import TrackingMetricsScreen from "@/components/pages/onboarding/screens/TrackingMetricsScreen";
import PersonalMotivationScreen from "@/components/pages/onboarding/screens/PersonalMotivationScreen";
import HabitCategoriesScreen from "@/components/pages/onboarding/screens/HabitCategoriesScreen";
import FirstHabitIntroScreen from "@/components/pages/onboarding/screens/FirstHabitIntroScreen";
import CreateHabitScreen from "@/components/pages/onboarding/screens/CreateHabitScreen";
import HabitSuccessScreen from "@/components/pages/onboarding/screens/HabitSuccessScreen";
import NotificationPermissionScreen from "@/components/pages/onboarding/screens/NotificationPermissionScreen";
import AppFeaturesScreen from "@/components/pages/onboarding/screens/AppFeaturesScreen";
import TipsForSuccessScreen from "@/components/pages/onboarding/screens/TipsForSuccessScreen";
import CompletionScreen from "./subscribe";
import WelcomeScreen from "@/components/pages/onboarding/screens/WelcomeScreen";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Doc } from "@packages/backend/convex/_generated/dataModel";

export default function OnboardingFlow() {
  const user = useQuery(api.auth.viewer) as Doc<"users">;
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    motivation: "",
    selectedCategories: [] as string[],
    habitData: null as any,
  });

  const completeUserOnboarding = useMutation(api.auth.completeUserOnboarding);

  const onComplete = async () => {};

  const isTransitioning = useSharedValue(false);

  const nextStep = () => {
    if (isTransitioning.value) return;

    isTransitioning.value = true;

    setCurrentStep((prev) => prev + 1);

    setTimeout(() => {
      isTransitioning.value = false;
    }, 300);
  };

  const handleMotivationNext = (motivation: string) => {
    setOnboardingData((prev) => ({ ...prev, motivation }));
    nextStep();
  };

  const handleCategoriesNext = (categories: string[]) => {
    setOnboardingData((prev) => ({ ...prev, selectedCategories: categories }));
    nextStep();
  };

  const handleHabitCreated = (habitData: any) => {
    setOnboardingData((prev) => ({ ...prev, habitData }));
    nextStep();
  };

  const screens = [
    <WelcomeScreen key="welcome" onNext={nextStep} user={user} />,
    <ScienceOfHabitsScreen key="science" onNext={nextStep} />,
    <PowerOfJournalingScreen key="journaling" onNext={nextStep} />,
    <TrackingMetricsScreen key="tracking" onNext={nextStep} />,
    <PersonalMotivationScreen key="motivation" onNext={handleMotivationNext} />,
    <HabitCategoriesScreen key="categories" onNext={handleCategoriesNext} />,
    <FirstHabitIntroScreen key="habit-intro" onNext={nextStep} />,
    <CreateHabitScreen key="create-habit" onNext={handleHabitCreated} />,
    <HabitSuccessScreen
      key="habit-success"
      onNext={nextStep}
      habitName={onboardingData.habitData?.name || "Your New Habit"}
    />,
    <NotificationPermissionScreen key="notifications" onNext={nextStep} />,
    <AppFeaturesScreen key="features" onNext={nextStep} />,
    <TipsForSuccessScreen
      key="tips"
      onNext={async () => {
        console.log("Tips for success screen COMPLETING ONBOARDING");
        await completeUserOnboarding({
          motivationReason: onboardingData.motivation,
          selectedCategories: onboardingData.selectedCategories,
        });
        nextStep();
      }}
    />,
    <CompletionScreen key="completion" onComplete={onComplete} />,
  ];

  const currentScreen = screens[currentStep];

  if (!currentScreen) {
    return screens[0];
  }

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        key={`screen-${currentStep}`}
        entering={SlideInRight.duration(400).easing(Easing.out(Easing.ease))}
        exiting={SlideOutLeft.duration(300).easing(Easing.out(Easing.ease))}
        style={{ flex: 1 }}
      >
        {currentScreen}
      </Animated.View>
    </View>
  );
}
