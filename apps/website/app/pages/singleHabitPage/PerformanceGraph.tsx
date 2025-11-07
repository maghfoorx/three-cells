import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface PerformanceGraphProps {
  habitId: DataModel["userHabits"]["document"]["_id"];
  habitColor: string;
}

export default function PerformanceGraph({
  habitId,
  habitColor,
}: PerformanceGraphProps) {
  const [viewMode, setViewMode] = useState<"weekly" | "monthly" | "yearly">(
    "weekly",
  );
  const [selectedDot, setSelectedDot] = useState<{
    x: number;
    y: number;
    value: number;
    label: string;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const weeklyData = useQuery(api.habits.getWeeklyPerformance, { habitId });
  const monthlyData = useQuery(api.habits.getMonthlyPerformance, { habitId });
  const yearlyData = useQuery(api.habits.getYearlyPerformance, { habitId });

  const currentData =
    viewMode === "weekly"
      ? weeklyData
      : viewMode === "monthly"
        ? monthlyData
        : yearlyData;

  const isLoading = currentData === undefined;

  useEffect(() => {
    if (
      !currentData ||
      currentData.length < 2 ||
      !svgRef.current ||
      !containerRef.current
    )
      return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = 180;
    const margin = { top: 30, right: 20, bottom: 40, left: 20 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Convert timestamps to Date objects
    const dataWithDates = currentData.map((d) => ({
      ...d,
      date: new Date(d.date),
    }));

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dataWithDates, (d) => d.date) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    // Create line generator
    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add gradient for line
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", `line-gradient-${habitId}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", yScale(0))
      .attr("x2", 0)
      .attr("y2", yScale(100));

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", habitColor)
      .attr("stop-opacity", 0.3);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", habitColor)
      .attr("stop-opacity", 0.8);

    // Add area under the line
    const area = d3
      .area<{ date: Date; value: number }>()
      .x((d) => xScale(d.date))
      .y0(height)
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const areaPath = svg
      .append("path")
      .datum(dataWithDates)
      .attr("fill", `url(#line-gradient-${habitId})`)
      .attr("d", area)
      .attr("opacity", 0.2);

    // Add the line path
    const path = svg
      .append("path")
      .datum(dataWithDates)
      .attr("fill", "none")
      .attr("stroke", habitColor)
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Animate the line
    const totalLength = path.node()!.getTotalLength();
    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
      .attr("stroke-dashoffset", 0);

    // Add dots
    const dots = svg
      .selectAll(".dot")
      .data(dataWithDates)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.value))
      .attr("r", 0)
      .attr("fill", habitColor)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        const x = xScale(d.date) + margin.left;
        const y = yScale(d.value) + margin.top;
        setSelectedDot({ x, y, value: d.value, label: d.label });
        d3.select(this).transition().duration(150).attr("r", 6);
      })
      .on("mouseleave", function () {
        setSelectedDot(null);
        d3.select(this).transition().duration(150).attr("r", 4);
      });

    // Animate dots
    dots
      .transition()
      .delay((d, i) => i * 50 + 500)
      .duration(300)
      .attr("r", 4);

    // Add labels for first and last points
    svg
      .append("text")
      .attr("x", xScale(dataWithDates[0].date))
      .attr("y", yScale(dataWithDates[0].value) - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", habitColor)
      .style("opacity", 0)
      .text(`${dataWithDates[0].value}%`)
      .transition()
      .delay(800)
      .duration(300)
      .style("opacity", 1);

    svg
      .append("text")
      .attr("x", xScale(dataWithDates[dataWithDates.length - 1].date))
      .attr("y", yScale(dataWithDates[dataWithDates.length - 1].value) - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", habitColor)
      .style("opacity", 0)
      .text(`${dataWithDates[dataWithDates.length - 1].value}%`)
      .transition()
      .delay(800)
      .duration(300)
      .style("opacity", 1);

    // Add date labels
    svg
      .append("text")
      .attr("x", xScale(dataWithDates[0].date))
      .attr("y", height + 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#9CA3AF")
      .text(dataWithDates[0].label);

    svg
      .append("text")
      .attr("x", xScale(dataWithDates[dataWithDates.length - 1].date))
      .attr("y", height + 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#9CA3AF")
      .text(dataWithDates[dataWithDates.length - 1].label);
  }, [currentData, habitId, habitColor]);

  const renderSinglePoint = () => {
    if (!currentData || currentData.length !== 1) return null;
    const point = currentData[0];

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: habitColor }}
          >
            <span className="text-white font-bold text-lg">{point.value}%</span>
          </div>
        </motion.div>
        <p className="mt-4 text-sm text-gray-500">{point.label}</p>
      </div>
    );
  };

  return (
    <Card className="rounded-sm gap-1">
      <CardHeader className="px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Performance</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {viewMode === "weekly"
                ? "Completion rate over the last 8 weeks"
                : viewMode === "monthly"
                  ? "Completion rate over the last 6 months"
                  : "Completion rate over the last 12 months"}
            </CardDescription>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                viewMode === "weekly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                viewMode === "monthly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode("yearly")}
              className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                viewMode === "yearly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="relative min-h-[180px]" ref={containerRef}>
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col justify-between py-8">
              {/*<div className="flex justify-between items-start px-8">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>*/}
              <Skeleton className="h-24 w-full" />
              {/*<div className="flex justify-between items-end px-8">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>*/}
            </div>
          ) : !currentData || currentData.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-gray-400 text-sm">No data yet</p>
              <p className="text-gray-300 text-xs mt-1">
                Start tracking to see your progress
              </p>
            </div>
          ) : currentData.length === 1 ? (
            <div className="absolute inset-0">{renderSinglePoint()}</div>
          ) : (
            <>
              <AnimatePresence>
                {selectedDot && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-10 px-3 py-2 rounded-md shadow-lg pointer-events-none"
                    style={{
                      left: selectedDot.x,
                      top: selectedDot.y - 60,
                      transform: "translateX(-50%)",
                      backgroundColor: habitColor,
                    }}
                  >
                    <p className="text-white font-semibold text-sm whitespace-nowrap">
                      {selectedDot.value}%
                    </p>
                    <p className="text-white text-xs opacity-90 whitespace-nowrap">
                      {selectedDot.label}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <svg ref={svgRef} className="w-full" />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
