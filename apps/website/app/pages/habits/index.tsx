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
          {isLoading && (
            <div className="flex flex-col gap-2">
              <UserHabitCard.Skeleton />
              <UserHabitCard.Skeleton />
            </div>
          )}
          <AnimatePresence>
            {!isLoading &&
              allUserHabits.map((habit) => (
                <motion.div
                  key={habit._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <UserHabitCard habit={habit} />
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
