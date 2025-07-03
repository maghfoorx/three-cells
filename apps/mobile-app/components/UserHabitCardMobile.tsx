import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";
import color from "color";
import { useMutation, useQuery } from "convex/react";
import { Feather } from "@expo/vector-icons";
import { useMemo, useState, useCallback } from "react";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { api } from "@packages/backend/convex/_generated/api";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { Link } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { handleHookMutationError } from "@/utils/handleHookMutationError";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export function UserHabitCard({
  habit,
}: {
  habit: DataModel["userHabits"]["document"];
}) {
  const { start, end, dates } = useMemo(() => {
    const rawEnd = new Date();
    const rawStart = addDays(rawEnd, -6);
    const dates = Array.from({ length: 7 }, (_, i) => addDays(rawStart, i));
    return {
      start: startOfDay(rawStart),
      end: endOfDay(rawEnd),
      dates,
    };
  }, []);

  const submissionsForHabit = useQuery(api.habits.getSubmissionsForHabit, {
    habitId: habit._id,
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  });

  const habitCardColour = useMemo(() => {
    return color(habit.colour).mix(color("white")).hex();
  }, [habit.colour]);

  return (
    <View
      className="rounded border shadow-sm p-4 flex flex-col gap-4"
      style={{
        backgroundColor: habitCardColour,
      }}
    >
      <View className="flex flex-row justify-between items-center">
        <Link href={`/habits/${habit._id}`} asChild>
          <Pressable className="flex flex-row items-center gap-2">
            <View
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: habit.colour }}
            />
            <Text className="text-sm font-medium text-gray-800">
              {habit.name}
            </Text>
          </Pressable>
        </Link>
      </View>

      <View className="flex flex-row justify-between gap-2">
        {dates.map((date) => {
          return (
            <HabitDateButton
              key={date.getTime()}
              habitId={habit._id}
              date={date}
              submissions={submissionsForHabit?.lastXDaysSubmissions}
            />
          );
        })}
      </View>

      {submissionsForHabit?.currentMonthPerformancePercentage != null &&
        submissionsForHabit?.lastXDaysSubmissions != null && (
          <View>
            <Text className="text-sm text-gray-700">
              {submissionsForHabit?.lastXDaysSubmissions?.length}/{dates.length}{" "}
              days • {submissionsForHabit?.currentMonthPerformancePercentage}%
              this month
            </Text>
          </View>
        )}
    </View>
  );
}

type HabitDateButtonProps = {
  date: Date;
  habitId: DataModel["userHabits"]["document"]["_id"];
  submissions?: DataModel["userHabitSubmissions"]["document"][];
};

const HabitDateButton = ({
  date,
  habitId,
  submissions,
}: HabitDateButtonProps) => {
  const [isToggling, setIsToggling] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const toggleYesNoHabitSubmission = useMutation(
    api.habits.toggleYesNoHabitSubmission,
  );

  const toggleSubmission = useCallback(async () => {
    setIsToggling(true);

    // Animate button press
    scale.value = withSpring(0.9, { duration: 100 }, () => {
      scale.value = withSpring(1);
    });

    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      await toggleYesNoHabitSubmission({ habitId, dateFor: formattedDate });
    } catch (err) {
      handleHookMutationError(err);
    } finally {
      setIsToggling(false);
    }
  }, [date, habitId, toggleYesNoHabitSubmission, scale]);

  const isChecked = submissions?.some((s) =>
    isSameDay(new Date(s.dateFor), date),
  );

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isChecked ? 1 : 0.8, {
            stiffness: 300,
            damping: 20,
          }),
        },
      ],
      opacity: withTiming(1, { duration: 200 }),
    };
  });

  return (
    <View className="flex flex-col items-center flex-1">
      <Text className="text-sm font-semibold uppercase text-gray-800">
        {format(date, "EEE")}
      </Text>
      <Text className="text-xs font-thin text-gray-500">
        {format(date, "d")}
      </Text>

      <AnimatedTouchableOpacity
        className="rounded p-2 mt-2 items-center justify-center min-h-[40px] min-w-[40px]"
        onPress={toggleSubmission}
        style={buttonAnimatedStyle}
        activeOpacity={0.7}
      >
        <AnimatedView style={iconAnimatedStyle}>
          {isToggling ? (
            <Feather name="loader" size={24} />
          ) : isChecked ? (
            <Feather name="check" color={"green"} size={24} />
          ) : (
            <Feather name="x" color={"red"} size={24} />
          )}
        </AnimatedView>
      </AnimatedTouchableOpacity>
    </View>
  );
};

UserHabitCard.Skeleton = () => {
  return (
    <AnimatedView className="rounded border shadow-sm p-4 flex flex-col gap-4 bg-gray-100">
      <View className="h-6 w-48 bg-gray-300 rounded" />
      <View className="flex flex-row justify-between gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} className="flex-1">
            <View className="h-10 bg-gray-300 rounded" />
          </View>
        ))}
      </View>
      <View className="h-6 w-48 bg-gray-300 rounded" />
    </AnimatedView>
  );
};

export default UserHabitCard;
