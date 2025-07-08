import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
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
  const toggleTaskCompletion = useMutation(api.tasks.toggleUserTaskCompletion);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteButtonClicked = async () => {
    setIsLoading(true);
    try {
      await deleteUserTask({
        taskId: userTask._id,
      });
      setDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCompletionButtonClicked = async () => {
    setIsLoading(true);
    try {
      await toggleTaskCompletion({ taskId: userTask._id });
      setDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
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
          className="flex-1 bg-black/50 justify-center items-center p-6"
          onPress={() => setDialogOpen(false)}
        >
          <Pressable
            className="bg-white rounded-3xl p-8 w-full max-w-md"
            onPress={(e) => e.stopPropagation()}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.25,
              shadowRadius: 25,
              elevation: 25,
            }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-start mb-6">
              <Text className="text-xl font-bold text-gray-900 flex-1 pr-4 leading-7">
                {userTask.title}
              </Text>
              <TouchableOpacity
                onPress={() => setDialogOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center"
              >
                <Feather name="x" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {userTask.description && (
              <View className="mb-8">
                <Text className="text-gray-600 text-base leading-6">
                  {userTask.description}
                </Text>
              </View>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-red-500 py-4 px-6 rounded-md flex-row items-center justify-center gap-2"
                onPress={handleDeleteButtonClicked}
                disabled={isLoading}
                style={{
                  shadowColor: "#EF4444",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Feather name="trash-2" size={18} color="white" />
                    <Text className="text-white text-base font-semibold">
                      Delete
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-blue-500 py-4 px-6 rounded-md flex-row items-center justify-center gap-2"
                onPress={handleToggleCompletionButtonClicked}
                disabled={isLoading}
                style={{
                  shadowColor: "#3B82F6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Feather
                      name={userTask?.is_completed ? "rotate-ccw" : "check"}
                      size={18}
                      color="white"
                    />
                    <Text className="text-white text-base font-semibold">
                      {userTask?.is_completed ? "Reopen" : "Complete"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default UserTaskTile;
