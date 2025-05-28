import type { DataModel } from "convex/_generated/dataModel";
import { proxy, useSnapshot } from "valtio";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { CheckCircle, SquareCheck, SquareX, XCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { handleHookMutationError } from "~/lib/handleHookMutationError";

type Habit = DataModel["userHabits"]["document"];
type Submission = DataModel["userHabitSubmissions"]["document"];

export const useCalendarSquareToast = () => {
  // Track the active toast ID
  const toastIdRef = useRef<string | number | null>(null);

  const showToast = ({
    date,
    habit,
    submissions,
  }: {
    date: Date;
    habit: Habit;
    submissions: Submission[];
  }) => {
    if (toastIdRef.current !== null) {
      toast.dismiss(toastIdRef.current);
    }

    const completed = habit.type === "yes_no" && submissions.length > 0;

    const id = toast.custom(
      (t) => (
        <div className="px-4 py-3 bg-secondary rounded shadow-md w-80 flex items-center gap-3">
          <div className="pt-0.5">
            {completed ? (
              <SquareCheck className="w-5 h-5" />
            ) : (
              <SquareX className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="font-semibold text-sm">
              {format(date, "EEEE, d MMM yyyy")}
            </div>
            <div className="text-xs mt-1">
              {completed
                ? "You completed this habit 🎉"
                : "You didn’t complete this habit 😔"}
            </div>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      }
    );

    toastIdRef.current = id;
  };

  const hideToast = () => {
    if (toastIdRef.current !== null) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  };

  return {
    onMouseEnter: showToast,
    onMouseLeave: hideToast,
  };
};

type BulkManageHabitSubmissionsStateType = {
  selectedDates: Date[];
  toastId: string | number | null;
  togglingSubmission: boolean;
};

const bulkManageSubmissionState = proxy<BulkManageHabitSubmissionsStateType>({
  selectedDates: [],
  toastId: null,
  togglingSubmission: false,
});

export const useBulkManageHabitSubmissions = ({
  habit,
}: {
  habit?: DataModel["userHabits"]["document"];
}) => {
  const $state = useSnapshot(bulkManageSubmissionState);

  const toggleDate = (date: Date) => {
    const index = bulkManageSubmissionState.selectedDates.findIndex(
      (d) => d.getTime() === date.getTime()
    );

    if (index !== -1) {
      // Already selected — remove it
      bulkManageSubmissionState.selectedDates.splice(index, 1);
    } else {
      // Not selected — add it
      bulkManageSubmissionState.selectedDates.push(date);
    }

    if (bulkManageSubmissionState.selectedDates.length === 0) {
      console.log("selected dates length > 0");
      // Hide toast if no dates selected
      if (bulkManageSubmissionState.toastId != null) {
        toast.dismiss(bulkManageSubmissionState.toastId);
        bulkManageSubmissionState.toastId = null;
      }
    } else {
      console.log("about to run maybe show bulk toast");
      maybeShowBulkToast();
    }
  };

  const clearDates = () => {
    bulkManageSubmissionState.selectedDates = [];
    if (bulkManageSubmissionState.toastId != null) {
      toast.dismiss(bulkManageSubmissionState.toastId);
      bulkManageSubmissionState.toastId = null;
    }
  };

  const bulkCompleteSubmittedDates = useMutation(
    api.habits.bulkCompleteSelectedDates
  );
  const bulkUnCompleteSubmittedDates = useMutation(
    api.habits.bulkUnCompleteSelectedDates
  );

  const handleCompleteSelectedDates = async (
    formattedSelectedDates: string[]
  ) => {
    bulkManageSubmissionState.togglingSubmission = true;
    try {
      if (habit?._id) {
        await bulkCompleteSubmittedDates({
          habitId: habit._id,
          selectedDates: formattedSelectedDates,
        });
      }
    } catch (err) {
      handleHookMutationError(err);
    } finally {
      bulkManageSubmissionState.togglingSubmission = false;
      clearDates();
    }
  };

  const handleUnCompleteSelectedDates = async (
    formattedSelectedDates: string[]
  ) => {
    bulkManageSubmissionState.togglingSubmission = true;
    try {
      if (habit?._id) {
        await bulkUnCompleteSubmittedDates({
          habitId: habit._id,
          selectedDates: formattedSelectedDates,
        });
      }
    } catch (err) {
      handleHookMutationError(err);
    } finally {
      bulkManageSubmissionState.togglingSubmission = false;
      bulkManageSubmissionState.selectedDates = [];
      clearDates();
    }
  };

  const maybeShowBulkToast = () => {
    if (
      bulkManageSubmissionState.selectedDates.length > 0 &&
      bulkManageSubmissionState.toastId === null
    ) {
      const id = toast.custom(
        () => (
          <BulkManageToastContent
            onClear={clearDates}
            habit={habit}
            onComplete={handleCompleteSelectedDates}
            onUncomplete={handleUnCompleteSelectedDates}
          />
        ),
        {
          duration: Infinity,
          position: "top-center",
          style: {
            zIndex: 10,
          },
        }
      );

      bulkManageSubmissionState.toastId = id;
    }
  };

  return {
    selectedDates: $state.selectedDates,
    toggleDate,
    clearDates,
    togglingSubmission: $state.togglingSubmission,
  };
};

export const BulkManageToastContent = ({
  onClear,
  habit,
  onComplete,
  onUncomplete,
}: {
  onClear: () => void;
  habit?: DataModel["userHabits"]["document"];
  onComplete: (selectedDates: string[]) => Promise<void>;
  onUncomplete: (selectedDates: string[]) => Promise<void>;
}) => {
  const $state = useSnapshot(bulkManageSubmissionState);

  const formattedSelectedDates = useMemo(
    () => $state.selectedDates.map((date) => format(date, "yyyy-MM-dd")),
    [$state.selectedDates]
  );

  const handleCompleteSelectedDates = async () => {
    if (formattedSelectedDates.length === 0) return;

    if (habit?._id) {
      await onComplete(formattedSelectedDates);
    }
  };

  const handleUnCompleteSelectedDates = async () => {
    if (formattedSelectedDates.length === 0) return;

    if (habit?._id) {
      await onUncomplete(formattedSelectedDates);
    }
  };

  return (
    <div className="px-4 py-3 rounded shadow-md w-96 flex flex-col gap-2 bg-muted">
      <div className="text-sm font-medium">
        {$state.selectedDates.length} date
        {$state.selectedDates.length > 1 ? "s" : ""} selected
      </div>
      <div className="flex justify-end gap-2">
        <Button
          size={"sm"}
          className="text-xs"
          variant={"outline"}
          onClick={onClear}
        >
          Clear
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={"sm"}>Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 z-[9999]"
            side="bottom"
            sideOffset={18}
          >
            <DropdownMenuLabel className="font-semibold">
              Bulk manage tasks
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleCompleteSelectedDates}>
                <SquareCheck /> Complete all tasks
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleUnCompleteSelectedDates}>
                <SquareX /> Uncomplete all tasks
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
