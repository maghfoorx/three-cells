import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import Svg, { Rect, Text as SvgText, G } from "react-native-svg";
import { View, Text, Image, Animated, ActivityIndicator } from "react-native";
import { SCORE_COLORS, MOOD_IMAGES } from "@/utils/types";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

interface YearlyReviewCardProps {
    year: string;
    scoreCounts: Record<number, number>;
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CONTAINER_PADDING = 16;
const BAR_PADDING = 8;
const BAR_HEIGHT = 24;
const CHART_HEIGHT = 180; // Enough for 5 bars + spacing

export function YearlyReviewCard({ year, scoreCounts }: YearlyReviewCardProps) {
    const [containerWidth, setContainerWidth] = useState(300); // Default fallback

    const animatedValue = useRef(new Animated.Value(0)).current;
    const scoresForYear = useQuery(api.threeCells.overallViewOfYear, { year });

    const isLoading = scoresForYear === undefined;

    const chartWidth = containerWidth - CONTAINER_PADDING;

    // Handle container layout to get actual width
    const handleLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
    };

    // Animation effect - trigger when data loads
    useEffect(() => {
        if (scoresForYear != null) {
            animatedValue.setValue(0);
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 500,
                useNativeDriver: false,
            }).start();
        }
    }, [animatedValue, scoresForYear]);

    const scores = [-2, -1, 0, 1, 2];
    const maxCount = Math.max(...Object.values(scoreCounts), 1);

    const renderStreaksChart = () => {
        if (isLoading) {
            return (
                <View className="items-center justify-center h-full">
                    <ActivityIndicator size="small" />
                </View>
            );
        }

        // Define the scores order we want to display
        const orderedScores = [-2, -1, 0, 1, 2];

        // Calculate max count for scaling
        const counts = Object.values(scoresForYear || {});
        const maxCount = counts.length > 0 ? Math.max(...counts) : 1;

        // Layout constants
        const LABEL_WIDTH = 24; // Space for -2, +2 etc
        const RIGHT_PADDING = 80; // Space for "N days" label
        const barMaxWidth = chartWidth - LABEL_WIDTH - RIGHT_PADDING;

        const widthScale = d3
            .scaleLinear()
            .domain([0, maxCount])
            .range([0, barMaxWidth]);

        return (
            <Svg width={chartWidth} height={CHART_HEIGHT}>
                {orderedScores.map((score, index) => {
                    const count = scoresForYear?.[score] || 0;
                    const y = index * (BAR_HEIGHT + BAR_PADDING) + 10;
                    const barWidth = widthScale(count);

                    const barColor = SCORE_COLORS[score.toString()] || "#ccc";
                    const scoreLabel = score > 0 ? `+${score}` : `${score}`;

                    return (
                        <G key={score}>
                            {/* Score Label on Left */}
                            <SvgText
                                x={0}
                                y={y + BAR_HEIGHT / 2 + 1}
                                fontSize="14"
                                fontWeight="600"
                                fill="#374151"
                                textAnchor="start"
                                alignmentBaseline="middle"
                            >
                                {scoreLabel}
                            </SvgText>

                            {/* Animated Bar */}
                            <AnimatedRect
                                x={LABEL_WIDTH}
                                y={y}
                                width={animatedValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, Math.max(barWidth, 4)], // Min width for visibility if desired, or 0
                                })}
                                height={BAR_HEIGHT}
                                fill={barColor}
                                rx={4}
                                ry={4}
                            />

                            {/* Count label on Right */}
                            <SvgText
                                x={LABEL_WIDTH + barWidth + 10}
                                y={y + BAR_HEIGHT / 2 + 1}
                                fontSize="14"
                                fontWeight="600"
                                fill="#374151"
                                textAnchor="start"
                                alignmentBaseline="middle"
                            >
                                {count} day{count !== 1 ? "s" : ""}
                            </SvgText>
                        </G>
                    );
                })}
            </Svg>
        );
    };

    return (
        <View className="mx-4 my-4 bg-white rounded-md shadow-sm" onLayout={handleLayout}>
            {/* Top 5 Streaks Chart */}
            <View className="mb-2">
                <View className="px-4 py-4 border-b border-gray-100">
                    <Text className="text-xs font-semibold text-gray-900 uppercase">
                        {year} overview
                    </Text>
                </View>
                <View style={{ height: CHART_HEIGHT }}>{renderStreaksChart()}</View>
            </View>
        </View>
    );
}
