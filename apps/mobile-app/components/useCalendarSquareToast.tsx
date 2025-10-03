import { proxy, useSnapshot } from "valtio";
import { useMemo } from "react";
import { format } from "date-fns";
import { useMutation } from "convex/react";
import type { Doc } from "@packages/backend/convex/_generated/dataModel";
import { api } from "@packages/backend/convex/_generated/api";
import { handleHookMutationError } from "@/utils/handleHookMutationError";

type BulkManageHabitSubmissionsStateType = {
  selectedDates: Date[];
  togglingSubmission: boolean;
};

const bulkManageSubmissionState = proxy<BulkManageHabitSubmissionsStateType>({
  selectedDates: [],
  togglingSubmission: false,
});

export const useBulkManageHabitSubmissions = (
  habit: Doc<"userHabits"> | null | undefined,
) => {
  const $state = useSnapshot(bulkManageSubmissionState);

  const formattedSelectedDates = useMemo(
    () => $state.selectedDates.map((date) => format(date, "yyyy-MM-dd")),
    [$state.selectedDates],
  );

  const bulkCompleteSubmittedDates = useMutation(
    api.habits.bulkCompleteSelectedDates,
  );
  const bulkUnCompleteSubmittedDates = useMutation(
    api.habits.bulkUnCompleteSelectedDates,
  );

  const toggleDate = (date: Date) => {
    const index = bulkManageSubmissionState.selectedDates.findIndex(
      (d) => d.getTime() === date.getTime(),
    );

    if (index !== -1) {
      // Already selected — remove it
      bulkManageSubmissionState.selectedDates.splice(index, 1);
    } else {
      // Not selected — add it
      bulkManageSubmissionState.selectedDates.push(date);
    }
  };

  const clearDates = () => {
    bulkManageSubmissionState.selectedDates = [];
  };

  const handleCompleteAction = async () => {
    if (formattedSelectedDates.length === 0 || !habit?._id) return;

    bulkManageSubmissionState.togglingSubmission = true;
    try {
      await bulkCompleteSubmittedDates({
        habitId: habit._id,
        selectedDates: formattedSelectedDates,
      });
    } catch (err) {
      handleHookMutationError(err);
    } finally {
      bulkManageSubmissionState.togglingSubmission = false;
      clearDates();
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
    } catch (err) {
      handleHookMutationError(err);
    } finally {
      bulkManageSubmissionState.togglingSubmission = false;
      clearDates();
    }
  };

  return {
    selectedDates: $state.selectedDates,
    toggleDate,
    clearDates,
    togglingSubmission: $state.togglingSubmission,
    handleCompleteAction,
    handleUnCompleteAction,
  };
};
