import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { YearlyReviewCard } from "./YearlyReviewCard";
import { useMemo } from "react";

interface ConnectedYearlyReviewCardProps {
    year: string;
}

export function ConnectedYearlyReviewCard({ year }: ConnectedYearlyReviewCardProps) {
    const overallViewOfYear = useQuery(api.threeCells.overallViewOfYear, {
        year: year,
    });

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

    return <YearlyReviewCard year={year} scoreCounts={overallView} />;
}
