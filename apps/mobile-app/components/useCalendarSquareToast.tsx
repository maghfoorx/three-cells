import { proxy, useSnapshot } from "valtio";
import { useCallback } from "react";
import { format } from "date-fns";
import { useMutation } from "convex/react";
import type { Doc } from "@packages/backend/convex/_generated/dataModel";
import { api } from "@packages/backend/convex/_generated/api";
import { handleHookMutationError } from "@/utils/handleHookMutationError";

type BulkManageHabitSubmissionsStateType = {
  selectedDateStrings: Record<string, boolean>;
  togglingSubmission: boolean;
};

const bulkManageSubmissionState = proxy<BulkManageHabitSubmissionsStateType>({
  selectedDateStrings: {},
  togglingSubmission: false,
});

export const useBulkManageHabitSubmissions = (
  habit: Doc<"userHabits"> | null | undefined,
) => {
  const $state = useSnapshot(bulkManageSubmissionState);

  const bulkCompleteSubmittedDates = useMutation(
    api.habits.bulkCompleteSelectedDates,
  );
  const bulkUnCompleteSubmittedDates = useMutation(
    api.habits.bulkUnCompleteSelectedDates,
  );

  // Optimize toggleDate to work directly with strings and avoid date conversion
  const toggleDate = useCallback((date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    if (bulkManageSubmissionState.selectedDateStrings[dateStr]) {
      delete bulkManageSubmissionState.selectedDateStrings[dateStr];
    } else {
      bulkManageSubmissionState.selectedDateStrings[dateStr] = true;
    }
  }, []);

  const clearDates = useCallback(() => {
    bulkManageSubmissionState.selectedDateStrings = {};
  }, []);

  const handleCompleteAction = useCallback(async () => {
    const selectedDates = Object.keys(
      bulkManageSubmissionState.selectedDateStrings,
    );
    if (selectedDates.length === 0 || !habit?._id) return;

    bulkManageSubmissionState.togglingSubmission = true;
    try {
      await bulkCompleteSubmittedDates({
        habitId: habit._id,
        selectedDates,
      });
      clearDates();
    } catch (err) {
      handleHookMutationError(err);
      throw err;
    } finally {
      bulkManageSubmissionState.togglingSubmission = false;
    }
  }, [habit?._id, bulkCompleteSubmittedDates, clearDates]);

  const handleUnCompleteAction = useCallback(async () => {
    const selectedDates = Object.keys(
      bulkManageSubmissionState.selectedDateStrings,
    );
    if (selectedDates.length === 0 || !habit?._id) return;

    bulkManageSubmissionState.togglingSubmission = true;
    try {
      await bulkUnCompleteSubmittedDates({
        habitId: habit._id,
        selectedDates,
      });
      clearDates();
    } catch (err) {
      handleHookMutationError(err);
      throw err;
    } finally {
      bulkManageSubmissionState.togglingSubmission = false;
    }
  }, [habit?._id, bulkUnCompleteSubmittedDates, clearDates]);

  return {
    // Remove unnecessary conversions - just return the snapshot directly
    selectedDateStrings: $state.selectedDateStrings,
    toggleDate,
    clearDates,
    togglingSubmission: $state.togglingSubmission,
    handleCompleteAction,
    handleUnCompleteAction,
  };
};
