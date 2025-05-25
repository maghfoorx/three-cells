import { useMutation } from "convex/react";
import styled from "styled-components";
import { EditableText, Classes } from "@blueprintjs/core";
import { ClipboardCheck, Loader, Loader2, Trash } from "lucide-react";
import { useEffect, useState } from "react";
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
import { api } from "convex/_generated/api";
import schema from "convex/schema";
import type { DataModelFromSchemaDefinition } from "convex/server";
import { AnimatePresence, motion } from "framer-motion";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;

const StyledEditableText = styled(EditableText)<{ $completed: boolean }>`
  & .${Classes.EDITABLE_TEXT_CONTENT} {
    ${({ $completed }) => $completed && "text-decoration: line-through;"}
  }
`;

function UserTaskTileTrigger({
  userTask,
  recentlyCompleted,
}: {
  userTask: DataModel["user_tasks"]["document"];
  recentlyCompleted: boolean;
}) {
  const toggleTaskCompletion = useMutation(api.tasks.toggleUserTaskCompletion);

  const [taskTitle, setTaskTitle] = useState(userTask.title);
  const [isTogglingTask, setIsTogglingTask] = useState(false);

  useEffect(() => {
    setTaskTitle(userTask.title);
  }, [userTask]);

  const handleCheckboxClicked = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTogglingTask(true);
    try {
      await toggleTaskCompletion({ taskId: userTask._id });
    } finally {
      setIsTogglingTask(false);
    }
  };

  const updateTaskTitle = useMutation(api.tasks.updateTaskTitle);

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
      taskId: userTask._id,
      title: value,
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-sm shadow-md bg-sky-300 cursor-pointer",
        {
          "bg-sky-300": !recentlyCompleted,
          "bg-green-200": recentlyCompleted,
          "opacity-60 line-through": userTask.is_completed,
        }
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isTogglingTask ? "spinner" : "checkbox"}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.1 }}
          className="h-5 w-5"
        >
          {isTogglingTask ? (
            <Loader2 className="animate-spin text-gray-700" size={16} />
          ) : (
            <Checkbox
              className="border-gray-600"
              checked={userTask.is_completed}
              onClick={handleCheckboxClicked}
            />
          )}
        </motion.div>
      </AnimatePresence>
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <StyledEditableText
          value={taskTitle}
          multiline
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

const UserTaskTile = ({
  userTask,
  recentlyCompleted,
}: {
  userTask: DataModel["user_tasks"]["document"];
  recentlyCompleted: boolean;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const deleteUserTask = useMutation(api.tasks.deleteUserTask);

  const handleDeleteButtonClicked = async () => {
    await deleteUserTask({
      taskId: userTask._id,
    });
    setDialogOpen(false);
  };

  const toggleTaskCompletion = useMutation(api.tasks.toggleUserTaskCompletion);

  const handleToggleCompleitionButtonClicked = async () => {
    await toggleTaskCompletion({ taskId: userTask._id });
  };

  return (
    <div className="w-full">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <div onClick={() => setDialogOpen(true)}>
            <UserTaskTileTrigger
              userTask={userTask}
              recentlyCompleted={recentlyCompleted}
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
