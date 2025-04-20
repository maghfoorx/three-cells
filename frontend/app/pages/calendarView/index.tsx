import { useEffect, useMemo, useRef } from "react";
import color from "color";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { gql, useQuery } from "@apollo/client";
import { SCORE_COLORS } from "~/types";
import { useNavigate } from "react-router";
import { Skeleton } from "~/components/ui/skeleton";

const ALL_THREE_CELL_ENTRIES = gql`
  query AllThreeCellEntriesForCalendarView {
    allThreeCellEntries {
      id
      date_for
      score
    }
  }
`;

export default function CalendarViewPage() {
  const { data, loading } = useQuery(ALL_THREE_CELL_ENTRIES);

  const scoreMap = useMemo(() => {
    const map = new Map<string, number>();
    if (data?.allThreeCellEntries) {
      data.allThreeCellEntries.forEach((entry: any) => {
        map.set(entry.date_for, entry.score);
      });
    }
    return map;
  }, [data]);
  const currentYear = new Date().getFullYear();
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentMonthIndex = new Date().getMonth();

  const months = Array.from({ length: 12 }, (_, i) => {
    const start = startOfMonth(new Date(currentYear, i));
    const end = endOfMonth(start);
    const days = eachDayOfInterval({ start, end });
    return { monthName: format(start, "MMMM"), days, monthIndex: i };
  });

  useEffect(() => {
    const el = scrollRef.current?.querySelector<HTMLDivElement>(
      `[data-month-index="${currentMonthIndex}"]`
    );
    if (el) {
      el.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, []);

  return (
    <div className="flex flex-col h-full flex-1 gap-4 rounded-xl rounded-t-none p-4">
      <h1 className="text-2xl font-bold mb-6">📅 {currentYear} Year View</h1>
      <div className="flex-1 relative">
        <div
          ref={scrollRef}
          className="flex-1 absolute h-full w-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading
            ? // Show ShadCN skeletons while loading data
              Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <Skeleton className="mb-3 h-[30px] w-[80%]" />
                  <Skeleton className="h-[200px]" />
                </div>
              ))
            : months.map((month, index) => (
                <MonthCard
                  key={index}
                  monthName={month.monthName}
                  days={month.days}
                  monthIndex={month.monthIndex}
                  scoreMap={scoreMap}
                />
              ))}
        </div>
      </div>
    </div>
  );
}

interface MonthCardProps {
  monthName: string;
  days: Date[];
  monthIndex: number;
  scoreMap: Map<string, number>;
}

function MonthCard({ monthName, days, monthIndex, scoreMap }: MonthCardProps) {
  return (
    <div className="border rounded-lg p-4" data-month-index={monthIndex}>
      <h2 className="text-lg font-semibold mb-3">{monthName}</h2>
      <MonthGrid days={days} scoreMap={scoreMap} />
    </div>
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
    navigate(`/track/${formattedDate}`);
  };

  return (
    <div className="grid grid-cols-7 gap-1 text-sm">
      {/* Weekday headers */}
      {["S", "M", "T", "W", "T", "F", "S"].map((d, index) => (
        <div
          key={`weekday-${index}-month-${month}`}
          className="font-medium text-center"
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

        const isLightColour = color(bgColor).isLight();
        return (
          <div
            key={day.toISOString()}
            className="text-center p-1 hover:bg-gray-100 rounded cursor-pointer"
            style={{
              backgroundColor: bgColor,
              color: isLightColour ? "white" : "black",
            }}
            onClick={() => handleDateClicked(day)}
          >
            {day.getDate()}
          </div>
        );
      })}
    </div>
  );
}
