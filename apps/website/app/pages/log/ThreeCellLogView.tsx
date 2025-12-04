import { useQuery } from "convex/react";
import { Label } from "~/components/ui/label";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import color from "color";
import { SCORE_COLORS, type ThreeCellLog } from "~/types";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import FullscreenSpinner from "~/components/FullscreenSpinner";
import { api } from "@packages/backend/convex/_generated/api";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { Button } from "~/components/ui/button";

type SortOption = "latest" | "score";

export default function ThreeCellLogView() {
  const navigate = useNavigate();
  const allThreeCellEntries = useQuery(api.threeCells.allThreeCellEntries);

  const [sortBy, setSortBy] = useState<SortOption>(
    (localStorage.getItem("sortByLogValue") as SortOption) ?? "latest",
  );

  const handleSortChange = (value: SortOption) => {
    localStorage.setItem("sortByLogValue", value);
    setSortBy(value);
  };

  const sortedLogs = useMemo(() => {
    if (!allThreeCellEntries) return [];
    const logs = allThreeCellEntries;

    switch (sortBy) {
      case "score":
        return logs.sort((a, b) => b.score - a.score);
      case "latest":
      default:
        return logs.sort(
          (a, b) =>
            new Date(b.dateFor).getTime() - new Date(a.dateFor).getTime(),
        );
    }
  }, [allThreeCellEntries, sortBy]);

  if (allThreeCellEntries !== undefined && allThreeCellEntries?.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <NoEntriesThreeCells />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div>
        <div className="font-medium mb-2">Sort by</div>
        <RadioGroup
          value={sortBy}
          onValueChange={(value: SortOption) => handleSortChange(value)}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="latest" id="latest" />
            <Label htmlFor="latest">Latest</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="score" id="score" />
            <Label htmlFor="score">Score</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex-1 relative">
        <div className="flex-1 absolute h-full overflow-y-auto space-y-4">
          {sortedLogs.map((entry: DataModel["three_cells"]["document"]) => {
            const baseColor = SCORE_COLORS[entry.score.toString()] ?? "#ffffff";
            const bg = color(baseColor).fade(0.7).rgb().string();

            return (
              <div
                key={entry._id}
                style={{ backgroundColor: bg }}
                className="rounded-md p-4 shadow cursor-pointer"
                onClick={() => navigate(`/track/${entry.dateFor}`)}
              >
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>{format(new Date(entry.dateFor), "MMM dd, yyyy")}</span>
                  <span className="text-xs text-muted-foreground">
                    ({entry.score})
                  </span>
                </div>
                <div className="mt-2 text-sm">{entry.summary}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const NoEntriesThreeCells = () => {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full text-center">
        <div className="mx-auto mb-6 w-48 h-48 rounded-2xl bg-gradient-to-br from-slate-50 to-white shadow-lg flex items-center justify-center">
          {/* Simple SVG 'notebook' illustration */}
          <svg
            width="120"
            height="120"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <rect
              x="8"
              y="10"
              width="40"
              height="44"
              rx="3"
              fill="#F8FAFC"
              stroke="#E6E9EE"
            />
            <path
              d="M18 16h18M18 22h18M18 28h18"
              stroke="#CBD5E1"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="50" y="8" width="6" height="48" rx="1" fill="#E2E8F0" />
            <circle cx="53" cy="18" r="1.4" fill="#94A3B8" />
            <circle cx="53" cy="26" r="1.4" fill="#94A3B8" />
            <circle cx="53" cy="34" r="1.4" fill="#94A3B8" />
          </svg>
        </div>

        <h2 className="text-2xl font-semibold mb-2">No entries yet</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Three Cells helps you capture how your day went, build streaks, and
          track habits and metrics. Your journal entries will show up here once
          you start logging your days.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={() => navigate("/track")} className="px-5 py-2">
            Create today's entry
          </Button>
        </div>

        <div className="mt-8 text-xs text-center text-muted-foreground">
          Tip: Rate your day with one tap (Terrible → Amazing) and watch your
          streaks grow. You can also track metrics like study hours or weight.
        </div>
      </div>
    </div>
  );
};
