import { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import * as d3 from "d3";
import color from "color";
import { openAddMetricEntryDialog } from "./AddMetricEntryDialog";
import type { Doc } from "@packages/backend/convex/_generated/dataModel";

type UserMetricCardProps = {
  metric: Doc<"userMetrics">;
  submissions: Doc<"userMetricSubmissions">[];
};

// Utility function to format values
const formatValueByIncrement = (value: number, increment?: number): string => {
  if (!increment) return value.toString();

  const decimalPlaces = increment.toString().split(".")[1]?.length || 0;
  return value.toFixed(decimalPlaces);
};

// Simple date formatter
const formatDate = (date: Date): string => {
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
};

// Skeleton Component (for loading states)
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// Main Card Component
export function UserMetricCard({
  metric,
  submissions = [],
}: UserMetricCardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDotIndex, setSelectedDotIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(600);

  const GRAPH_HEIGHT = 120;
  const PADDING = 20;
  const GRAPH_WIDTH = containerWidth > 0 ? containerWidth * 1 : 600;

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Get last 7 entries
  const last7Entries = useMemo(() => {
    if (!submissions || submissions.length === 0) return [];

    const sorted = [...submissions].sort(
      (a, b) => new Date(a.dateFor).getTime() - new Date(b.dateFor).getTime(),
    );

    return sorted.slice(-7).map((entry) => ({
      date: new Date(entry.dateFor),
      value: entry.value,
      dateFor: entry.dateFor,
    }));
  }, [submissions]);

  const last7EntriesAverage = useMemo(() => {
    if (last7Entries.length === 0) return 0;

    const sum = last7Entries.reduce((acc, entry) => acc + entry.value, 0);
    return formatValueByIncrement(sum / last7Entries.length, metric.increment);
  }, [last7Entries, metric.increment]);

  // D3 Graph rendering
  useEffect(() => {
    if (!svgRef.current || last7Entries.length < 2) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(last7Entries, (d) => d.date) as [Date, Date])
      .range([PADDING, GRAPH_WIDTH - PADDING]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(last7Entries, (d) => d.value)! * 0.95,
        d3.max(last7Entries, (d) => d.value)! * 1.05,
      ])
      .range([GRAPH_HEIGHT - PADDING, PADDING]);

    const lineGenerator = d3
      .line<{ date: Date; value: number }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw line with animation
    const path = svg
      .append("path")
      .datum(last7Entries)
      .attr("fill", "none")
      .attr("stroke", metric.colour)
      .attr("stroke-width", 2.5)
      .attr("d", lineGenerator);

    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Draw data points
    const dots = svg
      .selectAll("circle.data-point")
      .data(last7Entries)
      .enter()
      .append("g");

    dots
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.value))
      .attr("r", 4)
      .attr("fill", metric.colour)
      .attr("opacity", 0.9);

    // Add invisible hover areas for middle points
    dots
      .filter((_, i) => i !== 0 && i !== last7Entries.length - 1)
      .append("circle")
      .attr("class", "hover-target")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.value))
      .attr("r", 15)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        const index = last7Entries.findIndex((e) => e.date === d.date);
        setSelectedDotIndex(index);
      })
      .on("mouseleave", () => {
        setSelectedDotIndex(null);
      });

    // Show first and last values
    svg
      .append("text")
      .attr("x", xScale(last7Entries[0].date))
      .attr("y", yScale(last7Entries[0].value) - 12)
      .attr("text-anchor", "middle")
      .attr("font-size", "10")
      .attr("font-weight", "600")
      .attr("fill", color(metric.colour).mix(color("black"), 0.4).hex())
      .text(formatValueByIncrement(last7Entries[0].value, metric.increment));

    svg
      .append("text")
      .attr("x", xScale(last7Entries[last7Entries.length - 1].date))
      .attr("y", yScale(last7Entries[last7Entries.length - 1].value) - 12)
      .attr("text-anchor", "middle")
      .attr("font-size", "10")
      .attr("font-weight", "600")
      .attr("fill", color(metric.colour).mix(color("black"), 0.4).hex())
      .text(
        formatValueByIncrement(
          last7Entries[last7Entries.length - 1].value,
          metric.increment,
        ),
      );

    // Date labels
    svg
      .append("text")
      .attr("x", xScale(last7Entries[0].date))
      .attr("y", GRAPH_HEIGHT - 4)
      .attr("text-anchor", "middle")
      .attr("font-size", "9")
      .attr("fill", "#9CA3AF")
      .text(formatDate(last7Entries[0].date));

    svg
      .append("text")
      .attr("x", xScale(last7Entries[last7Entries.length - 1].date))
      .attr("y", GRAPH_HEIGHT - 4)
      .attr("text-anchor", "middle")
      .attr("font-size", "9")
      .attr("fill", "#9CA3AF")
      .text(formatDate(last7Entries[last7Entries.length - 1].date));
  }, [last7Entries, metric, GRAPH_WIDTH, GRAPH_HEIGHT, PADDING]);

  const getSelectedDotInfo = () => {
    if (
      selectedDotIndex === null ||
      selectedDotIndex === 0 ||
      selectedDotIndex === last7Entries.length - 1
    ) {
      return null;
    }

    const entry = last7Entries[selectedDotIndex];
    return {
      value: formatValueByIncrement(entry.value, metric.increment),
      date: formatDate(entry.date),
      unit: metric.unit,
    };
  };

  const renderGraph = () => {
    if (last7Entries.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-400 text-sm">No data yet</p>
            <p className="text-gray-300 text-xs mt-1">Add your first entry</p>
          </div>
        </div>
      );
    }

    if (last7Entries.length === 1) {
      const singlePoint = last7Entries[0];
      return (
        <div className="flex items-center justify-center h-full">
          <svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
            <circle
              cx={GRAPH_WIDTH / 2}
              cy={GRAPH_HEIGHT / 2}
              r={6}
              fill={metric.colour}
            />
            <text
              x={GRAPH_WIDTH / 2}
              y={GRAPH_HEIGHT / 2 - 20}
              fontSize="12"
              fill={color(metric.colour).mix(color("black"), 0.4).hex()}
              textAnchor="middle"
              fontWeight="600"
            >
              {singlePoint.value}
            </text>
            <text
              x={GRAPH_WIDTH / 2}
              y={GRAPH_HEIGHT / 2 + 30}
              fontSize="10"
              fill="#9CA3AF"
              textAnchor="middle"
            >
              {formatDate(singlePoint.date)}
            </text>
          </svg>
        </div>
      );
    }

    return <svg ref={svgRef} width={GRAPH_WIDTH} height={GRAPH_HEIGHT}></svg>;
  };

  const cardColour = color(metric.colour).mix(color("white"), 0.95).hex();

  return (
    <Link
      to={`/metrics/${metric._id}`}
      className="block cursor-pointer rounded-sm border shadow-sm p-4 hover:opacity-85 transition-opacity group relative w-full"
      style={{
        backgroundColor: cardColour,
        textDecoration: "none",
      }}
    >
      {/* Floating value tooltip */}
      {getSelectedDotInfo() && (
        <div className="absolute top-2 left-0 right-0 flex items-center justify-center z-10 pointer-events-none">
          <div
            className="px-3 py-2 rounded-md shadow-lg"
            style={{
              backgroundColor: color(metric.colour)
                .mix(color("white"), 0.1)
                .hex(),
            }}
          >
            <p
              className="text-sm font-semibold text-center"
              style={{
                color: color(metric.colour).mix(color("black"), 0.4).hex(),
              }}
            >
              {getSelectedDotInfo()!.value}
              {getSelectedDotInfo()!.unit
                ? ` ${getSelectedDotInfo()!.unit}`
                : ""}
            </p>
            <p
              className="text-xs opacity-90 text-center"
              style={{
                color: color(metric.colour).mix(color("black"), 0.4).hex(),
              }}
            >
              {getSelectedDotInfo()!.date}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3 flex-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: metric.colour }}
          />
          <span className="text-sm font-medium text-gray-800 group-hover:underline">
            {metric.name}
          </span>
          {metric.unit && (
            <span className="text-xs text-gray-500">({metric.unit})</span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Navigate to add entry page
            console.log("Add entry clicked");
            const latestEntry = submissions[submissions.length - 1] ?? null;
            openAddMetricEntryDialog(metric, latestEntry);
          }}
          className="w-8 h-8 rounded-md flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
          style={{
            backgroundColor: color(metric.colour)
              .mix(color("white"), 0.8)
              .hex(),
          }}
        >
          <Plus
            size={16}
            color={color(metric.colour).mix(color("black"), 0.3).hex()}
          />
        </button>
      </div>

      {/* Graph */}
      <div ref={containerRef} className="h-32 mb-3">
        {renderGraph()}
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          average: {last7EntriesAverage}
        </span>
        {last7Entries.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">latest:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatValueByIncrement(
                last7Entries[last7Entries.length - 1].value,
                metric.increment,
              )}
              {metric.unit ? ` ${metric.unit}` : ""}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// Skeleton Component
UserMetricCard.Skeleton = function UserMetricCardSkeleton() {
  return (
    <div className="bg-white rounded-sm border p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <Skeleton className="h-8 w-24 mb-1" />
        </div>
        <Skeleton className="w-8 h-8 rounded-md" />
      </div>

      <Skeleton className="h-32 mb-3 rounded-md" />

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
};
