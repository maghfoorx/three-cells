import { useState } from "react";
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
import CompletionScreen from "@/components/pages/onboarding/screens/CompletionScreen";
import WelcomeScreen from "@/components/pages/onboarding/screens/WelcomeScreen";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const user = useQuery(api.auth.viewer);
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    motivation: "",
    selectedCategories: [] as string[],
    habitData: null as any,
  });

  const nextStep = () => setCurrentStep((prev) => prev + 1);

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
    <TipsForSuccessScreen key="tips" onNext={nextStep} />,
    <CompletionScreen key="completion" onComplete={onComplete} />,
  ];

  return screens[currentStep] || screens[0];
}
