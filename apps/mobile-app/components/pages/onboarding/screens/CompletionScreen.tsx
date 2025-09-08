import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Purchases, { PurchasesOfferings } from "react-native-purchases";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import { router } from "expo-router";
import LoadingScreen from "@/components/LoadingScreen";

interface PricingScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export default function PricingScreen({
  onComplete,
  onSkip,
}: PricingScreenProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>("weekly");
  const [freeTrialEnabled, setFreeTrialEnabled] = useState<boolean>(true);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [accessLoading, setAccessLoading] = useState<boolean>(false);

  useEffect(() => {
    loadOfferings();
    checkAccess();
  }, []);

  async function checkAccess() {
    try {
      setAccessLoading(true);
      const customerInfo = await Purchases.getCustomerInfo();

      if (customerInfo.entitlements.active["three-cells-subscriptions"]) {
        console.log("✅ User has subscription access");
        router.replace("/(tabs)/track");
      }
    } catch (e) {
      console.error("Error fetching customer info", e);
    } finally {
      setAccessLoading(false);
    }
  }

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      setOfferings(offerings);
    } catch (error) {
      console.error("Error loading offerings:", error);
    }
  };

  const handlePurchase = async () => {
    if (!offerings?.current) return;

    setLoading(true);
    try {
      let packageToPurchase;

      if (selectedPackage === "lifetime") {
        packageToPurchase = offerings.current.lifetime;
      } else {
        // For weekly, choose based on free trial toggle
        if (freeTrialEnabled) {
          packageToPurchase = offerings.current.weekly; // Has intro price/trial
        } else {
          // Find the weekly_notrial package from availablePackages
          packageToPurchase = offerings.current.availablePackages.find(
            (pkg) => pkg.identifier === "weekly_notrial",
          );
        }
      }

      if (!packageToPurchase) {
        Alert.alert("Error", "Selected package not available");
        return;
      }

      const { customerInfo } =
        await Purchases.purchasePackage(packageToPurchase);

      if (customerInfo.entitlements.active["pro"]) {
        onComplete();
      }
    } catch (error: any) {
      if (error.userCancelled) {
        // User cancelled, no need to show error
        return;
      }
      Alert.alert("Error", "Failed to complete purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (selectedPackage === "lifetime") {
      return "Get Lifetime Access";
    }
    return freeTrialEnabled ? "Try 3 Days Free" : "Start Weekly Plan";
  };

  // Get the appropriate weekly package based on trial toggle
  const getWeeklyPackage = () => {
    if (!offerings?.current) return null;

    if (freeTrialEnabled) {
      return offerings.current.weekly; // Has intro price
    } else {
      return offerings.current.availablePackages.find(
        (pkg) => pkg.identifier === "weekly_notrial",
      );
    }
  };

  const weeklyPackage = getWeeklyPackage();
  const lifetimePackage = offerings?.current?.lifetime;

  if (accessLoading) {
    return <LoadingScreen />;
  }

  return (
    <OnboardingContainer backgroundColor="#fafafa">
      <View className="flex-1 px-6">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="items-center mb-8 mt-4">
            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              Unlock Your Full Potential
            </Text>
            <Text className="text-lg text-gray-600 text-center leading-relaxed">
              Get access to all premium features and supercharge your personal
              growth
            </Text>
          </View>

          {/* Pricing Options */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-gray-900 mb-4">
              Choose Your Plan
            </Text>

            {/* Lifetime Option */}
            <TouchableOpacity
              onPress={() => setSelectedPackage("lifetime")}
              className={`mb-4 rounded-md border-2 ${
                selectedPackage === "lifetime"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <View className="p-5 relative">
                {/* Best Value Badge */}
                <View className="absolute -top-2 left-4 bg-orange-500 px-3 py-1 rounded-full">
                  <Text className="text-xs font-bold text-white">
                    BEST VALUE
                  </Text>
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">
                      Lifetime Access
                    </Text>
                    <Text className="text-sm text-gray-600 mb-2">
                      One-time payment
                    </Text>
                    <Text className="text-2xl font-bold text-gray-900">
                      {lifetimePackage?.product.priceString || "$29.99"}
                    </Text>
                  </View>
                  <View
                    className={`w-6 h-6 rounded-md border-2 ${
                      selectedPackage === "lifetime"
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300"
                    } items-center justify-center`}
                  >
                    {selectedPackage === "lifetime" && (
                      <Feather name="check" size={12} color="white" />
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Weekly Option */}
            <TouchableOpacity
              onPress={() => setSelectedPackage("weekly")}
              className={`mb-4 rounded-md border-2 ${
                selectedPackage === "weekly"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <View className="p-5 relative">
                {/* Short Term Badge */}
                <View className="absolute -top-2 left-4 bg-blue-500 px-3 py-1 rounded-full">
                  <Text className="text-xs font-bold text-white">
                    SHORT TERM
                  </Text>
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">
                      {freeTrialEnabled ? "3-Day Trial" : "Weekly Plan"}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-2">
                      {freeTrialEnabled
                        ? `then ${weeklyPackage?.product.priceString || "$2.99"} per week`
                        : `${weeklyPackage?.product.priceString || "$2.99"} per week`}
                    </Text>
                    <Text className="text-2xl font-bold text-gray-900">
                      {freeTrialEnabled
                        ? "Free"
                        : weeklyPackage?.product.priceString || "$2.99"}
                    </Text>
                  </View>
                  <View
                    className={`w-6 h-6 rounded-md border-2 ${
                      selectedPackage === "weekly"
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300"
                    } items-center justify-center`}
                  >
                    {selectedPackage === "weekly" && (
                      <Feather name="check" size={12} color="white" />
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Free Trial Toggle - Only show for weekly */}
            {selectedPackage === "weekly" && (
              <View className="bg-gray-50 rounded-md p-4 mb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-sm font-semibold text-gray-900">
                      Free Trial
                    </Text>
                    <Text className="text-xs text-gray-600">
                      {freeTrialEnabled
                        ? "Start with 3 days free, then continue with weekly billing"
                        : "Start immediately with weekly billing"}
                    </Text>
                  </View>
                  <Switch
                    value={freeTrialEnabled}
                    onValueChange={setFreeTrialEnabled}
                    trackColor={{ false: "#d1d5db", true: "#10b981" }}
                    thumbColor={freeTrialEnabled ? "#ffffff" : "#ffffff"}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Terms and Privacy */}
          <View className="mb-6">
            <Text className="text-xs text-gray-500 text-center leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy
              Policy. Cancel anytime. No commitments.
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="pb-8">
          <OnboardingButton
            title={getButtonText()}
            onPress={handlePurchase}
            icon="unlock"
            disabled={loading}
          />

          {onSkip && (
            <TouchableOpacity onPress={onSkip} className="mt-4">
              <Text className="text-center text-gray-600 font-medium">
                Continue with Free Version
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </OnboardingContainer>
  );
}
