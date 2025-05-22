import { useQuery } from "convex/react";
import FullscreenSpinner from "~/components/FullscreenSpinner";
import UserTaskTile from "./UserTaskTile";
import { api } from "convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";

export default function TasksPage() {
  const userTasks = useQuery(api.tasks.getAllUserTasks);

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
                <UserTaskTile userTask={task} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
