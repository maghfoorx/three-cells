import React from "react";
import { Card } from "~/components/ui/card";
import { AppStoreButton, WebButton } from "~/pages/home/components/CTAButtons";
import { CheckCircle2 } from "lucide-react";

export default function BlogAdCardWithPicture() {
  return (
    <Card className="md:col-span-2 border border-gray-200 p-6 sm:p-8 bg-primary/5 flex flex-col md:flex-row items-center gap-8 shadow-sm">
      {/* Content Container */}
      <div className="flex-1 w-full">
        <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
          Become the person you promised to be
        </div>

        <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
          Stop letting your days slip away. Three Cells gives you the clarity
          and focus to turn your ambitions into reality, one day at a time.
        </p>

        <div className="space-y-3 mb-8">
          {[
            "Build unshakeable consistency",
            "Turn vague goals into concrete progress",
            "Understand what drives your best days",
            "Find peace in a simple daily ritual",
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-gray-700 font-medium"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AppStoreButton />
          <WebButton />
        </div>
      </div>

      {/* Image Container */}
      <div className="flex justify-center md:w-1/3 flex-shrink-0">
        <img
          src="/main-app.webp"
          alt="Screenshot of the Three Cells habit tracker and journal app"
          className="max-h-[400px] w-auto"
        />
      </div>
    </Card>
  );
}
