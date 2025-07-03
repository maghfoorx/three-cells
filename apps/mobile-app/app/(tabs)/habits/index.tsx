import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { Feather } from "@expo/vector-icons";
import CreateNewHabitDialog from "@/components/CreateNewHabitMobile";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import UserHabitCardMobile from "@/components/UserHabitCardMobile";

export default function HabitsPage() {
  const allUserHabits = useQuery(api.habits.getAllUserHabits);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 flex-grow">
        <View className="flex flex-row justify-between">
          <View className="items-left">
            <Text className="text-2xl font-bold text-gray-800">Habits</Text>
          </View>
          <View>
            <CreateNewHabitDialog />
          </View>
        </View>
        <View className="mt-4 flex gap-2">
          {allUserHabits?.map((habit) => {
            return <UserHabitCardMobile key={habit._id} habit={habit} />;
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}
