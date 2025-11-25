import React from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { AppStoreButton, WebButton } from "~/pages/home/components/CTAButtons";

export default function BlogAdCardWithPicture() {
  return (
    // 1. Updated classes for flex layout and border
    <Card className="md:col-span-2 border border-gray-300 p-4 bg-primary/10 flex flex-col md:flex-row md:items-center">
      {/* 2. Content Container (Takes up 2/3 space on desktop) */}
      <div className="flex-1 md:w-2/3">
        {/* Adjusted CardHeader to align with CardContent formatting */}
        <div className="text-xl font-extrabold text-gray-900 mb-2">
          Achieve your dream life
        </div>

        <p className="text-base text-gray-700 mb-4">
          Stop fighting complex spreadsheets. Join 5,100+ tracking habits,
          journals, and metrics in one beautiful, minimal app.
        </p>

        {/* 3. CTA Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4 md:mb-0">
          <AppStoreButton />
          <WebButton />
        </div>
      </div>

      {/* 4. Image Container (Takes up 1/3 space on desktop, centered on mobile) */}
      <div className="flex justify-center md:w-1/3 md:ml-4">
        {/* Note: I removed the fixed 'width' prop to let the image container size it. */}
        {/* Use max-h-48 or max-w-48 to control the size visually if needed. */}
        <img
          src="/main-app.webp"
          alt="Screenshot of the Three Cells habit tracker and journal app"
          className="max-h-96 w-auto"
        />
      </div>
    </Card>
  );
}
