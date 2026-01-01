import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subMonths,
} from "date-fns";
import { SCORE_COLORS } from "~/types";
import { useNavigate } from "react-router";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "@packages/backend/convex/_generated/api";
import { YearlyReviewCard } from "./YearlyReviewCard";
import { ConnectedYearlyReviewCard } from "./ConnectedYearlyReviewCard";

interface MonthData {
  monthName: string;
  days: Date[];
  id: string;
}

export default function CalendarViewPage() {
  const allThreeCellEntries = useQuery(api.threeCells.allThreeCellEntries);
  const currentYear = new Date().getFullYear();
  const overallViewOfYear = useQuery(api.threeCells.overallViewOfYear, {
    year: currentYear.toString(),
  });

  const scoreMap = useMemo(() => {
    const map = new Map<string, number>();
    if (allThreeCellEntries) {
      allThreeCellEntries.forEach((entry: any) => {
        map.set(entry.dateFor, entry.score);
      });
    }
    return map;
  }, [allThreeCellEntries]);

  const [loadedMonths, setLoadedMonths] = useState<MonthData[]>(() => {
    const current = new Date();
    const currentYear = current.getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(current, i);
      const start = startOfMonth(date);
      const end = endOfMonth(start);
      const days = eachDayOfInterval({ start, end });
      const isCurrentYear = start.getFullYear() === currentYear;
      return {
        monthName: format(start, isCurrentYear ? "MMMM" : "MMMM yyyy"),
        days,
        id: format(start, "yyyy-MM"),
      };
    });
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    setLoadedMonths((prev) => {
      const lastMonthDays = prev[prev.length - 1].days;
      const lastMonthDate = lastMonthDays[0];
      const currentYear = new Date().getFullYear();

      const newMonths = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(lastMonthDate, i + 1);
        const start = startOfMonth(date);
        const end = endOfMonth(start);
        const days = eachDayOfInterval({ start, end });
        const isCurrentYear = start.getFullYear() === currentYear;
        return {
          monthName: format(start, isCurrentYear ? "MMMM" : "MMMM yyyy"),
          days,
          id: format(start, "yyyy-MM"),
        };
      });

      return [...prev, ...newMonths];
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  const overallView = useMemo(() => {
    if (overallViewOfYear) {
      return overallViewOfYear;
    }

    return {
      [-2]: 0,
      [-1]: 0,
      [0]: 0,
      [1]: 0,
      [2]: 0,
    };
  }, [overallViewOfYear]);

  return (
    <div className="flex flex-col h-full flex-1 gap-4 rounded-xl rounded-t-none p-2">
      <div className="flex-1 relative">
        <div className="flex-1 absolute h-full w-full overflow-y-auto">
          <div className="">
            <YearlyReviewCard year={currentYear.toString()} scoreCounts={overallView} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 pt-2" dir="rtl">
            {loadedMonths.map((month) => {
              const isDecember = month.monthName.startsWith("December");
              const monthDate = month.days[0]; // First day of the month
              const year = monthDate.getFullYear();
              const isCurrentYear = year === currentYear;

              return (
                <div key={month.id} className="contents">
                  {isDecember && !isCurrentYear && (
                    <div className="" dir="ltr">
                      <ConnectedYearlyReviewCard year={year.toString()} />
                    </div>
                  )}
                  <div dir="ltr" className="h-full">
                    <MonthCard
                      monthName={month.monthName}
                      days={month.days}
                      scoreMap={scoreMap}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div ref={observerTarget} className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

interface MonthCardProps {
  monthName: string;
  days: Date[];
  scoreMap: Map<string, number>;
}

function MonthCard({ monthName, days, scoreMap }: MonthCardProps) {
  return (
    <Card className="py-0 py-4 rounded-md h-full">
      <CardHeader className="">
        <CardTitle className="text-xs uppercase">{monthName}</CardTitle>
      </CardHeader>
      <CardContent>
        <MonthGrid days={days} scoreMap={scoreMap} />
      </CardContent>
    </Card>
  );
}

interface MonthGridProps {
  days: Date[];
  scoreMap: Map<string, number>;
}

function MonthGrid({ days, scoreMap }: MonthGridProps) {
  const month = days[0].getMonth();
  const navigate = useNavigate();
  const firstDay = days[0].getDay();

  const handleDateClicked = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    navigate(`/track/${formattedDate}`, { viewTransition: true });
  };

  return (
    <div className="grid grid-cols-7 gap-1 text-sm">
      {/* Weekday headers */}
      {["S", "M", "T", "W", "T", "F", "S"].map((d, index) => (
        <div
          key={`weekday-${index}-month-${month}`}
          className="font-medium text-center text-muted-foreground text-xs"
        >
          {d}
        </div>
      ))}

      {/* Empty placeholders for alignment */}
      {Array.from({ length: firstDay }).map((_, i) => (
        <div key={`empty-${i}`} />
      ))}

      {/* Actual days */}
      {days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const score = scoreMap.get(dateStr);
        const bgColor = score !== undefined ? SCORE_COLORS[score] : undefined;

        const scoreDayTextColour = bgColor != undefined ? "white" : "inherit";
        const isFuture = day > new Date();
        return (
          <div
            key={day.toISOString()}
            className={`text-center p-1 rounded cursor-pointer text-xs aspect-square flex items-center justify-center transition-colors duration-500 ${bgColor ? "hover:opacity-80" : "hover:bg-muted"
              } ${isFuture ? "opacity-50" : ""}`}
            style={{
              backgroundColor: bgColor,
              color: scoreDayTextColour,
            }}
            onClick={() => {
              if (isFuture) {
                return;
              }
              handleDateClicked(day)
            }}
          >
            {day.getDate()}
          </div>
        );
      })}
    </div>
  );
}
