import { useQuery } from "convex/react";
import FullscreenSpinner from "~/components/FullscreenSpinner";
import UserTaskTile from "./UserTaskTile";
import { api } from "convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

export default function TasksPage() {
  const userTasks = useQuery(api.tasks.getAllUserTasks);

  const recentCompletedTaskIds = useMemo(() => {
    if (!userTasks) return new Set();

    const completedTasks = userTasks
      .filter((task) => task.is_completed && task.completed_at)
      .sort((a, b) => (b.completed_at ?? 0) - (a.completed_at ?? 0))
      .slice(0, 2)
      .map((task) => task._id);

    return new Set(completedTasks);
  }, [userTasks]);

  if (userTasks === undefined) {
    return <FullscreenSpinner />;
  }

  return (
    <div className="flex flex-col h-full flex-1 gap-3 rounded-xl rounded-t-none p-2">
      <div className="flex-1 relative">
        <div className="flex-1 absolute h-full w-full overflow-y-auto space-y-1">
          <AnimatePresence>
            {userTasks.map((task) => (
              <motion.div
                key={task._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <UserTaskTile
                  userTask={task}
                  recentlyCompleted={recentCompletedTaskIds.has(task._id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
