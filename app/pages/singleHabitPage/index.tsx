import React, { lazy, Suspense } from "react";
import FullscreenSpinner from "~/components/FullscreenSpinner";

const LazySingleHabitPage = lazy(
  async () => await import("./SingleHabitPageContent")
);

export default function SingleHabitPage() {
  return (
    <Suspense fallback={<FullscreenSpinner />}>
      <LazySingleHabitPage />
    </Suspense>
  );
}
