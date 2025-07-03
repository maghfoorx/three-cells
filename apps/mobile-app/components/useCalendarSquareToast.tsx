import { proxy, useSnapshot } from "valtio";
import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { api } from "@packages/backend/convex/_generated/api";
import { handleHookMutationError } from "@/utils/handleHookMutationError";

type Habit = DataModel["userHabits"]["document"];
type Submission = DataModel["userHabitSubmissions"]["document"];

// Calendar Square Info Modal Hook
export const useCalendarSquareInfo = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    date: Date;
    habit: Habit;
    submissions: Submission[];
  } | null>(null);

  const showInfo = ({
    date,
    habit,
    submissions,
  }: {
    date: Date;
    habit: Habit;
    submissions: Submission[];
  }) => {
    setModalData({ date, habit, submissions });
    setModalVisible(true);
  };

  const hideInfo = () => {
    setModalVisible(false);
    setModalData(null);
  };

  const InfoModal = () => {
    if (!modalData) return null;

    const completed =
      modalData.habit.type === "yes_no" && modalData.submissions.length > 0;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideInfo}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={hideInfo}
        >
          <TouchableOpacity
            className="bg-white dark:bg-gray-800 mx-4 p-6 rounded-xl shadow-lg"
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row items-center mb-4">
              <View className="mr-3">
                <Feather
                  name={completed ? "check-square" : "square"}
                  size={24}
                  color={completed ? "#10b981" : "#6b7280"}
                />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  {format(modalData.date, "EEEE, d MMM yyyy")}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {completed
                    ? "You completed this habit 🎉"
                    : "You didn't complete this habit 😔"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="bg-blue-500 py-3 px-6 rounded-lg"
              onPress={hideInfo}
            >
              <Text className="text-white text-center font-medium">Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  return {
    onPress: showInfo,
    InfoModal,
  };
};

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

export const useBulkManageHabitSubmissions = ({
  habit,
}: {
  habit?: DataModel["userHabits"]["document"];
}) => {
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

    // Show/hide modal based on selection
    if (bulkManageSubmissionState.selectedDates.length === 0) {
      hideBulkModal();
    } else {
      showBulkModal();
    }
  };

  const clearDates = () => {
    bulkManageSubmissionState.selectedDates = [];
    hideBulkModal();
  };

  const showBulkModal = () => {
    if (bulkManageSubmissionState.selectedDates.length > 0) {
      bulkManageSubmissionState.modalVisible = true;
    }
  };

  const hideBulkModal = () => {
    bulkManageSubmissionState.modalVisible = false;
  };

  const bulkCompleteSubmittedDates = useMutation(
    api.habits.bulkCompleteSelectedDates,
  );
  const bulkUnCompleteSubmittedDates = useMutation(
    api.habits.bulkUnCompleteSelectedDates,
  );

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

  const BulkManageModal = () => {
    const formattedSelectedDates = useMemo(
      () => $state.selectedDates.map((date) => format(date, "yyyy-MM-dd")),
      [$state.selectedDates],
    );

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

    const showActionSheet = () => {
      Alert.alert("Bulk Actions", "Choose an action for the selected dates", [
        {
          text: "Complete All",
          onPress: handleCompleteAction,
        },
        {
          text: "Uncomplete All",
          onPress: handleUnCompleteAction,
          style: "destructive",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={$state.modalVisible}
        onRequestClose={clearDates}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={clearDates}
        >
          <TouchableOpacity
            className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 shadow-lg"
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-4" />

            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {$state.selectedDates.length} date
                {$state.selectedDates.length > 1 ? "s" : ""} selected
              </Text>

              {/* Show selected dates */}
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
            </View>

            <View className="gap-3">
              <TouchableOpacity
                className="bg-green-500 py-4 px-6 rounded-xl flex-row items-center justify-center"
                onPress={handleCompleteAction}
                disabled={$state.togglingSubmission}
              >
                <Feather name="check-square" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Complete All Tasks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-red-500 py-4 px-6 rounded-xl flex-row items-center justify-center"
                onPress={handleUnCompleteAction}
                disabled={$state.togglingSubmission}
              >
                <Feather name="square" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Uncomplete All Tasks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-200 dark:bg-gray-700 py-4 px-6 rounded-xl"
                onPress={clearDates}
              >
                <Text className="text-gray-800 dark:text-gray-200 font-medium text-center">
                  Clear Selection
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  return {
    selectedDates: $state.selectedDates,
    toggleDate,
    clearDates,
    togglingSubmission: $state.togglingSubmission,
    BulkManageModal,
  };
};
