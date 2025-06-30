import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import SignOutButton from "@/components/SignOutButton";

const MENU_ITEMS = [
  {
    id: 1,
    title: "Profile Settings",
    subtitle: "Update your personal information",
    icon: "user",
    color: "#3B82F6",
  },
  {
    id: 2,
    title: "Notifications",
    subtitle: "Manage your notification preferences",
    icon: "bell",
    color: "#10B981",
  },
  {
    id: 3,
    title: "Export Data",
    subtitle: "Download your habits and journal data",
    icon: "download",
    color: "#8B5CF6",
  },
  {
    id: 4,
    title: "Privacy Policy",
    subtitle: "Read our privacy policy",
    icon: "shield",
    color: "#F59E0B",
  },
  {
    id: 5,
    title: "Terms of Service",
    subtitle: "Read our terms of service",
    icon: "file-text",
    color: "#EF4444",
  },
  {
    id: 6,
    title: "Help & Support",
    subtitle: "Get help or contact support",
    icon: "help-circle",
    color: "#06B6D4",
  },
];

export default function AccountPage() {
  const user = useQuery(api.auth.viewer);
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
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Header */}
          <View className="px-6 pt-6 pb-6">
            <Text className="text-3xl font-bold text-gray-900">Account</Text>
            <Text className="text-gray-600 mt-1">
              Manage your profile and settings
            </Text>
          </View>

          {/* User Info Card */}
          <View className="px-6 pb-6">
            <View className="bg-gray-50 rounded-2xl p-6">
              <View className="flex-row items-center gap-4">
                <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center">
                  <Text className="text-white text-xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-semibold text-gray-900">
                    {user?.name || "User"}
                  </Text>
                  <Text className="text-gray-600 mt-1">
                    {user?.email || "user@example.com"}
                  </Text>
                </View>
                <TouchableOpacity className="p-2">
                  <Feather name="edit-2" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
