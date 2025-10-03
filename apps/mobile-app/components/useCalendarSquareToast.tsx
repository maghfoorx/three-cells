import { proxy, useSnapshot } from "valtio";
import { useMemo } from "react";
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

  const selectedDatesArray = useMemo(
    () => Object.keys($state.selectedDateStrings).map((str) => new Date(str)),
    [$state.selectedDateStrings],
  );

  const formattedSelectedDates = useMemo(
    () => Object.keys($state.selectedDateStrings),
    [$state.selectedDateStrings],
  );

  const bulkCompleteSubmittedDates = useMutation(
    api.habits.bulkCompleteSelectedDates,
  );
  const bulkUnCompleteSubmittedDates = useMutation(
    api.habits.bulkUnCompleteSelectedDates,
  );

  const toggleDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");

    if (bulkManageSubmissionState.selectedDateStrings[dateStr]) {
      delete bulkManageSubmissionState.selectedDateStrings[dateStr];
    } else {
      bulkManageSubmissionState.selectedDateStrings[dateStr] = true;
    }
  };

  const clearDates = () => {
    bulkManageSubmissionState.selectedDateStrings = {};
  };

  const handleCompleteAction = async () => {
    if (formattedSelectedDates.length === 0 || !habit?._id) return;

    bulkManageSubmissionState.togglingSubmission = true;
    try {
      await bulkCompleteSubmittedDates({
        habitId: habit._id,
        selectedDates: formattedSelectedDates,
      });
      clearDates();
    } catch (err) {
      handleHookMutationError(err);
      throw err;
    } finally {
      bulkManageSubmissionState.togglingSubmission = false;
    }
  };

  const handleUnCompleteAction = async () => {
    if (formattedSelectedDates.length === 0 || !habit?._id) return;

    bulkManageSubmissionState.togglingSubmission = true;
    try {
      await bulkUnCompleteSubmittedDates({
        habitId: habit._id,
        selectedDates: formattedSelectedDates,
      });
      clearDates();
    } catch (err) {
      handleHookMutationError(err);
      throw err;
    } finally {
      bulkManageSubmissionState.togglingSubmission = false;
    }
  };

  return {
    selectedDates: selectedDatesArray,
    selectedDateStrings: $state.selectedDateStrings,
    toggleDate,
    clearDates,
    togglingSubmission: $state.togglingSubmission,
    handleCompleteAction,
    handleUnCompleteAction,
  };
};
