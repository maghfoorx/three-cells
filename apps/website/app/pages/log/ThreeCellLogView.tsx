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

type SortOption = "latest" | "score" | "focused_hours";

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
      case "focused_hours":
        return logs.sort((a, b) => b.focusedHours - a.focusedHours);
      case "latest":
      default:
        return logs.sort(
          (a, b) =>
            new Date(b.dateFor).getTime() - new Date(a.dateFor).getTime(),
        );
    }
  }, [allThreeCellEntries, sortBy]);

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
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="focused_hours" id="focused_hours" />
            <Label htmlFor="focused_hours">Focused hours</Label>
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
                className="rounded-lg p-4 shadow cursor-pointer"
                onClick={() => navigate(`/track/${entry.dateFor}`)}
              >
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>{format(new Date(entry.dateFor), "MMM dd, yyyy")}</span>
                  <span className="text-xs text-muted-foreground">
                    ({entry.score})
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {entry.focusedHours}h focused
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
