import { X } from "lucide-react";
import { Button } from "./ui/button";

export default function TraditionalApproachCard() {
  const problemFeatures = [
    "Switching between 6+ different apps daily",
    "Losing context every time you switch",
    "Forgetting to check half your tools",
    "No connection between habits and outcomes",
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative p-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl opacity-75">
        <div
          className="absolute inset-0 rounded-3xl opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 8px,
              rgba(0,0,0,0.1) 8px,
              rgba(0,0,0,0.1) 16px
            )`,
          }}
        />

        {/* Warning badge */}
        <div className="absolute top-6 right-6 z-10">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            Scattered <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Main content card */}
        <div className="relative bg-gray-800 rounded-2xl p-8 text-gray-300 overflow-hidden">
          {/* Header */}
          <div className="relative z-10 mb-8">
            {/* Pricing */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-light text-gray-400">£50+</span>
              <span className="text-gray-500 text-base">Per month</span>
            </div>
            <div className="text-gray-400 text-left text-xl">
              Multiple subscriptions. Constant switching.
            </div>
          </div>

          {/* Dotted separator */}
          <div className="relative z-10 border-t border-dotted border-gray-600 mb-8"></div>

          {/* Problems list */}
          <div className="relative z-10 space-y-4 mb-8">
            {problemFeatures.map((problem, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-400 text-sm">{problem}</span>
              </div>
            ))}
          </div>

          {/* Disabled CTA Button */}
          <Button
            disabled
            className="relative z-10 w-full bg-gray-700 text-gray-500 cursor-not-allowed rounded-sm py-6 text-base font-medium"
          >
            Keep Struggling
          </Button>
        </div>
      </div>
    </div>
  );
}
