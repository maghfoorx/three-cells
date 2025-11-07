import { useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface StreaksViewProps {
  habitId: DataModel["userHabits"]["document"]["_id"];
  habitColor: string;
}

const BAR_HEIGHT = 28;
const BAR_PADDING = 12;
const CHART_HEIGHT = 220;

function formatDate(date: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export default function StreaksView({ habitId, habitColor }: StreaksViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const streaksData = useQuery(api.habits.getStreaksData, { habitId });
  const isLoading = streaksData === undefined;

  useEffect(() => {
    if (
      !streaksData ||
      !streaksData.topStreaks.length ||
      !svgRef.current ||
      !containerRef.current
    )
      return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const margin = { top: 10, right: 20, bottom: 10, left: 20 };
    const width = containerWidth - margin.left - margin.right;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", CHART_HEIGHT)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const { topStreaks } = streaksData;
    const maxStreak = Math.max(...topStreaks.map((s) => s.length));

    // Scale for bar widths (leave space for labels)
    const barMaxWidth = width - 150;
    const widthScale = d3
      .scaleLinear()
      .domain([0, maxStreak])
      .range([0, barMaxWidth]);

    // Create bars
    topStreaks.forEach((streak, index) => {
      const y = index * (BAR_HEIGHT + BAR_PADDING);
      const barWidth = widthScale(streak.length);
      const isCurrentStreak = streak.isCurrentStreak;

      // Bar background for animation
      svg
        .append("rect")
        .attr("x", 0)
        .attr("y", y)
        .attr("width", barWidth)
        .attr("height", BAR_HEIGHT)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", isCurrentStreak ? habitColor : habitColor)
        .attr("opacity", isCurrentStreak ? 1 : 0.6)
        .attr("width", 0)
        .transition()
        .delay(index * 100)
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr("width", barWidth);

      // Streak length label
      svg
        .append("text")
        .attr("x", barWidth + 12)
        .attr("y", y + BAR_HEIGHT / 2)
        .attr("font-size", "14px")
        .attr("font-weight", "600")
        .attr("fill", "#374151")
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "middle")
        .style("opacity", 0)
        .text(`${streak.length} day${streak.length !== 1 ? "s" : ""}`)
        .transition()
        .delay(index * 100 + 400)
        .duration(400)
        .style("opacity", 1);

      // Date range label
      const startDate = formatDate(new Date(streak.startDate));
      const endDate = formatDate(new Date(streak.endDate));
      const dateText = `${startDate} - ${endDate}${isCurrentStreak ? " (current)" : ""}`;

      svg
        .append("text")
        .attr("x", barWidth + 12)
        .attr("y", y + BAR_HEIGHT / 2 + 16)
        .attr("font-size", "11px")
        .attr("fill", "#9CA3AF")
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "middle")
        .style("opacity", 0)
        .text(dateText)
        .transition()
        .delay(index * 100 + 400)
        .duration(400)
        .style("opacity", 1);
    });
  }, [streaksData, habitColor]);

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-7 flex-1" />
              <Skeleton className="h-7 w-20" />
            </div>
          ))}
        </div>
      );
    }

    if (!streaksData || streaksData.topStreaks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-8">
          <p className="text-gray-400 text-sm">No streaks yet</p>
          <p className="text-gray-300 text-xs mt-1">
            Start building your first streak!
          </p>
        </div>
      );
    }

    return (
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full max-w-full" />
      </div>
    );
  };

  return (
    <Card className="rounded-sm gap-2">
      <CardHeader className="px-4">
        <CardTitle className="text-lg">Streaks</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {/* Current Streak Display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 sm:p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Current streak</p>
              {isLoading ? (
                <Skeleton className="h-10 w-16 mb-1" />
              ) : (
                <p
                  className="text-3xl sm:text-4xl font-bold"
                  style={{
                    color: habitColor,
                  }}
                >
                  {streaksData?.currentStreak || 0}
                </p>
              )}
            </div>

            {!isLoading && streaksData?.isCurrentStreakActive && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 hover:bg-green-100"
              >
                Active
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Top 5 Streaks Chart */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Top streaks
          </h3>
          <div className="h-full">{renderChart()}</div>
        </div>
      </CardContent>
    </Card>
  );
}
