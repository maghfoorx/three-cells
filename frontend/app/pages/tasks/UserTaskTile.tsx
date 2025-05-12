import { gql, useMutation } from "@apollo/client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { showErrorToast } from "~/lib/showErrorToast";
import { showSuccessToast } from "~/lib/showSuccessToast";
import { cn } from "~/lib/utils";
import type { UserTask } from "~/types";

const TOGGLE_TASK_COMPLETION_MUTATION = gql`
  mutation ToggleTaskCompletion($taskId: ID!) {
    toggleUserTaskCompletion(task_id: $taskId) {
      id
      is_completed
      completed_at
    }
  }
`;

const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($taskId: ID!) {
    deleteUserTask(task_id: $taskId) {
      id
    }
  }
`;

function UserTaskTileTrigger({
  userTask,
  toggleTaskCompleition,
}: {
  userTask: UserTask;
  toggleTaskCompleition: (options: {
    variables: { taskId: string };
  }) => Promise<void>;
}) {
  const handleCheckboxClicked = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleTaskCompleition({
      variables: { taskId: userTask.id },
    });
  };

  return (
    <div
      className={cn(
        "flex flex-start space-x-2 p-3 rounded-sm shadow-md bg-sky-300 cursor-pointer w-full",
        {
          "opacity-60 line-through": userTask.is_completed,
        }
      )}
    >
      <Checkbox
        checked={userTask.is_completed}
        onClick={handleCheckboxClicked}
      />

      <div className="flex flex-col">
        <div className="text-sm font-medium">{userTask.title}</div>
        {userTask.description && (
          <div className="text-xs text-muted-foreground mt-1">
            {userTask.description}
          </div>
        )}
      </div>
    </div>
  );
}

const UserTaskTile = ({ userTask }: { userTask: UserTask }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const [deleteUserTask] = useMutation(DELETE_TASK_MUTATION, {
    update(cache, { data }) {
      if (data?.deleteUserTask) {
        cache.evict({
          id: cache.identify({
            __typename: "UserTask",
            id: data.deleteUserTask.id,
          }),
        });
        cache.gc();
      }
    },
    onError: () => {
      showErrorToast();
    },
    onCompleted: () => {
      showSuccessToast("Successfully deleted the task.");
    },
  });

  const handleDeleteButtonClicked = async () => {
    await deleteUserTask({
      variables: {
        taskId: userTask.id,
      },
    });
    setDialogOpen(false);
  };

  const [toggleTaskCompleition] = useMutation(TOGGLE_TASK_COMPLETION_MUTATION, {
    onError: () => {
      showErrorToast();
    },
  });

  const handleToggleCompleitionButtonClicked = async () => {
    await toggleTaskCompleition({
      variables: { taskId: userTask.id },
    });
  };

  return (
    <div className="w-full">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <div onClick={() => setDialogOpen(true)}>
            <UserTaskTileTrigger
              userTask={userTask}
              toggleTaskCompleition={toggleTaskCompleition as any}
            />
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{userTask.title}</DialogTitle>
          </DialogHeader>
          {userTask.description && <div>{userTask.description}</div>}
          <div className="flex flex-row gap-1">
            <Button onClick={handleToggleCompleitionButtonClicked}>
              {userTask?.is_completed ? "Back to draft" : "Complete"}
            </Button>
            <Button variant={"destructive"} onClick={handleDeleteButtonClicked}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserTaskTile;
