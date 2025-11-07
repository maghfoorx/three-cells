import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { UserHabitCard } from "./UserHabitCard";
import FullscreenSpinner from "~/components/FullscreenSpinner";
import { api } from "@packages/backend/convex/_generated/api";

export default function HabitsPage() {
  const allUserHabits = useQuery(api.habits.getAllUserHabits);

  const isLoading = allUserHabits === undefined;

  return (
    <div className="flex flex-col h-full flex-1 gap-3 rounded-xl rounded-t-none p-2">
      <div className="flex-1 relative">
        <div className="absolute h-full w-full overflow-y-auto space-y-3">
          <AnimatePresence>
            {isLoading && (
              <>
                {Array.from({ length: 2 }, (_, i) => (
                  <UserHabitCard.Skeleton key={i} />
                ))}
              </>
            )}
            {!isLoading &&
              allUserHabits.map((habit) => <UserHabitCard habit={habit} />)}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
