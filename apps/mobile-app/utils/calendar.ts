import { addDays, startOfWeek } from "date-fns";

export const formatDate = (date: Date, formatStr: string): string => {
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

export const eachDayOfInterval = (start: Date, end: Date): Date[] => {
    const dates: Date[] = [];
    const current = new Date(start);

    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
};

export function generateDateWeeks(dateRange: { start: Date; end: Date }) {
    const allDates = eachDayOfInterval(dateRange.start, dateRange.end);

    const dateMap = new Map<string, Date>();
    const getKey = (date: Date) =>
        `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    allDates.forEach((date) => dateMap.set(getKey(date), date));

    const firstDate = allDates[0];
    const lastDate = allDates[allDates.length - 1];
    const firstWeekStart = startOfWeek(firstDate, { weekStartsOn: 1 });
    const lastWeekEnd = addDays(startOfWeek(lastDate, { weekStartsOn: 1 }), 6);

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
                    : null,
            );
        }

        weeks.push(week);
        current = addDays(current, 7);
    }

    return { allDates, weekGroups: weeks };
}

export function calculateMonthLabels(
    weekGroups: (Date | null)[][],
    // Optional format function, defaults to the exported one if not provided
    formatter: (date: Date, fmt: string) => string = formatDate,
) {
    const monthLabels: (string | null)[] = [];

    weekGroups.forEach((week) => {
        const firstOfMonth = week.find(
            (day) => day !== null && day.getDate() === 1,
        );

        if (firstOfMonth) {
            monthLabels.push(formatter(firstOfMonth, "MMM"));
        } else {
            monthLabels.push(null);
        }
    });

    return monthLabels;
}
