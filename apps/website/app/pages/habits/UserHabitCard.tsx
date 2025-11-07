import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";
import color from "color";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { Check, Cross, Loader2, X } from "lucide-react";
import {
  useMemo,
  useState,
  useCallback,
  type MouseEventHandler,
  type MouseEvent,
} from "react";
import { Link, useNavigate } from "react-router";
import { handleHookMutationError } from "~/lib/handleHookMutationError";
import { Skeleton } from "~/components/ui/skeleton";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { api } from "@packages/backend/convex/_generated/api";

export function UserHabitCard({
  habit,
}: {
  habit: DataModel["userHabits"]["document"];
}) {
  const navigate = useNavigate();
  const { start, end, dates } = useMemo(() => {
    const rawEnd = new Date();
    const rawStart = addDays(rawEnd, -6);
    const dates = Array.from({ length: 7 }, (_, i) => addDays(rawStart, i));
    return {
      start: startOfDay(rawStart),
      end: endOfDay(rawEnd),
      dates,
    };
  }, []);

  const submissionsForHabit = useQuery(api.habits.getSubmissionsForHabit, {
    habitId: habit._id,
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  });

  const habitCardColour = useMemo(() => {
    return color(habit.colour).mix(color("white")).hex();
  }, [habit.colour]);

  return (
    <Link
      to={`/habits/${habit._id}`}
      viewTransition
      className="cursor-pointer rounded-sm border shadow-sm p-4 flex flex-col gap-4 hover:opacity-85 group"
      style={{
        backgroundColor: habitCardColour,
        textDecoration: "none", // <- remove underline
      }}
    >
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-gray-800 flex items-center gap-2 group-hover:underline">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: habit.colour }}
          ></span>
          {habit.name}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dates.map((date) => {
          return (
            <HabitDateButton
              key={date.getTime()}
              habitId={habit._id}
              date={date}
              submissions={submissionsForHabit?.lastXDaysSubmissions}
            />
          );
        })}
      </div>
      {submissionsForHabit?.currentMonthPerformancePercentage == null &&
        submissionsForHabit?.lastXDaysSubmissions == null && (
          <Skeleton className="w-32 h-4" />
        )}
      {submissionsForHabit?.currentMonthPerformancePercentage != null &&
        submissionsForHabit?.lastXDaysSubmissions != null && (
          <div>
            {submissionsForHabit?.lastXDaysSubmissions?.length}/{dates.length}{" "}
            days • {submissionsForHabit?.currentMonthPerformancePercentage}%
            this month
          </div>
        )}
    </Link>
  );
}

type HabitDateButtonProps = {
  date: Date;
  habitId: DataModel["userHabits"]["document"]["_id"];
  submissions?: DataModel["userHabitSubmissions"]["document"][];
};
const HabitDateButton = ({
  date,
  habitId,
  submissions,
}: HabitDateButtonProps) => {
  const [isToggling, setIsToggling] = useState(false);

  const toggleYesNoHabitSubmission = useMutation(
    api.habits.toggleYesNoHabitSubmission,
  );

  const toggleSubmission = useCallback(
    async (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      setIsToggling(true);
      try {
        const formattedDate = format(date, "yyyy-MM-dd");
        await toggleYesNoHabitSubmission({ habitId, dateFor: formattedDate });
      } catch (err) {
        handleHookMutationError(err);
      } finally {
        setIsToggling(false);
      }
    },
    [date, habitId, toggleYesNoHabitSubmission],
  );

  const isChecked = submissions?.some((s) =>
    isSameDay(new Date(s.dateFor), date),
  );

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-semibold uppercase">
        {format(date, "EEE")}
      </span>
      <span className="text-xs font-thin text-muted-foreground">
        {format(date, "d")}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-sm cursor-pointer"
        onClick={(event) => toggleSubmission(event)}
      >
        <motion.div
          key={isChecked ? "checked" : "unchecked"}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {isToggling ? (
            <Loader2 className="animate-spin text-gray-700" size={24} />
          ) : isChecked ? (
            <Check className="text-green-700 text-xl" />
          ) : (
            <X className="text-red-700 text-xl" />
          )}
        </motion.div>
      </Button>
    </div>
  );
};

UserHabitCard.Skeleton = () => {
  const dates = useMemo(() => {
    const rawEnd = new Date();
    const rawStart = addDays(rawEnd, -6);
    return Array.from({ length: 7 }, (_, i) => addDays(rawStart, i));
  }, []);

  return (
    <motion.div
      layout
      className="rounded-sm border shadow-sm p-4 flex flex-col gap-4 bg-white"
    >
      {/* Habit name skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-[18px] w-32" />
        </div>
      </div>

      {/* Days grid with spinners */}
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date) => (
          <div key={date.getTime()} className="flex flex-col items-center">
            <span className="text-sm font-semibold uppercase">
              {format(date, "EEE")}
            </span>
            <span className="text-xs font-thin text-muted-foreground">
              {format(date, "d")}
            </span>
            <div className="h-9 flex items-center justify-center">
              <Loader2 className="animate-spin text-gray-400" size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Stats skeleton */}
      <Skeleton className="h-4 w-40" />
    </motion.div>
  );
};

export default UserHabitCard;
