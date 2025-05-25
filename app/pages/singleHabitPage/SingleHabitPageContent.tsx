import { api } from "convex/_generated/api";
import type { DataModel } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { AnimatePresence } from "framer-motion";
import { useParams } from "react-router";
import SubmissionsCalendarHeatmap from "./SubmissionsCalendarHeatmap";
import FullscreenSpinner from "~/components/FullscreenSpinner";
import React, { Suspense, lazy } from "react";

export default function SingleHabitPage() {
  const params = useParams();

  const habitId = params.habitId as DataModel["userHabits"]["document"]["_id"];

  const result = useQuery(api.habits.getAllSubmissionsForHabit, {
    habitId: habitId,
  });

  const habit = result?.habit;
  const allSubmissions = result?.allSubmissions ?? [];

  return (
    <div className="flex flex-col h-full flex-1 gap-3 rounded-xl rounded-t-none p-2">
      <div className="flex-1 relative">
        <div className="absolute h-full w-full overflow-y-auto space-y-3">
          <AnimatePresence>
            <SubmissionsCalendarHeatmap
              allSubmissions={allSubmissions}
              habit={habit}
              // Optional: customize date range
              // startDate={new Date("2025-01-01")}
              // endDate={new Date()}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
