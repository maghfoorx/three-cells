import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
// import { Trash, ClipboardCheck, X } from "lucide-react-native";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import UserTaskTileTrigger from "./UserTaskTriggerMobile";
import { Feather } from "@expo/vector-icons";

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
  const handleToggleCompletionButtonClicked = async () => {
    await toggleTaskCompletion({ taskId: userTask._id });
  };

  return (
    <View className="w-full">
      <TouchableOpacity onPress={() => setDialogOpen(true)} activeOpacity={0.7}>
        <UserTaskTileTrigger
          userTask={userTask}
          recentlyCompleted={recentlyCompleted}
        />
      </TouchableOpacity>

      <Modal
        visible={dialogOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDialogOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center p-4"
          onPress={() => setDialogOpen(false)}
        >
          <Pressable
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold flex-1 pr-4">
                {userTask.title}
              </Text>
              <TouchableOpacity
                onPress={() => setDialogOpen(false)}
                className="p-1"
              >
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Description */}
            {userTask.description && (
              <Text className="text-gray-600 mt-4">{userTask.description}</Text>
            )}

            {/* Action Buttons */}
            <View className="flex-row justify-end gap-2 mt-6">
              <TouchableOpacity
                className="bg-red-500 px-4 py-2 rounded-md flex-row items-center gap-2"
                onPress={handleDeleteButtonClicked}
              >
                <Feather name="trash" size={16} color="white" />
                <Text className="text-white text-sm font-medium">Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-blue-500 px-4 py-2 rounded-md flex-row items-center gap-2"
                onPress={handleToggleCompletionButtonClicked}
              >
                <Feather name="clipboard" size={16} color="white" />
                <Text className="text-white text-sm font-medium">
                  {userTask?.is_completed ? "Back to draft" : "Complete"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default UserTaskTile;
