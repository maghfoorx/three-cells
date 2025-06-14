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
import { api } from "convex/_generated/api";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { Check, Cross, Loader2, X } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { Link } from "react-router";
import type { DataModel } from "convex/_generated/dataModel";
import { handleHookMutationError } from "~/lib/handleHookMutationError";
import { Skeleton } from "~/components/ui/skeleton";

export function UserHabitCard({
  habit,
}: {
  habit: DataModel["userHabits"]["document"];
}) {
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
    <div
      className="rounded-sm border shadow-sm p-4 flex flex-col gap-4"
      style={{
        backgroundColor: habitCardColour,
      }}
    >
      <div className="flex justify-between items-center">
        <Link
          to={`/habits/${habit._id}`}
          viewTransition
          className="text-sm font-medium text-gray-800 flex items-center gap-2"
        >
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: habit.colour }}
          ></span>
          {habit.name}
        </Link>
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
      {submissionsForHabit?.currentMonthPerformancePercentage != null &&
        submissionsForHabit?.lastXDaysSubmissions != null && (
          <div>
            {submissionsForHabit?.lastXDaysSubmissions?.length}/{dates.length}{" "}
            days • {submissionsForHabit?.currentMonthPerformancePercentage}%
            this month
          </div>
        )}
    </div>
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
    api.habits.toggleYesNoHabitSubmission
  );

  const toggleSubmission = useCallback(async () => {
    setIsToggling(true);
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      await toggleYesNoHabitSubmission({ habitId, dateFor: formattedDate });
    } catch (err) {
      handleHookMutationError(err);
    } finally {
      setIsToggling(false);
    }
  }, [date, habitId, toggleYesNoHabitSubmission]);

  const isChecked = submissions?.some((s) =>
    isSameDay(new Date(s.dateFor), date)
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
        className="rounded-sm"
        onClick={toggleSubmission}
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
  return (
    <motion.div
      layout
      className="rounded-sm border shadow-sm p-4 flex flex-col gap-4"
    >
      <Skeleton className="h-6 w-[200px] rounded-sm" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => {
          return (
            <div key={i}>
              <Skeleton className="w-full h-10 rounded-sm" />
            </div>
          );
        })}
      </div>
      <Skeleton className="h-6 w-[200px] rounded-sm" />
    </motion.div>
  );
};

export default UserHabitCard;
