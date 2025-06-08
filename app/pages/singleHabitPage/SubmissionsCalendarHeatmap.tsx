import React, { useMemo, useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";

import type { DataModel } from "convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { format, isAfter } from "date-fns";
import {
  useBulkManageHabitSubmissions,
  useCalendarSquareToast,
} from "./useCalendarSquareToast";

type Submission = DataModel["userHabitSubmissions"]["document"];

interface SubmissionsCalendarHeatmapProps {
  allSubmissions: Submission[];
  habit?: DataModel["userHabits"]["document"];
  startDate?: Date;
  endDate?: Date;
  className?: string;
}

// Helper functions for date manipulation
const formatDate = (date: Date, formatStr: string): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (formatStr === "yyyy-MM-dd") return `${year}-${month}-${day}`;
  if (formatStr === "MMM")
    return date.toLocaleDateString("en", { month: "short" });
  if (formatStr === "MMM yyyy")
    return date.toLocaleDateString("en", { month: "short", year: "numeric" });
  if (formatStr === "MMM d, yyyy")
    return date.toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  return date.toISOString();
};

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  return new Date(result.setDate(diff));
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const eachDayOfInterval = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

// Hook to detect screen size
const useScreenSize = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return { isMobile };
};

export default function SubmissionsCalendarHeatmap({
  allSubmissions = [],
  habit,
  startDate,
  endDate = new Date(),
  className = "",
}: SubmissionsCalendarHeatmapProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { onMouseEnter, onMouseLeave } = useCalendarSquareToast();
  const { selectedDates, toggleDate, togglingSubmission } =
    useBulkManageHabitSubmissions({
      habit,
    });

  // const { isMobile } = useScreenSize();
  const [isInitialRender, setIsInitialRender] = useState(true);

  const [dateRange, setDateRange] = React.useState(() => ({
    // start: startDate || addMonths(endDate, -12),
    start: startDate || addMonths(endDate, -12),
    end: endDate,
  }));

  // Create a map of submissions by date for quick lookup
  const submissionsByDate = useMemo(() => {
    const map = new Map<string, Submission[]>();
    allSubmissions.forEach((submission) => {
      const dateKey = submission.dateFor;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(submission);
    });
    return map;
  }, [allSubmissions]);

  const { allDates, weekGroups } = useMemo(
    () => generateDateWeeks(dateRange),
    [dateRange]
  );

  const monthLabels = useMemo(
    () => calculateMonthLabels(weekGroups, formatDate),
    [weekGroups]
  );

  // Navigate date range
  const navigatePrevious = () => {
    setDateRange((prev) => ({
      start: addMonths(prev.start, -1),
      end: addMonths(prev.end, -1),
    }));
  };

  const navigateNext = () => {
    setDateRange((prev) => ({
      start: addMonths(prev.start, 1),
      end: addMonths(prev.end, 1),
    }));
  };

  const goToToday = () => {
    const today = new Date();
    setDateRange({
      start: addMonths(today, -12),
      end: today,
    });
  };

  // Handle initial scroll position and updates
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const scrollToEnd = () => {
      const container = scrollContainerRef.current!;
      const targetScrollLeft = container.scrollWidth - container.clientWidth;

      if (isInitialRender) {
        // On initial render for mobile, set position immediately without animation
        container.scrollLeft = targetScrollLeft;
        setIsInitialRender(false);
      } else {
        // For subsequent mobile updates, smooth scroll
        container.scrollTo({
          left: targetScrollLeft,
          behavior: "smooth",
        });
      }
    };

    // Use requestAnimationFrame to ensure DOM is fully rendered
    const rafId = requestAnimationFrame(scrollToEnd);

    return () => cancelAnimationFrame(rafId);
  }, [weekGroups, dateRange, isInitialRender]);

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className={cn(className)}>
      {/* Header with navigation */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={navigatePrevious}
            className="h-8 w-8 p-0 border border-gray-300 rounded bg-white hover:bg-gray-50 flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={navigateNext}
            className="h-8 w-8 p-0 border border-gray-300 rounded bg-white hover:bg-gray-50 flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={goToToday}
            className="text-xs px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50"
          >
            Today
          </Button>

          <div>
            <div className="text-xs text-gray-600 bg-secondary px-2 py-1 rounded-sm w-fit">
              {formatDate(dateRange.start, "MMM yyyy")} -{" "}
              {formatDate(dateRange.end, "MMM yyyy")}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar heatmap */}
      <div className="w-full overflow-x-auto" ref={scrollContainerRef}>
        <div className="border rounded-sm p-4 bg-white w-fit">
          <div>
            <div className="min-w-fit">
              {/* Month labels */}
              <div className="flex mb-2 relative" style={{ height: "16px" }}>
                <div className="w-6"></div> {/* Space for day labels */}
                <div className="flex relative">
                  {monthLabels.map((label, index) => (
                    <div
                      key={`${label.month}-${label.weekIndex}`}
                      className="text-xs text-gray-600 font-medium absolute"
                      style={{
                        left: `${label.weekIndex * 24}px`, // 24px = 20px cell width + 4px gap
                        width: `${Math.max(label.width * 16 - 4, 32)}px`, // Minimum width for readability
                      }}
                    >
                      {label.month}
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar grid */}
              <div className="flex">
                {/* Weeks */}
                <div className="flex gap-1">
                  {weekGroups.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((date, dayIndex) => {
                        // if not a date then just render an empty hidden box
                        if (!date) {
                          return (
                            <div
                              key={`${date}-${dayIndex}`}
                              className="h-5 w-5"
                            />
                          );
                        }

                        const intensity = getIntensityLevel(
                          date,
                          submissionsByDate
                        );
                        const submissions =
                          submissionsByDate.get(
                            formatDate(date, "yyyy-MM-dd")
                          ) || [];

                        const isInBulkSelectedDates = selectedDates.find(
                          (selectedDate) => selectedDate === date
                        );

                        if (isInBulkSelectedDates && togglingSubmission) {
                          return (
                            <div
                              className="h-5 w-5 flex items-center justify-center"
                              key={date.getTime()}
                            >
                              <LoaderCircle
                                className="animate-spin"
                                size={16}
                              />
                            </div>
                          );
                        }

                        const dateBoxColour =
                          intensity > 0 ? habit?.colour : "#EEEE";

                        // if the date is sometime in the future render a disabled box you can't click
                        if (isAfter(date.getTime(), new Date().getTime())) {
                          return (
                            <div
                              key={date.getTime()}
                              className="h-5 w-5 cursor-pointer transition-colors border border-gray-200 rounded-[2px] text-[10px] flex items-center justify-center hover:opacity-60"
                              style={{
                                ...(isInBulkSelectedDates
                                  ? {}
                                  : {
                                      background: "#F5F5F5",
                                    }),
                              }}
                              title={`${formatDate(date, "MMM d, yyyy")} - ${
                                submissions.length
                              } submission${
                                submissions.length !== 1 ? "s" : ""
                              }`}
                            >
                              <span>{format(date, "d")}</span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={date.getTime()}
                            className={cn(
                              "h-5 w-5 cursor-pointer transition-colors border border-gray-200 rounded-[2px] text-[10px] flex items-center justify-center hover:opacity-60",
                              {
                                "bg-primary": isInBulkSelectedDates,
                              }
                            )}
                            style={{
                              ...(isInBulkSelectedDates
                                ? {}
                                : {
                                    background: dateBoxColour,
                                  }),
                            }}
                            title={`${formatDate(date, "MMM d, yyyy")} - ${
                              submissions.length
                            } submission${submissions.length !== 1 ? "s" : ""}`}
                            onClick={() => {
                              toggleDate(date);
                            }}
                            onMouseEnter={() => {
                              if (habit != null && selectedDates.length < 1) {
                                onMouseEnter({
                                  habit: habit,
                                  date: date,
                                  submissions: submissions,
                                });
                              }
                            }}
                            onMouseLeave={onMouseLeave}
                          >
                            <span>{format(date, "d")}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Day labels column */}
                <div className="flex flex-col ml-2">
                  {dayLabels.map((day, index) => (
                    <div
                      key={`${day}-${index}`}
                      className="h-5 w-5 text-xs text-gray-500 flex items-center justify-center mb-1"
                      style={
                        {
                          // visibility: index % 2 === 1 ? "visible" : "hidden",
                        }
                      }
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          {habit != null && habit?.type !== "yes_no" && (
            <div className="flex items-center gap-2 justify-center mt-4 text-xs text-gray-600">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-3 w-3 border border-gray-200 ${getIntensityColor(
                      level
                    )}`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Get intensity level for a date (0-4 scale like GitHub)
const getIntensityLevel = (date: Date, submissionsByDate: any): number => {
  const dateKey = formatDate(date, "yyyy-MM-dd");
  const submissions = submissionsByDate.get(dateKey) || [];

  if (submissions.length === 0) return 0;
  if (submissions.length === 1) return 1;
  if (submissions.length === 2) return 2;
  if (submissions.length === 3) return 3;
  return 4; // 4 or more submissions
};

// Get intensity color class
const getIntensityColor = (level: number): string => {
  const colors = [
    "bg-gray-100 hover:bg-gray-200", // 0 - no submissions
    "bg-green-200 hover:bg-green-300", // 1 submission
    "bg-green-400 hover:bg-green-500", // 2 submissions
    "bg-green-600 hover:bg-green-700", // 3 submissions
    "bg-green-800 hover:bg-green-900", // 4+ submissions
  ];
  return colors[level] || colors[0];
};

// utils/calendar.ts

export function generateDateWeeks(dateRange: { start: Date; end: Date }) {
  const allDates = eachDayOfInterval(dateRange.start, dateRange.end);

  const dateMap = new Map<string, Date>();
  const getKey = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  allDates.forEach((date) => dateMap.set(getKey(date), date));

  const firstDate = allDates[0];
  const lastDate = allDates[allDates.length - 1];
  const firstWeekStart = startOfWeek(firstDate);
  const lastWeekEnd = addDays(startOfWeek(lastDate), 6);

  let current = new Date(firstWeekStart);
  const weeks: (Date | null)[][] = [];

  while (current <= lastWeekEnd) {
    const week: (Date | null)[] = [];

    for (let i = 0; i < 7; i++) {
      const dayDate = addDays(current, i);
      const key = getKey(dayDate);
      week.push(
        dayDate >= firstDate && dayDate <= lastDate && dateMap.has(key)
          ? dateMap.get(key)!
          : null
      );
    }

    weeks.push(week);
    current = addDays(current, 7);
  }

  return { allDates, weekGroups: weeks };
}

export function calculateMonthLabels(
  weekGroups: (Date | null)[][],
  formatDate: (date: Date, fmt: string) => string
) {
  const labels: { month: string; weekIndex: number; width: number }[] = [];
  let currentMonth = -1;
  let monthStartWeek = 0;

  weekGroups.forEach((week, weekIndex) => {
    const firstValidDay = week.find((day) => day !== null);
    if (firstValidDay) {
      const monthNum = firstValidDay.getMonth();
      if (monthNum !== currentMonth) {
        if (currentMonth !== -1) {
          labels[labels.length - 1].width = weekIndex - monthStartWeek;
        }

        labels.push({
          month: formatDate(firstValidDay, "MMM"),
          weekIndex,
          width: 1,
        });
        currentMonth = monthNum;
        monthStartWeek = weekIndex;
      }
    }
  });

  if (labels.length > 0) {
    labels[labels.length - 1].width = weekGroups.length - monthStartWeek;
  }

  return labels;
}
