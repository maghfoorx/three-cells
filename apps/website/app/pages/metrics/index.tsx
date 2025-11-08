import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { UserMetricCard } from "./UserMetricCard"; // Save the component separately

export default function MetricsPage() {
  const allSubmissions = useQuery(
    api.userMetrics.queries.getAllUserMetricSubmissions,
    { includeArchived: false },
  );

  const isLoading = allSubmissions === undefined;

  return (
    <div className="flex flex-col h-full flex-1 gap-3 rounded-xl rounded-t-none p-2">
      <div className="flex-1 relative">
        <div className="absolute h-full w-full overflow-y-auto space-y-3 px-1 md:px-2">
          {isLoading && (
            <>
              {Array.from({ length: 1 }, (_, i) => (
                <UserMetricCard.Skeleton key={i} />
              ))}
            </>
          )}
          {!isLoading &&
            allSubmissions?.map(({ metric, submissions }) => (
              <UserMetricCard
                key={metric._id}
                metric={metric}
                submissions={submissions}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
