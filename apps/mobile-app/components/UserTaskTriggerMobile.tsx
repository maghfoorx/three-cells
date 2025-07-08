import { Feather } from "@expo/vector-icons";
import { api } from "@packages/backend/convex/_generated/api";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
import clsx from "clsx";
import { useMutation } from "convex/react";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const Checkbox = ({
  checked,
  onPress,
  disabled = false,
}: {
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`w-6 h-6 border-2 rounded-lg justify-center items-center ${
      checked ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"
    }`}
    style={{
      shadowColor: checked ? "#3B82F6" : "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: checked ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    }}
  >
    {checked && <Feather name="check" size={14} color="white" />}
  </TouchableOpacity>
);

// Editable text component
const EditableText = ({
  value,
  onConfirm,
  onCancel,
  onChange,
  disabled,
  completed,
}: {
  value: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  onChange: (value: string) => void;
  disabled: boolean;
  completed: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handlePress = () => {
    if (!disabled) {
      setIsEditing(true);
      setEditValue(value);
    }
  };

  const handleConfirm = () => {
    if (editValue.trim().length < 1) {
      Alert.alert("Error", "Title cannot be empty");
      setEditValue(value);
      setIsEditing(false);
      onCancel();
      return;
    }
    onConfirm(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    onCancel();
  };

  if (isEditing) {
    return (
      <TextInput
        value={editValue}
        onChangeText={(text) => {
          setEditValue(text);
          onChange(text);
        }}
        onBlur={handleConfirm}
        onSubmitEditing={handleConfirm}
        multiline
        autoFocus
        className="text-base font-medium text-gray-900 bg-transparent"
        style={{ textDecorationLine: completed ? "line-through" : "none" }}
      />
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled}>
      <Text
        className={`text-base font-medium ${completed ? "text-gray-500" : "text-gray-900"}`}
        style={{ textDecorationLine: completed ? "line-through" : "none" }}
      >
        {value}
      </Text>
    </TouchableOpacity>
  );
};

const UserTaskTileTrigger = ({
  userTask,
  recentlyCompleted,
}: {
  userTask: DataModel["user_tasks"]["document"];
  recentlyCompleted: boolean;
}) => {
  const toggleTaskCompletion = useMutation(api.tasks.toggleUserTaskCompletion);
  const [taskTitle, setTaskTitle] = useState(userTask.title);
  const [isTogglingTask, setIsTogglingTask] = useState(false);

  const handleCheckboxClicked = async () => {
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
      Alert.alert("Error", "Title cannot be empty");
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

  // Animated opacity for completed tasks
  const opacity = useSharedValue(userTask.is_completed ? 0.7 : 1);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, { duration: 200 }),
  }));

  React.useEffect(() => {
    opacity.value = userTask.is_completed ? 0.7 : 1;
  }, [userTask.is_completed]);

  React.useEffect(() => {
    setTaskTitle(userTask.title);
  }, [userTask]);

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        },
      ]}
      className={clsx("flex-row items-center gap-4 p-5 rounded-md border", {
        "bg-green-50 border-green-200": recentlyCompleted,
        "bg-gray-50 border-gray-200":
          !recentlyCompleted && userTask.is_completed,
        "bg-white border-gray-100":
          !recentlyCompleted && !userTask.is_completed,
      })}
    >
      {/* Checkbox with loading animation */}
      <View className="pt-1">
        {isTogglingTask ? (
          <View className="w-6 h-6 justify-center items-center">
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        ) : (
          <Checkbox
            checked={userTask.is_completed}
            onPress={handleCheckboxClicked}
          />
        )}
      </View>

      {/* Title and Description */}
      <View className="flex-1">
        <EditableText
          value={taskTitle}
          onCancel={() => setTaskTitle(userTask.title)}
          onChange={(value) => setTaskTitle(value)}
          onConfirm={handleTaskTitleEditConfirmed}
          disabled={userTask.is_completed}
          completed={userTask.is_completed}
        />

        {userTask.description && (
          <Text
            className={`text-sm mt-2 ${userTask.is_completed ? "text-gray-400" : "text-gray-600"}`}
          >
            {userTask.description}
          </Text>
        )}
      </View>

      {/* Status indicator */}
      {recentlyCompleted && (
        <View className="w-3 h-3 bg-green-500 rounded-full mt-2" />
      )}
    </Animated.View>
  );
};

export default UserTaskTileTrigger;
