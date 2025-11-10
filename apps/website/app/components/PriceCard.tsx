import React, { useState, useRef } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useAction, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

const PricingCard = ({ login = false }: { login?: boolean }) => {
  const stripePrices = useQuery(api.stripe.getPrices);
  console.log(stripePrices, "ARE_STRIPE_PRICES");
  const [selectedPlan, setSelectedPlan] = useState<
    "monthly" | "yearly" | "lifetime"
  >("yearly");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [paymentUrlLoading, setPaymentUrlLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  // Format price from cents to currency
  const formatPrice = (amount: number) => {
    const price = amount / 100;
    return `£${price.toFixed(2)}`;
  };

  // Calculate monthly price if paid monthly for comparison
  const getMonthlyEquivalent = () => {
    if (!stripePrices?.monthly || !stripePrices?.yearly) return null;
    const monthlyPrice = stripePrices.monthly.amount / 100;
    const yearlyPrice = stripePrices.yearly.amount / 100;
    const monthlyIfPaidMonthly = monthlyPrice * 12;
    return `£${monthlyIfPaidMonthly.toFixed(2)}`;
  };

  const plans = {
    monthly: {
      price: stripePrices?.monthly
        ? formatPrice(stripePrices.monthly.amount)
        : null,
      period: "per month",
      save: null,
      description: "Cancel anytime",
      oldPrice: null,
    },
    yearly: {
      price: stripePrices?.yearly
        ? formatPrice(stripePrices.yearly.amount)
        : null,
      period: "per year",
      save: "Popular",
      description: "Best value",
      oldPrice: getMonthlyEquivalent(),
    },
    lifetime: {
      price: stripePrices?.lifetime
        ? formatPrice(stripePrices.lifetime.amount)
        : null,
      period: "one-time",
      save: null,
      description: "Pay once, yours forever",
      oldPrice: null,
    },
  };

  const benefits = [
    "Daily journaling to find your success pattern",
    "One-tap habit tracking with heatmaps",
    "Clean, distraction-free task management",
    "Beautiful all-in-one interface",
  ];

  const payAndSendMessage = useAction(api.stripe.pay);
  async function handlePurchase() {
    setPaymentUrlLoading(true);
    const paymentUrl = await payAndSendMessage({ product: selectedPlan });
    window.location.href = paymentUrl!;
  }

  const currentPlan = plans[selectedPlan];
  const isLoading = !stripePrices;
  // const isLoading = true;

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        ref={cardRef}
        className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={
          {
            "--mouse-x": `${mousePosition.x}px`,
            "--mouse-y": `${mousePosition.y}px`,
          } as React.CSSProperties
        }
      >
        {/* Subtle hover effect */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(0,0,0,0.02), transparent 40%)`,
          }}
        />

        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              One app. Three things.
            </h2>
            <p className="text-gray-600">
              The only productivity system you'll actually use
            </p>
          </div>

          {/* Plan Tabs */}
          <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
            {(["monthly", "yearly", "lifetime"] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 relative ${
                  selectedPlan === plan
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="capitalize">{plan}</span>
                {plans[plan].save && (
                  <div className="absolute -top-2 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {plans[plan].save}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Pricing */}
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-2 mb-1">
              {currentPlan?.oldPrice != null && (
                <>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <span className="text-2xl text-gray-400 line-through">
                      {currentPlan.oldPrice}
                    </span>
                  )}
                </>
              )}
              {isLoading ? (
                <Skeleton className="h-14 w-32" />
              ) : (
                <span className="text-5xl font-bold text-gray-900">
                  {currentPlan.price}
                </span>
              )}
            </div>
            <div className="text-gray-600 mb-1">{currentPlan.period}</div>
            <div className="text-sm text-gray-500">
              {currentPlan.description}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700 text-sm leading-relaxed">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            disabled={paymentUrlLoading || isLoading}
            onClick={handlePurchase}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-6 text-base font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50"
          >
            {paymentUrlLoading ? (
              <LoaderCircle className="animate-spin w-5 h-5" />
            ) : (
              `Get started with ${selectedPlan}`
            )}
          </Button>

          {/* Footer note */}
          {/*<p className="text-center text-xs text-gray-500 mt-4">
            Free to start • Available on iPhone
          </p>*/}
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
