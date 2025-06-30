import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface Habit {
  id: number;
  name: string;
  streak: number;
  completedToday: boolean;
  color: string;
  icon: string;
}

const SAMPLE_HABITS: Habit[] = [
  {
    id: 1,
    name: "Morning Walk",
    streak: 7,
    completedToday: true,
    color: "#10B981",
    icon: "sunrise",
  },
  {
    id: 2,
    name: "Read 20 Pages",
    streak: 12,
    completedToday: false,
    color: "#3B82F6",
    icon: "book-open",
  },
  {
    id: 3,
    name: "Meditation",
    streak: 5,
    completedToday: true,
    color: "#8B5CF6",
    icon: "heart",
  },
  {
    id: 4,
    name: "Drink Water",
    streak: 3,
    completedToday: false,
    color: "#06B6D4",
    icon: "droplet",
  },
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>(SAMPLE_HABITS);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleHabit = (id: number) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              completedToday: !habit.completedToday,
              streak: !habit.completedToday
                ? habit.streak + 1
                : Math.max(0, habit.streak - 1),
            }
          : habit,
      ),
    );
  };

  const completedToday = habits.filter((habit) => habit.completedToday).length;
  const totalHabits = habits.length;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-gray-900">Habits</Text>
          <Text className="text-gray-600 mt-1">
            {completedToday} of {totalHabits} completed today
          </Text>
        </View>

        {/* Today's Progress */}
        <View className="px-6 pb-6">
          <View className="bg-green-50 rounded-2xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Today's Progress
              </Text>
              <Text className="text-2xl font-bold text-green-600">
                {Math.round((completedToday / totalHabits) * 100)}%
              </Text>
            </View>
            <View className="bg-green-200 rounded-full h-3">
              <View
                className="bg-green-600 rounded-full h-3"
                style={{ width: `${(completedToday / totalHabits) * 100}%` }}
              />
            </View>
          </View>
        </View>

        {/* Habits List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-6"
        >
          <View className="gap-4 pb-8">
            {habits.map((habit) => (
              <Animated.View
                key={habit.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
              >
                <View className="flex-row items-center gap-4">
                  {/* Icon */}
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: habit.color + "20" }}
                  >
                    <Feather
                      name={habit.icon as any}
                      size={20}
                      color={habit.color}
                    />
                  </View>

                  {/* Habit Info */}
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">
                      {habit.name}
                    </Text>
                    <Text className="text-gray-600 mt-1">
                      🔥 {habit.streak} day streak
                    </Text>
                  </View>

                  {/* Completion Button */}
                  <TouchableOpacity
                    onPress={() => toggleHabit(habit.id)}
                    className={`w-12 h-12 rounded-full items-center justify-center ${
                      habit.completedToday
                        ? "bg-green-600"
                        : "border-2 border-gray-300"
                    }`}
                    activeOpacity={0.7}
                  >
                    {habit.completedToday && (
                      <Feather name="check" size={20} color="white" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Week Progress (Placeholder) */}
                <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-100">
                  {WEEKDAYS.map((day, index) => (
                    <View
                      key={index}
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        index < 4
                          ? "bg-gray-200"
                          : index === 4
                            ? "bg-green-600"
                            : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          index === 4 ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {day}
                      </Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Add Habit Button */}
          <TouchableOpacity
            className="bg-gray-100 rounded-2xl p-6 items-center border-2 border-dashed border-gray-300 mb-8"
            activeOpacity={0.7}
          >
            <Feather name="plus" size={24} color="#6B7280" />
            <Text className="text-gray-600 font-medium mt-2">
              Add New Habit
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
