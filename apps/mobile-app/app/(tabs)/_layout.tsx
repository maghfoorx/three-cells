import { Tabs } from "expo-router";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import {
  CheckBadgeIcon as CheckBadgeIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  PencilIcon as PencilSolidIcon,
} from "react-native-heroicons/solid";
import {
  CheckBadgeIcon,
  UserCircleIcon,
  ChartBarIcon,
  PencilIcon,
} from "react-native-heroicons/outline";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="track"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, size, focused }) => {
            const IconToUse = focused ? PencilSolidIcon : PencilIcon;
            return <IconToUse size={24} color={focused ? "black" : "gray"} />;
          },
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size, focused }) => {
            const IconToUse = focused ? CheckBadgeIconSolid : CheckBadgeIcon;
            return <IconToUse size={24} color={focused ? "black" : "gray"} />;
          },
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: "Habits",

          tabBarIcon: ({ color, size, focused }) => {
            const IconToUse = focused ? ChartBarIconSolid : ChartBarIcon;
            return <IconToUse size={24} color={focused ? "black" : "gray"} />;
          },
        }}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          title: "Metrics",

          tabBarIcon: ({ color, size, focused }) => {
            return (
              <AntDesign
                name={focused ? "areachart" : "linechart"}
                size={24}
                color={focused ? "black" : "gray"}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size, focused }) => {
            const IconToUse = focused ? UserCircleIconSolid : UserCircleIcon;
            return <IconToUse size={24} color={focused ? "black" : "gray"} />;
          },
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
    </Tabs>
  );
}
