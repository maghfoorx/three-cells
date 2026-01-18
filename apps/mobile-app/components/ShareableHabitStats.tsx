import React, { useMemo, forwardRef, useEffect } from "react";
import { View } from "react-native";
import {
    Canvas,
    Rect,
    Text,
    LinearGradient,
    vec,
    matchFont,
    RoundedRect,
    Group,
} from "@shopify/react-native-skia";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
import Color from "color";
import { subDays, format } from "date-fns";
import {
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    useDerivedValue,
} from "react-native-reanimated";

interface ShareableHabitStatsProps {
    habit: DataModel["userHabits"]["document"];
    allSubmissions: DataModel["userHabitSubmissions"]["document"][];
    width?: number;
    height?: number;
}

const PADDING = 24;
const GRID_GAP = 8;
const COLS = 7;
const CELL_SIZE = 28;

// Helper to strip emojis and other non-standard chars
const stripEmojis = (str: string) => {
    return str
        .replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F200}-\u{1F2FF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2000}-\u{206F}\u{2B50}\u{231A}\u{231B}\u{2328}\u{23CF}\u{2300}-\u{23FF}]/gu, '')
        .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '') // Keep Letter, Number, Punctuation, Separator
        .trim();
};

export const ShareableHabitStats = forwardRef<any, ShareableHabitStatsProps>(
    ({ habit, allSubmissions, width = 320, height = 420 }, ref) => {
        const streakData = useQuery(api.habits.getStreaksData, { habitId: habit._id });

        // Animation for glow
        const shimmer = useSharedValue(-1);

        useEffect(() => {
            shimmer.value = withRepeat(
                withTiming(2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
                -1,
                false
            );
        }, []);

        const shimmerTransform = useDerivedValue(() => {
            return [{ translateX: shimmer.value * width }];
        });

        // Typography
        const titleFont = matchFont({
            fontFamily: "System",
            fontWeight: "bold",
            fontSize: 28,
        });

        const subtitleFont = matchFont({
            fontFamily: "System",
            fontWeight: "bold",
            fontSize: 18,
        });

        const labelFont = matchFont({
            fontFamily: "System",
            fontWeight: "normal",
            fontSize: 14,
        });

        // Process Data
        const stats = useMemo(() => {
            if (!streakData) return { best: 0, current: 0 };
            const best = Math.max(...streakData.topStreaks.map(s => s.length), 0);
            return { best, current: streakData.currentStreak };
        }, [streakData]);

        const heatmapData = useMemo(() => {
            const days = [];
            const today = new Date();
            // Show last 35 days (5 weeks)
            for (let i = 34; i >= 0; i--) {
                const date = subDays(today, i);
                const dateStr = format(date, "yyyy-MM-dd");
                const hasSubmission = allSubmissions.some(s => s.dateFor === dateStr);
                days.push({ date, hasSubmission });
            }
            return days;
        }, [allSubmissions]);

        // Calculate Grid Layout
        const gridWidth = (COLS * CELL_SIZE) + ((COLS - 1) * GRID_GAP);
        const gridStartX = (width - gridWidth) / 2;
        const gridStartY = PADDING + 175; // Adjust Y based on content above

        const cleanName = useMemo(() => stripEmojis(habit.name), [habit.name]);

        if (!titleFont || !subtitleFont || !labelFont) {
            return null;
        }

        // Colors
        const baseColor = habit.colour;
        const darkColor = Color(baseColor).darken(0.3).hex();
        const white = "#FFFFFF";
        const whiteAlpha = "rgba(255, 255, 255, 0.3)";

        return (
            <View style={{ width, height, overflow: 'hidden', borderRadius: 20 }}>
                <Canvas ref={ref} style={{ width, height }}>
                    {/* Background Gradient */}
                    <Rect x={0} y={0} width={width} height={height}>
                        <LinearGradient
                            start={vec(0, 0)}
                            end={vec(width, height)}
                            colors={[baseColor, darkColor]}
                        />
                    </Rect>

                    {/* Title */}
                    <Text
                        x={PADDING}
                        y={PADDING + 28}
                        text={cleanName}
                        font={titleFont}
                        color={white}
                    />

                    {/* Stats Card */}
                    <Group>
                        <RoundedRect
                            x={PADDING}
                            y={PADDING + 50}
                            width={width - PADDING * 2}
                            height={80}
                            r={12}
                            color={whiteAlpha}
                        />

                        {/* Stats Text */}
                        <Text
                            x={PADDING + 16}
                            y={PADDING + 80}
                            text="Best Streak"
                            font={labelFont}
                            color={white}
                        />
                        <Text
                            x={PADDING + 16}
                            y={PADDING + 105}
                            text={`${stats.best} Days`}
                            font={subtitleFont}
                            color={white}
                        />

                        <Text
                            x={width / 2 + 16}
                            y={PADDING + 80}
                            text="Current Streak"
                            font={labelFont}
                            color={white}
                        />
                        <Text
                            x={width / 2 + 16}
                            y={PADDING + 105}
                            text={`${stats.current} Days`}
                            font={subtitleFont}
                            color={white}
                        />
                    </Group>

                    {/* Monthly Performance Heatmap */}
                    <Text
                        x={PADDING}
                        y={PADDING + 160}
                        text="Last 30 Days"
                        font={subtitleFont}
                        color={white}
                    />

                    <Group>
                        {heatmapData.map((day, i) => {
                            const row = Math.floor(i / COLS);
                            const col = i % COLS;
                            const x = gridStartX + col * (CELL_SIZE + GRID_GAP);
                            const y = gridStartY + row * (CELL_SIZE + GRID_GAP);

                            return (
                                <RoundedRect
                                    key={i}
                                    x={x}
                                    y={y}
                                    width={CELL_SIZE}
                                    height={CELL_SIZE}
                                    r={6}
                                    color={day.hasSubmission ? white : whiteAlpha}
                                />
                            );
                        })}
                    </Group>

                    {/* Glow/Shine Overlay */}
                    <Group>
                        <Rect x={0} y={0} width={width} height={height} opacity={0.15}>
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(width * 0.4, height)}
                                colors={["transparent", "white", "transparent"]}
                                positions={[0, 0.5, 1]}
                                transform={shimmerTransform}
                            />
                        </Rect>
                    </Group>
                </Canvas>
            </View>
        );
    }
);
