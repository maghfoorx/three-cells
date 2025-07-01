import { api } from "@packages/backend/convex/_generated/api";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
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

// Simple checkbox component since React Native doesn't have a built-in one
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
    className={`w-5 h-5 border-2 border-gray-600 rounded-sm justify-center items-center ${
      checked ? "bg-blue-500" : "bg-white"
    }`}
  >
    {checked && <Text className="text-white text-xs font-bold">✓</Text>}
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
        className="text-base font-medium text-gray-800 bg-transparent"
        style={{ textDecorationLine: completed ? "line-through" : "none" }}
      />
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled}>
      <Text
        className="text-base font-medium text-gray-800"
        style={{ textDecorationLine: completed ? "line-through" : "none" }}
      >
        {value}
      </Text>
    </TouchableOpacity>
  );
};

export default function UserTaskTileTrigger({
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
  const opacity = useSharedValue(userTask.is_completed ? 0.6 : 1);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, { duration: 200 }),
  }));

  useEffect(() => {
    opacity.value = userTask.is_completed ? 0.6 : 1;
  }, [userTask.is_completed]);

  return (
    <Animated.View
      style={animatedStyle}
      className={`flex-col gap-2 p-3 rounded-sm shadow-md ${
        recentlyCompleted ? "bg-green-200" : "bg-sky-300"
      }`}
    >
      {/* Checkbox with loading animation */}
      <View className="h-5 w-5">
        <Animated.View
        // entering={FadeInOut}
        // exiting={FadeInOut}
        >
          {isTogglingTask ? (
            <ActivityIndicator size="small" color="#374151" />
          ) : (
            <Checkbox
              checked={userTask.is_completed}
              onPress={handleCheckboxClicked}
            />
          )}
        </Animated.View>
      </View>

      {/* Title and Description */}
      <View>
        <EditableText
          value={taskTitle}
          onCancel={() => setTaskTitle(userTask.title)}
          onChange={(value) => setTaskTitle(value)}
          onConfirm={handleTaskTitleEditConfirmed}
          disabled={userTask.is_completed}
          completed={userTask.is_completed}
        />

        {userTask.description && (
          <Text className="text-xs text-gray-600 mt-1">
            {userTask.description}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}
