import { gql, useQuery } from "@apollo/client";
import { Label } from "~/components/ui/label";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import color from "color";
import { SCORE_COLORS, type ThreeCellLog } from "~/types";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import FullscreenSpinner from "~/components/FullscreenSpinner";

const ALL_THREE_CELL_ENTRIES = gql`
  query AllThreeCellEntries {
    allThreeCellEntries {
      id
      date_for
      score
      summary
      focused_hours
    }
  }
`;

type SortOption = "latest" | "score" | "focused_hours";

export default function ThreeCellLogView() {
  const navigate = useNavigate();
  const { data } = useQuery(ALL_THREE_CELL_ENTRIES);
  const [sortBy, setSortBy] = useState<SortOption>(
    (localStorage.getItem("sortByLogValue") as SortOption) ?? "latest"
  );

  const handleSortChange = (value: SortOption) => {
    localStorage.setItem("sortByLogValue", value);
    setSortBy(value);
  };

  const sortedLogs = useMemo(() => {
    if (!data?.allThreeCellEntries) return [];
    const logs = [...data.allThreeCellEntries];

    switch (sortBy) {
      case "score":
        return logs.sort((a, b) => b.score - a.score);
      case "focused_hours":
        return logs.sort((a, b) => b.focused_hours - a.focused_hours);
      case "latest":
      default:
        return logs.sort(
          (a, b) =>
            new Date(b.date_for).getTime() - new Date(a.date_for).getTime()
        );
    }
  }, [data, sortBy]);

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
          {sortedLogs.map((entry: ThreeCellLog) => {
            const baseColor = SCORE_COLORS[entry.score.toString()] ?? "#ffffff";
            const bg = color(baseColor).fade(0.7).rgb().string();

            return (
              <div
                key={entry.id}
                style={{ backgroundColor: bg }}
                className="rounded-lg p-4 shadow cursor-pointer"
                onClick={() => navigate(`/track/${entry.date_for}`)}
              >
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>
                    {format(new Date(entry.date_for), "MMM dd, yyyy")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({entry.score})
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {entry.focused_hours}h focused
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
