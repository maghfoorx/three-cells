import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useQuery } from "convex/react";
import { useParams } from "react-router";
import { api } from "@packages/backend/convex/_generated/api";
import type {
  DataModel,
  Doc,
  Id,
} from "@packages/backend/convex/_generated/dataModel";
import * as d3 from "d3";

// Utility functions
const formatValueByIncrement = (value: number, increment?: number) => {
  if (!increment) return value.toString();
  const decimalPlaces = increment.toString().split(".")[1]?.length || 0;
  return value.toFixed(decimalPlaces);
};

const mixColors = (color1: string, color2: string, weight: number) => {
  const hex1 = color1.replace("#", "");
  const hex2 = color2.replace("#", "");

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const r = Math.round(r1 * (1 - weight) + r2 * weight);
  const g = Math.round(g1 * (1 - weight) + g2 * weight);
  const b = Math.round(b1 * (1 - weight) + b2 * weight);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Trend Chart Component
function MetricTrendChart({
  metricId,
  metric,
  viewMode,
  setViewMode,
}: {
  metricId: Id<"userMetrics">;
  metric: Doc<"userMetrics">;
  viewMode: "7days" | "30days" | "90days";
  setViewMode: Dispatch<SetStateAction<"7days" | "30days" | "90days">>;
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedDotIndex, setSelectedDotIndex] = useState(null);
  const [containerWidth, setContainerWidth] = useState(600);

  const GRAPH_HEIGHT = 120;
  const TEXT_PADDING = 30;
  const VERTICAL_PADDING = 20;

  const trendData = useQuery(api.userMetrics.queries.getMetricTrendData, {
    metricId,
    period: viewMode,
  });

  const isLoading = trendData === undefined;
  const GRAPH_WIDTH = containerWidth > 0 ? containerWidth : 600;

  // Convert data to proper format
  const processedTrendData = useMemo(() => {
    if (!trendData) return [];
    return trendData.map((d) => ({
      date: new Date(d.date),
      value: d.value,
      label: d.label,
    }));
  }, [trendData]);

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

  // D3 Graph rendering
  useEffect(() => {
    if (!svgRef.current || processedTrendData.length < 2) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(processedTrendData, (d) => d.date) as any)
      .range([TEXT_PADDING, GRAPH_WIDTH - TEXT_PADDING]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(processedTrendData, (d) => d.value as any) * 0.95,
        d3.max(processedTrendData, (d) => d.value as any) * 1.05,
      ])
      .range([GRAPH_HEIGHT - VERTICAL_PADDING, VERTICAL_PADDING]);

    const lineGenerator = d3
      .line()
      .x((d: any) => xScale(d?.date as any))
      .y((d: any) => yScale(d?.value as any))
      .curve(d3.curveMonotoneX);

    // Draw line with animation
    const path = svg
      .append("path")
      .datum(processedTrendData)
      .attr("fill", "none")
      .attr("stroke", metric.colour)
      .attr("stroke-width", 2.5)
      .attr("stroke-opacity", 0.8)
      .attr("d", lineGenerator as any);

    const totalLength = path.node()?.getTotalLength();
    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength as any)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Draw data points
    const dots = svg
      .selectAll("g.data-point")
      .data(processedTrendData)
      .enter()
      .append("g")
      .attr("class", "data-point");

    dots
      .append("circle")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.value))
      .attr("r", 4)
      .attr("fill", metric.colour)
      .attr("opacity", 0.9);

    // Add invisible hover areas for middle points
    dots
      .filter((_, i) => i !== 0 && i !== processedTrendData.length - 1)
      .append("circle")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.value))
      .attr("r", 15)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        const index = processedTrendData.findIndex(
          (e) => e.date.getTime() === d.date.getTime(),
        );
        setSelectedDotIndex(index as any);
      })
      .on("mouseleave", () => {
        setSelectedDotIndex(null);
      });

    // Show first and last values
    const darkColor = mixColors(metric.colour, "#000000", 0.4);

    svg
      .append("text")
      .attr("x", xScale(processedTrendData[0].date))
      .attr("y", yScale(processedTrendData[0].value) - 12)
      .attr("text-anchor", "middle")
      .attr("font-size", "10")
      .attr("font-weight", "600")
      .attr("fill", darkColor)
      .text(
        formatValueByIncrement(processedTrendData[0].value, metric.increment),
      );

    svg
      .append("text")
      .attr("x", xScale(processedTrendData[processedTrendData.length - 1].date))
      .attr(
        "y",
        yScale(processedTrendData[processedTrendData.length - 1].value) - 12,
      )
      .attr("text-anchor", "middle")
      .attr("font-size", "10")
      .attr("font-weight", "600")
      .attr("fill", darkColor)
      .text(
        formatValueByIncrement(
          processedTrendData[processedTrendData.length - 1].value,
          metric.increment,
        ),
      );

    // Date labels
    svg
      .append("text")
      .attr("x", xScale(processedTrendData[0].date))
      .attr("y", GRAPH_HEIGHT - 4)
      .attr("text-anchor", "middle")
      .attr("font-size", "9")
      .attr("fill", "#9CA3AF")
      .text(processedTrendData[0].label);

    svg
      .append("text")
      .attr("x", xScale(processedTrendData[processedTrendData.length - 1].date))
      .attr("y", GRAPH_HEIGHT - 4)
      .attr("text-anchor", "middle")
      .attr("font-size", "9")
      .attr("fill", "#9CA3AF")
      .text(processedTrendData[processedTrendData.length - 1].label);
  }, [processedTrendData, metric, GRAPH_WIDTH, GRAPH_HEIGHT]);

  const getSelectedDotInfo = () => {
    if (selectedDotIndex === null) return null;
    const entry = processedTrendData[selectedDotIndex];
    return {
      value: formatValueByIncrement(entry.value, metric.increment),
      date: entry.label,
      unit: metric.unit,
    };
  };

  const renderGraph = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    if (processedTrendData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-400 text-sm">No data yet</p>
            <p className="text-gray-300 text-xs mt-1">
              Add entries to see your trend
            </p>
          </div>
        </div>
      );
    }

    if (processedTrendData.length === 1) {
      const singlePoint = processedTrendData[0];
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
              fill={mixColors(metric.colour, "#000000", 0.4)}
              textAnchor="middle"
              fontWeight="600"
            >
              {formatValueByIncrement(singlePoint.value, metric.increment)}
            </text>
            <text
              x={GRAPH_WIDTH / 2}
              y={GRAPH_HEIGHT / 2 + 30}
              fontSize="10"
              fill="#9CA3AF"
              textAnchor="middle"
            >
              {singlePoint.label}
            </text>
          </svg>
        </div>
      );
    }

    return <svg ref={svgRef} width={GRAPH_WIDTH} height={GRAPH_HEIGHT}></svg>;
  };

  return (
    <Card className="rounded-sm relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Trend</CardTitle>
          <div className="flex bg-secondary rounded-lg p-1">
            {["7days", "30days", "90days"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "7days" ? "7D" : mode === "30days" ? "30D" : "90D"}
              </button>
            ))}
          </div>
        </div>
        <CardDescription>
          {viewMode === "7days"
            ? "Values over the last 7 days"
            : viewMode === "30days"
              ? "Values over the last 30 days"
              : "Values over the last 90 days"}
        </CardDescription>
      </CardHeader>

      {/* Floating tooltip */}
      {getSelectedDotInfo != null && getSelectedDotInfo()?.unit != null && (
        <div className="absolute top-2 left-0 right-0 flex items-center justify-center z-10 pointer-events-none">
          <div
            className="px-3 py-2 rounded-md shadow-lg"
            style={{
              backgroundColor: mixColors(metric.colour, "#FFFFFF", 0.1),
            }}
          >
            <p
              className="text-sm font-semibold text-center"
              style={{ color: mixColors(metric.colour, "#000000", 0.4) }}
            >
              {getSelectedDotInfo()?.value}
              {getSelectedDotInfo()?.unit
                ? ` ${getSelectedDotInfo()?.unit}`
                : ""}
            </p>
            <p
              className="text-xs opacity-90 text-center"
              style={{ color: mixColors(metric.colour, "#000000", 0.4) }}
            >
              {getSelectedDotInfo()?.date}
            </p>
          </div>
        </div>
      )}

      <CardContent>
        <div ref={containerRef} className="h-32 w-full">
          {renderGraph()}
        </div>
      </CardContent>
    </Card>
  );
}

// Statistics Cards Component
function MetricStatisticsCards({
  metricId,
  metric,
}: {
  metricId: Id<"userMetrics">;
  metric: Doc<"userMetrics">;
}) {
  const statistics = useQuery(api.userMetrics.queries.getMetricStatistics, {
    metricId,
  });

  const isLoading = statistics === undefined;

  const formatValue = (value: any) => {
    if (value === null) return "—";
    const formatted = formatValueByIncrement(value, metric.increment);
    return metric.unit ? `${formatted} ${metric.unit}` : formatted;
  };

  const getTrendIcon = () => {
    if (!statistics) return <Minus className="h-4 w-4" />;
    switch (statistics.trend) {
      case "up":
        return <TrendingUp className="h-4 w-4" />;
      case "down":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    if (!statistics) return "text-gray-500";
    switch (statistics.trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle className="text-lg">Current Value</CardTitle>
            <CardDescription>Latest recorded measurement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-10 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="w-16 h-16 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="rounded-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                7-Day Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>

          <Card className="rounded-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                30-Day Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!statistics || statistics.totalEntries === 0) {
    return (
      <Card className="rounded-sm">
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">No data yet</p>
            <p className="text-gray-300 text-xs mt-1">
              Add your first entry to see statistics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Current Value Card */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="text-lg">Current Value</CardTitle>
          <CardDescription>Latest recorded measurement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p
                className="text-3xl font-bold"
                style={{ color: mixColors(metric.colour, "#000000", 0.2) }}
              >
                {formatValue(statistics.currentValue)}
              </p>
              {statistics.percentageChange !== null && (
                <div className="flex items-center mt-2 gap-1">
                  <span className={getTrendColor()}>{getTrendIcon()}</span>
                  <span className={`text-sm font-medium ${getTrendColor()}`}>
                    {Math.abs(statistics.percentageChange).toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    vs previous
                  </span>
                </div>
              )}
            </div>

            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: mixColors(metric.colour, "#FFFFFF", 0.9),
              }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: metric.colour }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Averages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">7-Day Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatValue(statistics.averageLast7Days)}
            </div>
            <p className="text-xs text-muted-foreground">past week</p>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              30-Day Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatValue(statistics.averageLast30Days)}
            </div>
            <p className="text-xs text-muted-foreground">past month</p>
          </CardContent>
        </Card>
      </div>

      {/* Min/Max and Total */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatValue(statistics.highestValue)}
            </div>
            <p className="text-xs text-muted-foreground">all time</p>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatValue(statistics.lowestValue)}
            </div>
            <p className="text-xs text-muted-foreground">all time</p>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalEntries}</div>
            <p className="text-xs text-muted-foreground">recorded</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Page Component
export default function SingleMetricPage() {
  const [viewMode, setViewMode] = useState<"7days" | "30days" | "90days">(
    "30days",
  );

  const params = useParams();
  const metricId =
    params.metricId as DataModel["userMetrics"]["document"]["_id"];

  const result = useQuery(api.userMetrics.queries.getAllSubmissionsForMetric, {
    metricId: metricId,
  });

  const metric = result?.metric;

  return (
    <div className="flex flex-col h-full flex-1 gap-3 rounded-xl rounded-t-none p-2">
      {metric?.name === undefined && (
        <h1 className="font-semibold text-3xl px-4 py-2 blur-md">
          You're Awesome
        </h1>
      )}
      {metric?.name !== undefined && (
        <h1 className="font-semibold text-3xl px-4 py-2">{metric?.name}</h1>
      )}

      <div className="flex-1 relative">
        <div className="absolute h-full w-full overflow-y-auto space-y-3">
          {metric && (
            <>
              <MetricTrendChart
                metricId={metricId}
                metric={metric}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
              <MetricStatisticsCards metricId={metricId} metric={metric} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
