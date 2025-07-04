import { proxy, useSnapshot } from "valtio";
import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import type { Doc } from "@packages/backend/convex/_generated/dataModel";
import { api } from "@packages/backend/convex/_generated/api";
import { handleHookMutationError } from "@/utils/handleHookMutationError";

type BulkManageHabitSubmissionsStateType = {
  selectedDates: Date[];
  modalVisible: boolean;
  togglingSubmission: boolean;
};

const bulkManageSubmissionState = proxy<BulkManageHabitSubmissionsStateType>({
  selectedDates: [],
  modalVisible: false,
  togglingSubmission: false,
});

export const useBulkManageHabitSubmissions = () => {
  const $state = useSnapshot(bulkManageSubmissionState);

  const toggleDate = (date: Date) => {
    const index = bulkManageSubmissionState.selectedDates.findIndex(
      (d) => d.getTime() === date.getTime(),
    );

    if (index !== -1) {
      // Already selected — remove it
      bulkManageSubmissionState.selectedDates.splice(index, 1);
    } else {
      // Not selected — add it
      bulkManageSubmissionState.selectedDates.push(date);
    }
  };

  const clearDates = () => {
    bulkManageSubmissionState.selectedDates = [];
  };

  return {
    selectedDates: $state.selectedDates,
    toggleDate,
    clearDates,
    togglingSubmission: $state.togglingSubmission,
  };
};

export const BulkManageToast = ({
  habit,
}: {
  habit: Doc<"userHabits"> | null;
}) => {
  const $state = useSnapshot(bulkManageSubmissionState);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(false);
  const isVisible = $state.selectedDates.length > 0;

  const formattedSelectedDates = useMemo(
    () => $state.selectedDates.map((date) => format(date, "yyyy-MM-dd")),
    [$state.selectedDates],
  );

  const bulkCompleteSubmittedDates = useMutation(
    api.habits.bulkCompleteSelectedDates,
  );
  const bulkUnCompleteSubmittedDates = useMutation(
    api.habits.bulkUnCompleteSelectedDates,
  );

  const clearDates = () => {
    bulkManageSubmissionState.selectedDates = [];
  };

  const handleCompleteSelectedDates = async (
    formattedSelectedDates: string[],
  ) => {
    bulkManageSubmissionState.togglingSubmission = true;
    try {
      if (habit?._id) {
        await bulkCompleteSubmittedDates({
          habitId: habit._id,
          selectedDates: formattedSelectedDates,
        });
      }
    } catch (err) {
      handleHookMutationError(err);
    } finally {
      bulkManageSubmissionState.togglingSubmission = false;
      clearDates();
    }
  };

  const handleUnCompleteSelectedDates = async (
    formattedSelectedDates: string[],
  ) => {
    bulkManageSubmissionState.togglingSubmission = true;
    try {
      if (habit?._id) {
        await bulkUnCompleteSubmittedDates({
          habitId: habit._id,
          selectedDates: formattedSelectedDates,
        });
      }
    } catch (err) {
      handleHookMutationError(err);
    } finally {
      bulkManageSubmissionState.togglingSubmission = false;
      clearDates();
    }
  };

  const handleCompleteAction = async () => {
    if (formattedSelectedDates.length === 0) return;
    if (habit?._id) {
      await handleCompleteSelectedDates(formattedSelectedDates);
    }
  };

  const handleUnCompleteAction = async () => {
    if (formattedSelectedDates.length === 0) return;
    if (habit?._id) {
      await handleUnCompleteSelectedDates(formattedSelectedDates);
    }
  };

  // Animation effect with proper exit animation
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start((finished) => {
        if (finished) {
          setShouldRender(false);
        }
      });
    }
  }, [isVisible, slideAnim]);

  if (!shouldRender) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
      className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg"
    >
      <View className="p-4">
        {/* Header with selected dates count */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-medium text-gray-900 dark:text-white">
            {$state.selectedDates.length} date
            {$state.selectedDates.length > 1 ? "s" : ""} selected
          </Text>

          <TouchableOpacity
            onPress={clearDates}
            className="p-1"
            disabled={$state.togglingSubmission}
          >
            <Feather name="x" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Selected dates display */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <View className="flex-row gap-2">
            {$state.selectedDates.map((date, index) => (
              <View
                key={index}
                className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full"
              >
                <Text className="text-blue-800 dark:text-blue-200 text-xs">
                  {format(date, "MMM d")}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Action buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-green-500 py-3 px-4 rounded-lg flex-row items-center justify-center"
            onPress={handleCompleteAction}
            disabled={$state.togglingSubmission}
          >
            <Feather name="check-square" size={16} color="white" />
            <Text className="text-white font-medium ml-2 text-sm">
              Complete All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-red-500 py-3 px-4 rounded-lg flex-row items-center justify-center"
            onPress={handleUnCompleteAction}
            disabled={$state.togglingSubmission}
          >
            <Feather name="square" size={16} color="white" />
            <Text className="text-white font-medium ml-2 text-sm">
              Uncomplete All
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};
