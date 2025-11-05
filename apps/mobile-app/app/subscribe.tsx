import { useState, useEffect } from "react";
import { router } from "expo-router";
import { View, Text, ScrollView, Alert, Pressable } from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
} from "react-native-purchases";
import OnboardingContainer from "@/components/pages/onboarding/OnboardingContainer";
import OnboardingButton from "@/components/pages/onboarding/OnboardingButton";
import LoadingScreen from "@/components/LoadingScreen";
import { openLink } from "@/utils/openLink";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import ShinyBadge from "@/components/pages/subscribe/ShinyBadge";

type ProductIdentifier =
  | "com.threecells.weekly"
  | "com.threecells.weekly.notrial"
  | "com.threecells.lifetime"
  | "com.threecells.yearly.new";

export default function PricingScreen({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [selectedPackage, setSelectedPackage] = useState<string>("yearly");
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);

  const user = useQuery(api.auth.viewer);
  const updateUserSubscription = useMutation(api.revenuecat.addSusbscription);

  useEffect(() => {
    loadOfferings();
  }, []);

  useEffect(() => {
    if (user?._id != null) {
      if (user?.isSubscribed || user?.hasLifetimeAccess) {
        router.replace("/");
      }
    }
  }, [user]);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const offerings = await Purchases.getOfferings();
      setOfferings(offerings);
    } catch (error) {
      console.error("Error loading offerings:", JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!offerings?.current || user?._id == null) return;

    setProcessingPayment(true);
    try {
      await Purchases.logIn(user._id);
      let packageToPurchase;

      if (selectedPackage === "yearly") {
        packageToPurchase = offerings.current.annual;
      } else if (selectedPackage === "lifetime") {
        packageToPurchase = offerings.current.lifetime;
      } else {
        // Weekly without trial
        packageToPurchase = offerings.current.availablePackages.find(
          (pkg) => pkg.identifier === "weekly_notrial",
        );
      }

      if (!packageToPurchase) {
        Alert.alert("Error", "Selected package not available");
        return;
      }

      const { customerInfo } =
        await Purchases.purchasePackage(packageToPurchase);

      const entitlement =
        customerInfo.entitlements.active["three-cells-subscriptions"];

      const productIdentifier =
        entitlement.productIdentifier as ProductIdentifier;

      console.log(productIdentifier, "PRODUCT_IDENTIFIER");

      const result = await updateUserSubscription({
        productId: productIdentifier as any,
        expiresAt: entitlement.expirationDateMillis,
      });

      if (result?.isSubscribed || result?.hasLifetimeAccess) {
        router.replace("/");
      }
    } catch (error: any) {
      console.log(JSON.stringify(error, null, 2), "PURCHASE_ERROR");
      if (error.userCancelled) {
        return;
      }
      Alert.alert("Error", "Failed to complete purchase. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const getButtonText = () => {
    if (processingPayment) return "Unlocking...";
    if (selectedPackage === "lifetime") return "Get Lifetime Access 🙌";
    if (selectedPackage === "yearly") return "Start Free Trial 🙌";
    return "Start Weekly Plan 🙌";
  };

  const getTrustLine = () => {
    if (selectedPackage === "yearly") {
      return "No payment today • Free for 7 days • Cancel anytime";
    }
    return "No commitment. Cancel anytime.";
  };

  const yearlyPackage = offerings?.current?.annual as PurchasesPackage;
  const weeklyPackage = offerings?.current?.availablePackages.find(
    (pkg) => pkg.identifier === "weekly_notrial",
  );
  const lifetimePackage = offerings?.current?.lifetime;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <OnboardingContainer backgroundColor="#fafafa">
      <View className="flex-1">
        {/* Scrollable Content */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Header - Non-scrolling hero */}
          <View className="items-center mb-8 mt-4">
            <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
              Finally build your best life
            </Text>
            <Text className="text-base text-gray-600 text-center leading-relaxed mb-2">
              The only app that will help you achieve your goals
            </Text>

            {/* Social Proof */}
            <View className="bg-white rounded-md p-4 border border-gray-200">
              <View className="flex-row gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesome
                    key={star}
                    name="star"
                    size={14}
                    color="#fbbf24"
                    fill="#fbbf24"
                  />
                ))}
              </View>
              <Text className="text-sm text-gray-700 italic mb-2">
                "I've tried everything. This is the first app that's minimal and
                has everything I need. I actually use it every day. Within 30
                days I consistently started working out. Journaling has also
                helped see what I do on my best days. The app is very simple,
                clean and does not spam me with notifications."
              </Text>
              <Text className="text-xs text-gray-500">
                — Mags, Software Engineer
              </Text>
            </View>
          </View>

          {/* Pricing Options */}
          <View className="">
            {/* Annual Option - Default Selected */}
            <Pressable
              onPress={() => setSelectedPackage("yearly")}
              className={`mb-3 rounded-md border-2 ${
                selectedPackage === "yearly"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <View className="p-4 relative">
                {/* Save Badge */}
                <View className="absolute -top-3 right-4 ">
                  <ShinyBadge />
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900 mb-1">
                      Annual Plan
                    </Text>
                    <Text className="text-sm text-green-600 font-semibold mb-2">
                      7-day free trial included
                    </Text>
                    <View className="flex-row items-baseline">
                      <Text className="text-gray-900">
                        {yearlyPackage?.product.pricePerYearString} / year
                      </Text>
                    </View>
                  </View>
                  <View
                    className={`w-7 h-7 rounded-full border-2 ${
                      selectedPackage === "yearly"
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300"
                    } items-center justify-center`}
                  >
                    {selectedPackage === "yearly" && (
                      <Feather name="check" size={12} color="white" />
                    )}
                  </View>
                </View>
              </View>
            </Pressable>

            {/* Weekly Option */}
            <Pressable
              onPress={() => setSelectedPackage("weekly")}
              className={`mb-3 rounded-md border-2 ${
                selectedPackage === "weekly"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <View className="p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900 mb-1">
                      Weekly Plan
                    </Text>
                    <Text className="text-gray-900">
                      {/* Prefer RevenueCat provided week string (already localized) */}
                      {weeklyPackage?.product.pricePerWeekString} / week
                    </Text>
                  </View>
                  <View
                    className={`w-7 h-7 rounded-full border-2 ${
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
            </Pressable>

            {/* Lifetime Option */}
            <Pressable
              onPress={() => setSelectedPackage("lifetime")}
              className={`mb-3 rounded-md border-2 ${
                selectedPackage === "lifetime"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <View className="p-4 relative">
                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900 mb-1">
                      Lifetime Access
                    </Text>
                    <Text className="text-gray-900">
                      {lifetimePackage?.product.priceString} one-time payment
                    </Text>
                  </View>
                  <View
                    className={`w-7 h-7 rounded-full border-2 ${
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
            </Pressable>
          </View>
        </ScrollView>

        {/* Fixed Footer with CTA */}
        <View className="px-6 pt-4 bg-white border-t border-gray-200">
          {/* Billing Info */}
          {/*<Text className="text-sm text-gray-600 text-center mb-3 font-medium">
            {getBillingText()}
          </Text>*/}

          {/* CTA Button */}
          <OnboardingButton
            title={getButtonText()}
            onPress={handlePurchase}
            disabled={processingPayment || loading || user == null}
          />

          {/* Trust Line */}
          <Text className="text-sm font-bold text-gray-700 text-center mt-3 mb-3">
            {getTrustLine()}
          </Text>

          {/* Terms */}
          <Text className="text-xs text-gray-500 text-center leading-relaxed">
            By continuing, you agree to our{" "}
            <Text
              className="underline"
              onPress={() => openLink("https://three-cells.com/terms")}
            >
              Terms
            </Text>{" "}
            and{" "}
            <Text
              className="underline"
              onPress={() => openLink("https://three-cells.com/privacy")}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </OnboardingContainer>
  );
}
