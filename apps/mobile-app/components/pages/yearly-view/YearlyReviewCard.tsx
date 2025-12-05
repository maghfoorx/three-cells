import React from "react";
import { View, Text, Image } from "react-native";
import { SCORE_COLORS, MOOD_IMAGES } from "@/utils/types";

interface YearlyReviewCardProps {
    year: string;
    scoreCounts: Record<number, number>;
}

export function YearlyReviewCard({ year, scoreCounts }: YearlyReviewCardProps) {
    const scores = [-2, -1, 0, 1, 2];
    const totalEntries = Object.values(scoreCounts).reduce((a, b) => a + b, 0);
    const maxCount = Math.max(...Object.values(scoreCounts), 1);

    return (
        <View
            className="bg-white rounded-md shadow-sm mb-4 mx-4 mt-4"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
            }}
        >
            <View className="px-4 py-4 border-b border-gray-100">
                <Text className="text-xs font-semibold text-gray-900 uppercase">
                    {year} OVERVIEW
                </Text>
            </View>
            <View className="p-4 gap-3">
                {scores.map((score) => {
                    const count = scoreCounts[score] || 0;
                    const barWidth = (count / maxCount) * 100;

                    return (
                        <View key={score} className="flex-row items-center gap-2">
                            <Image
                                source={MOOD_IMAGES[score.toString() as keyof typeof MOOD_IMAGES]}
                                style={{ width: 20, height: 20 }}
                            />
                            <View className="flex-1 h-6 bg-gray-100 rounded-sm overflow-hidden relative flex-row">
                                <View
                                    className="h-full rounded-sm"
                                    style={{
                                        width: `${barWidth}%`,
                                        backgroundColor: SCORE_COLORS[score.toString()],
                                    }}
                                />
                            </View>
                            <View className="w-8 items-end">
                                <Text className="text-gray-500 text-xs">{count}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
