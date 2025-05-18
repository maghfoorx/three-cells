import { gql, useMutation } from "@apollo/client";
import styled from "styled-components";
import { EditableText, Classes } from "@blueprintjs/core";
import { ClipboardCheck, Trash } from "lucide-react";
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

const UPDATE_TASK_TITLE_MUTATION = gql`
  mutation UpdateTaskTitle($taskId: ID!, $updatedTitle: String!) {
    updateTaskTitle(taskId: $taskId, title: $updatedTitle) {
      id
      title
    }
  }
`;

const StyledEditableText = styled(EditableText)<{ $completed: boolean }>`
  & .${Classes.EDITABLE_TEXT_CONTENT} {
    ${({ $completed }) => $completed && "text-decoration: line-through;"}
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
  const [taskTitle, setTaskTitle] = useState(userTask.title);
  const handleCheckboxClicked = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleTaskCompleition({
      variables: { taskId: userTask.id },
    });
  };

  const [updateTaskTitle] = useMutation(UPDATE_TASK_TITLE_MUTATION, {
    onError: () => showErrorToast("Failed to update task title."),
    onCompleted: () => showSuccessToast("Successfully updated task title."),
  });

  const handleTaskTitleEditConfirmed = async (value: string) => {
    if (value.trim().length < 1) {
      showErrorToast("Title cannot be empty");
      setTaskTitle(userTask.title);
      return;
    }

    if (value === userTask.title) {
      return;
    }

    await updateTaskTitle({
      variables: {
        taskId: userTask.id,
        updatedTitle: value,
      },
    });
  };

  return (
    <div
      className={cn(
        "flex items-start space-x-2 p-3 rounded-sm shadow-md bg-sky-300 cursor-pointer w-full",
        {
          "opacity-60 line-through": userTask.is_completed,
        }
      )}
    >
      <Checkbox
        checked={userTask.is_completed}
        onClick={handleCheckboxClicked}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <StyledEditableText
          value={taskTitle}
          onCancel={() => setTaskTitle(userTask.title)}
          onChange={(value) => setTaskTitle(value)}
          onConfirm={handleTaskTitleEditConfirmed}
          disabled={userTask.is_completed}
          $completed={userTask.is_completed}
        />
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
          <div className="flex flex-row justify-end gap-1">
            <Button
              size={"sm"}
              variant={"destructive"}
              onClick={handleDeleteButtonClicked}
            >
              <Trash /> <span>Delete</span>
            </Button>

            <Button size={"sm"} onClick={handleToggleCompleitionButtonClicked}>
              <ClipboardCheck />{" "}
              <span>
                {userTask?.is_completed ? "Back to draft" : "Complete"}
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserTaskTile;
