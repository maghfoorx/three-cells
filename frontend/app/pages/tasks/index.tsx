import { gql, useQuery as useApolloQuery } from "@apollo/client";
import { useQuery } from "convex/react";
import FullscreenSpinner from "~/components/FullscreenSpinner";
import CreateNewTaskDialog from "./CreateNewTaskDialog";
import type { UserTask } from "~/types";
import UserTaskTile from "./UserTaskTile";
import { EditableText } from "@blueprintjs/core";
import { api } from "convex/_generated/api";

const ALL_USER_TASKS_QUERY = gql`
  query AllUserTasks {
    userTasks {
      id
      title
      description
      category
      category_colour
      is_completed
      completed_at
    }
  }
`;

export default function TasksPage() {
  const userTasks = useQuery(api.tasks.getAllUserTasks);

  if (userTasks === undefined) {
    return <FullscreenSpinner />;
  }

  return (
    <div className="flex flex-col h-full flex-1 gap-3 rounded-xl rounded-t-none p-2">
      <div className="flex-1 relative">
        <div className="flex-1 absolute h-full w-full overflow-y-auto space-y-1">
          {userTasks.map((task) => {
            return <UserTaskTile key={task._id} userTask={task} />;
          })}
        </div>
      </div>
    </div>
  );
}
