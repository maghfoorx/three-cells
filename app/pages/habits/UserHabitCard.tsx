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
import { Check, Cross, X } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";
import type { DataModel } from "convex/_generated/dataModel";

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

  const submissions = useQuery(api.habits.getSubmissionsForHabit, {
    habitId: habit._id,
    start: start.getTime(),
    end: end.getTime(),
  });

  const toggleYesNoHabitSubmission = useMutation(
    api.habits.toggleYesNoHabitSubmission
  );

  const toggleSubmission = async (date: Date) => {
    const formattedDateForSubmission = format(date, "yyyy-MM-dd");

    await toggleYesNoHabitSubmission({
      habitId: habit._id,
      dateFor: formattedDateForSubmission,
    });
  };

  const habitCardColour = useMemo(() => {
    return color(habit.colour).mix(color("white")).hex();
  }, [habit.colour]);

  return (
    <motion.div
      layout
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
        {/* <span className="text-sm text-muted-foreground">
          {habit.type === "yes_no" && "✔"}
        </span> */}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dates.map((date) => {
          const isChecked = submissions?.some((s) => {
            return isSameDay(new Date(s.dateFor), date);
          });
          return (
            <div
              key={date.toDateString()}
              className="flex flex-col items-center"
            >
              <span className="text-sm font-semibold uppercase">
                {format(date, "EEE")} {/* SAT, FRI, etc. */}
              </span>
              <span className="text-xs font-thin text-muted-foreground">
                {format(date, "d")} {/* 24, 25, etc. */}
              </span>
              <Button
                variant={"ghost"}
                size={"sm"}
                className="rounded-sm"
                onClick={() => toggleSubmission(date)}
              >
                <motion.div
                  key={isChecked ? "checked" : "unchecked"} // triggers animation on change
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {isChecked ? (
                    <Check className="text-green-700 text-xl" />
                  ) : (
                    <X className="text-red-700 text-xl" />
                  )}
                </motion.div>
              </Button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
