import React from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { AppStoreButton, WebButton } from "~/pages/home/components/CTAButtons";

export default function BlogAdCard() {
  return (
    <Card className="md:col-span-2 border-gray-200 gap-2 bg-primary/20">
      <CardHeader className="pb-2 text-lg font-bold text-gray-900">
        Build habits that actually stick
      </CardHeader>
      <CardContent className="text-sm sm:text-base text-gray-600 mb-4">
        Stop fighting complex spreadsheets. Join 5,100+ users tracking habits,
        journals, and metrics in one beautiful, minimal app.
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <AppStoreButton />
          <WebButton />
        </div>
      </CardContent>
    </Card>
  );
}
