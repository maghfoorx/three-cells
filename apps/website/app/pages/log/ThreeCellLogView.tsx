import { useQuery, usePaginatedQuery } from "convex/react";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import color from "color";
import { SCORE_COLORS, type ThreeCellLog } from "~/types";
import { api } from "@packages/backend/convex/_generated/api";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { useRef, useEffect } from "react";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";

type SortOption = "latest" | "score";

function HighlightedText({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) {
  if (!highlight.trim()) {
    return <div className="text-sm">{text}</div>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <div className="text-sm">
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="font-bold bg-yellow-200 text-gray-900">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </div>
  );
}

function ThreeCellEntryCard({
  entry,
  highlight = "",
  onClick,
}: {
  entry: DataModel["three_cells"]["document"];
  highlight?: string;
  onClick: () => void;
}) {
  const baseColor = SCORE_COLORS[entry.score.toString()] ?? "#ffffff";
  const bg = color(baseColor).fade(0.7).rgb().string();

  const entryDate = new Date(entry.dateFor);
  const isCurrentYear = entryDate.getFullYear() === new Date().getFullYear();
  const dateFormat = isCurrentYear ? "EEEE d MMM" : "EEEE MMM d, yyyy";

  return (
    <div
      style={{ backgroundColor: bg }}
      className="rounded-md shadow cursor-pointer flex flex-col pt-3 pb-2 px-4"
      onClick={onClick}
    >
      <div className="mb-2">
        <HighlightedText text={entry.summary} highlight={highlight} />
      </div>

      <Separator className="bg-black/5 mb-1" />

      <div className="flex justify-between items-center text-xs text-muted-foreground/80">
        <span>{format(entryDate, dateFormat)}</span>
        <span>Score: {entry.score}</span>
      </div>
    </div>
  );
}

export default function ThreeCellLogView() {
  const navigate = useNavigate();
  const {
    results: allThreeCellEntries,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.threeCells.paginatedThreeCellEntriesWithSummary,
    {},
    { initialNumItems: 20 },
  );

  const [sortBy, setSortBy] = useState<SortOption>(
    (localStorage.getItem("sortByLogValue") as SortOption) ?? "latest",
  );

  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  const searchResults = useQuery(api.threeCells.searchEntries, {
    searchQuery: debouncedSearchText,
  });

  const handleSortChange = (value: SortOption) => {
    localStorage.setItem("sortByLogValue", value);
    setSortBy(value);
  };
  console.log(allThreeCellEntries, "ALL_THREE_CELLS_ENTRIES")
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

  if (allThreeCellEntries !== undefined && allThreeCellEntries?.length === 0 && status !== "LoadingFirstPage") {
    return (
      <div className="flex-1 flex flex-col">
        <NoEntriesThreeCells />
      </div>
    );
  }

  const isSearching = searchText.length > 0;

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search your journal..."
          className="pl-9 pr-8"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {searchText.length > 0 && (
          <button
            onClick={() => setSearchText("")}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Sort Options - only show when not searching */}
      {!isSearching && (
        <div className="flex flex-row justify-between items-center mb-4">
          <div className="relative h-8 rounded-md bg-gray-100 flex flex-row p-1 gap-1">
            <button
              onClick={() => handleSortChange("latest")}
              className={cn(
                "w-20 px-3 py-1 text-xs font-medium rounded-sm transition-all",
                sortBy === "latest"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              LATEST
            </button>
            <button
              onClick={() => handleSortChange("score")}
              className={cn(
                "w-20 px-3 py-1 text-xs font-medium rounded-sm transition-all",
                sortBy === "score"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              SCORE
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        <div className="flex-1 absolute h-full w-full overflow-y-auto space-y-4">
          {isSearching ? (
            // Search Results
            !searchResults || searchText !== debouncedSearchText ? (
              <div className="flex items-center justify-center pt-8">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center pt-8 text-muted-foreground">
                No entries found matching "{debouncedSearchText}"
              </div>
            ) : (
              searchResults.map((entry) => (
                <ThreeCellEntryCard
                  key={entry._id}
                  entry={entry}
                  highlight={debouncedSearchText}
                  onClick={() => navigate(`/track/${entry.dateFor}`)}
                />
              ))
            )
          ) : (
            // Standard Sorted List
            <>
              {sortedLogs.map((entry: DataModel["three_cells"]["document"]) => (
                <ThreeCellEntryCard
                  key={entry._id}
                  entry={entry}
                  onClick={() => navigate(`/track/${entry.dateFor}`)}
                />
              ))}
              <div className="py-4 flex justify-center">
                {status === "LoadingMore" ? (
                  <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                ) : status === "CanLoadMore" ? (
                  <InfiniteScrollTrigger onIntersect={() => loadMore(20)} />
                ) : status !== "LoadingFirstPage" ? (
                  <div className="text-xs text-muted-foreground">
                    No more entries
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfiniteScrollTrigger({ onIntersect }: { onIntersect: () => void }) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onIntersect();
      }
    });

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onIntersect]);

  return <div ref={elementRef} className="h-4 w-full" />;
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
