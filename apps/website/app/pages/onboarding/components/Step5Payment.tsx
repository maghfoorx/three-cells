import React, { useState, useRef } from "react";
import { Check, LoaderCircle, Star, StarHalf } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { motion } from "framer-motion";
import { useQuery, useAction } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

interface Step3PaymentProps {
  onBack: () => void;
  onFinish: () => void;
}

export default function Step3Payment({ onBack, onFinish }: Step3PaymentProps) {
  const stripePrices = useQuery(api.stripe.getPrices);
  const [selectedPlan, setSelectedPlan] = useState<
    "monthly" | "yearly" | "lifetime"
  >("yearly");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [paymentUrlLoading, setPaymentUrlLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const payAndSendMessage = useAction(api.stripe.pay);

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
      oldPrice: null,
    },
    yearly: {
      price: stripePrices?.yearly
        ? formatPrice(stripePrices.yearly.amount)
        : null,
      period: "per year",
      save: "Popular",
      oldPrice: getMonthlyEquivalent(),
    },
    lifetime: {
      price: stripePrices?.lifetime
        ? formatPrice(stripePrices.lifetime.amount)
        : null,
      period: "one-time",
      save: null,
      oldPrice: null,
    },
  };

  const benefits = [
    "Daily journaling to find your success pattern",
    "One-tap habit tracking with heatmaps",
    "Clean, distraction-free task management",
  ];

  const currentPlan = plans[selectedPlan];
  const isLoading = !stripePrices;

  const handlePurchase = async () => {
    setPaymentUrlLoading(true);
    try {
      const paymentUrl = await payAndSendMessage({ product: selectedPlan });
      if (paymentUrl) {
        window.location.href = paymentUrl;
      }
    } catch (error) {
      console.error("Payment failed", error);
      setPaymentUrlLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md md:max-w-4xl mx-auto"
    >
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

        <div className="relative p-8 grid grid-cols-1 md:grid-cols-2 md:gap-x-12 md:gap-y-4 items-center">
          {/* 1. Header (Mobile: 1st, Desktop: Left Col, Row 1) */}
          <div className="md:col-start-1 md:row-start-1 text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your best life one step away
            </h2>
            <p className="text-gray-600 mb-3">
              The only productivity system you'll actually use
            </p>

            {/* Social Proof */}
            <div className="flex flex-col items-center md:items-start justify-center gap-1">
              <div className="flex items-center gap-0.5">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <StarHalf
                  size={16}
                  className="text-yellow-400 fill-yellow-400"
                />
              </div>
              <p className="text-xs text-gray-500 font-medium">
                4.5 stars on App Store (5,400+ downloads)
              </p>
            </div>
          </div>

          {/* 2. Pricing Wrapper (Mobile: 2nd, Desktop: Right Col, Row 1-3) */}
          <div className="md:col-start-2 md:row-start-1 md:row-span-3 bg-gray-50/50 md:bg-transparent rounded-xl p-4 md:p-0 mb-8 md:mb-0">
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
            </div>

            {/* CTA Button */}
            <Button
              onClick={handlePurchase}
              disabled={paymentUrlLoading || isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-6 text-base font-medium transition-all duration-200 hover:shadow-lg"
            >
              {paymentUrlLoading ? (
                <LoaderCircle className="animate-spin w-5 h-5" />
              ) : (
                `Get ${selectedPlan}`
              )}
            </Button>
          </div>

          {/* 3. Testimonial (Mobile: 3rd, Desktop: Left Col, Row 3) */}
          <div className="md:col-start-1 md:row-start-3 bg-gray-50 rounded-xl p-4 mb-8 md:mb-0 border border-gray-100">
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={14}
                  className="text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <p className="text-sm text-gray-700 italic mb-2 leading-relaxed">
              "I've tried everything. This is the first app that's minimal and
              has everything I need. I actually use it every day. Within 30 days
              I consistently started working out. Journaling has also helped see
              what I do on my best days. The app is very simple, clean and does
              not spam me with notifications."
            </p>
            <p className="text-xs font-semibold text-gray-900">
              — Mags, Software Engineer
            </p>
          </div>

          {/* 4. Benefits (Mobile: 4th, Desktop: Left Col, Row 2) */}
          <div className="md:col-start-1 md:row-start-2 space-y-3 mb-8 md:mb-0">
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
        </div>
      </div>
    </motion.div>
  );
}
