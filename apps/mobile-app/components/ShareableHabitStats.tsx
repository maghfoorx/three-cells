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
import { subDays, format, startOfWeek, addDays, isAfter, startOfDay } from "date-fns";
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

        const cleanName = useMemo(() => stripEmojis(habit.name), [habit.name]);
        const titleFontSize = cleanName.length > 20 ? 20 : cleanName.length > 12 ? 24 : 28;

        // Typography
        const titleFont = matchFont({
            fontFamily: "System",
            fontWeight: "bold",
            fontSize: titleFontSize,
        });

        const subtitleFont = matchFont({
            fontFamily: "System",
            fontWeight: "bold",
            fontSize: 18,
        });

        const labelFont = matchFont({
            fontFamily: "System",
            fontWeight: "normal",
            fontSize: 11,
        });

        const sectionFont = matchFont({
            fontFamily: "System",
            fontWeight: "bold",
            fontSize: 12,
        });

        const weekdayFont = matchFont({
            fontFamily: "System",
            fontWeight: "bold",
            fontSize: 11,
        });

        const footerFont = matchFont({
            fontFamily: "System",
            fontWeight: "bold",
            fontSize: 10,
        });

        // Process Data
        const stats = useMemo(() => {
            if (!streakData) return { best: 0, current: 0, total: 0 };
            const best = Math.max(...streakData.topStreaks.map(s => s.length), 0);
            return {
                best,
                current: streakData.currentStreak,
                total: allSubmissions.length
            };
        }, [streakData, allSubmissions]);

        const heatmapMetrics = useMemo(() => {
            const days = [];
            const today = startOfDay(new Date());

            // Align to weeks (Monday start)
            // We want 5 rows (35 days), ending with the current week
            // So start is 4 weeks ago's Monday
            const startDate = startOfWeek(subDays(today, 28), { weekStartsOn: 1 });

            let successfulDays = 0;
            let totalPastDays = 0;

            for (let i = 0; i < 35; i++) {
                const date = addDays(startDate, i);
                const dateStr = format(date, "yyyy-MM-dd");
                const isFuture = isAfter(date, today);

                const hasSubmission = allSubmissions.some(s => s.dateFor === dateStr);

                if (!isFuture) {
                    totalPastDays++;
                    if (hasSubmission) successfulDays++;
                }

                days.push({ date, hasSubmission, isFuture });
            }

            const consistency = totalPastDays > 0 ? Math.round((successfulDays / totalPastDays) * 100) : 0;

            // Date range string
            const rangeStr = `${format(startDate, "MMM d").toUpperCase()} - ${format(subDays(days[34].date, days[34].isFuture ? 0 : 0), "MMM d").toUpperCase()}`;

            return { days, consistency, rangeStr };
        }, [allSubmissions]);

        // Calculate Grid Layout
        // Add extra space for weekday headers
        const HEADER_HEIGHT = 15;
        const gridWidth = (COLS * CELL_SIZE) + ((COLS - 1) * GRID_GAP);
        const gridStartX = (width - gridWidth) / 2;
        const gridStartY = PADDING + 175 + HEADER_HEIGHT;

        // Weekday labels
        const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

        if (!titleFont || !subtitleFont || !labelFont || !sectionFont || !weekdayFont || !footerFont) {
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
                            text="BEST STREAK"
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
                            text="TOTAL ENTRIES"
                            font={labelFont}
                            color={white}
                        />
                        <Text
                            x={width / 2 + 16}
                            y={PADDING + 105}
                            text={`${stats.total}`}
                            font={subtitleFont}
                            color={white}
                        />
                    </Group>

                    {/* Monthly Performance Heatmap */}
                    <Text
                        x={PADDING + 8}
                        y={PADDING + 160}
                        text={`${heatmapMetrics.rangeStr} • ${heatmapMetrics.consistency}%`}
                        font={sectionFont}
                        color={white}
                    />

                    {/* Weekday Headers */}
                    <Group>
                        {weekDays.map((day, i) => {
                            const x = gridStartX + i * (CELL_SIZE + GRID_GAP) + (CELL_SIZE / 2) - 4; // Center roughly
                            const y = PADDING + 160 + 20; // Below header
                            return (
                                <Text
                                    key={i}
                                    x={x}
                                    y={y}
                                    text={day}
                                    font={weekdayFont}
                                    color={white}
                                    opacity={0.8}
                                />
                            );
                        })}
                    </Group>

                    <Group>
                        {heatmapMetrics.days.map((day, i) => {
                            const row = Math.floor(i / COLS);
                            const col = i % COLS;
                            const x = gridStartX + col * (CELL_SIZE + GRID_GAP);
                            const y = gridStartY + row * (CELL_SIZE + GRID_GAP);

                            // Visuals for future days
                            if (day.isFuture) {
                                return (
                                    <RoundedRect
                                        key={i}
                                        x={x}
                                        y={y}
                                        width={CELL_SIZE}
                                        height={CELL_SIZE}
                                        r={6}
                                        color={whiteAlpha}
                                        opacity={0.15} // Very subtle for future
                                    />
                                );
                            }

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

                    {/* Footer */}
                    <Text
                        x={width / 2 - 40} // Approximate centering
                        y={height - 12}
                        text="THREE CELLS APP"
                        font={footerFont}
                        color={whiteAlpha}
                    />
                </Canvas>
            </View>
        );
    }
);
