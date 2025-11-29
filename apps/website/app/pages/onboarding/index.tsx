import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import Step1Habit from "./components/Step1Habit";
import Step2Source from "./components/Step3Source";
import Step2Daily from "./components/Step2Daily"; // This is now Step 3
import Step4Education from "./components/Step4Education";
import Step5Payment from "./components/Step5Payment";

export default function OnboardingPage() {
  const viewer = useQuery(api.auth.viewer);
  const onboardingState = useQuery(api.webOnboarding.getOnboardingState);
  const updateStep = useMutation(api.webOnboarding.updateOnboardingStep);
  const completeOnboarding = useMutation(api.webOnboarding.completeOnboarding);

  const [step, setStep] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Sync local state with backend state on load
  useEffect(() => {
    // If user has already completed onboarding, show Step 5 (Payment)
    if (viewer?.webOnboardingCompleted) {
      setStep(5);
      return;
    }

    if (onboardingState) {
      setStep(onboardingState.currentStep);
      setFormData(onboardingState.data || {});
    } else if (onboardingState === null) {
      // No state exists yet, start at 1
      setStep(1);
    }
  }, [onboardingState, viewer?.webOnboardingCompleted]);

  const hasAccess = useMemo(() => {
    return viewer?.isSubscribed || viewer?.hasLifetimeAccess;
  }, [viewer]);

  // If user has access (paid), redirect to track page
  if (hasAccess) {
    return <Navigate to={"/track"} />;
  }

  const handleNext = async (data: any) => {
    if (step === null) return;
    const nextStep = step + 1;
    const newData = { ...formData, ...data };

    setFormData(newData);
    setStep(nextStep);

    // If we just finished Step 4, mark onboarding as complete
    if (step === 4) {
      await completeOnboarding();
    } else {
      await updateStep({
        step: nextStep,
        data: newData,
      });
    }
  };

  const handleFinish = async () => {
    // Payment step finish logic (usually handled by Stripe redirect)
    // But if they click "Get started" and it redirects, that's fine.
  };

  if (viewer === null) {
    return <Navigate to={"/login"} />;
  }

  if (step === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  const totalSteps = 5;
  // If step is 5 (Payment), show full progress or maybe hide it? 
  // Let's keep it as 5/5 for satisfaction.
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-900">
              Let's start your discipline journey
            </span>
            <span className="text-xs text-gray-500">
              Step {step} of {totalSteps}
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gray-900 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-24 pb-12">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step1Habit key="step1" onNext={handleNext} />
            )}
            {step === 2 && (
              <Step2Source key="step2" onNext={handleNext} />
            )}
            {step === 3 && (
              <Step2Daily
                key="step3"
                onNext={handleNext}
                onBack={() => { }} // Back disabled
              />
            )}
            {step === 4 && (
              <Step4Education key="step4" onNext={() => handleNext({})} />
            )}
            {step === 5 && (
              <Step5Payment
                key="step5"
                onBack={() => { }} // Back disabled
                onFinish={handleFinish}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
