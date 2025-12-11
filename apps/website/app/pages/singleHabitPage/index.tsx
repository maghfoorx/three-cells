import { Calendar, Flame, Award, CheckCircle2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { format } from "date-fns";
import { useQuery } from "convex/react";
import { AnimatePresence } from "framer-motion";
import { useParams } from "react-router";
import SubmissionsCalendarHeatmap from "./SubmissionsCalendarHeatmap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { api } from "@packages/backend/convex/_generated/api";
import { Skeleton } from "~/components/ui/skeleton";
import PerformanceGraph from "./PerformanceGraph";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import StreaksView from "./StreaksGraph";

export default function SingleHabitPage() {
  const params = useParams();
  const habitId = params.habitId as DataModel["userHabits"]["document"]["_id"];

  const result = useQuery(api.habits.getAllSubmissionsForHabit, {
    habitId: habitId,
  });

  const habit = result?.habit;
  const allSubmissions = result?.allSubmissions ?? [];
  const stats = result?.stats;
  const recentActivity = result?.recentActivity ?? [];

  return (
    <div className="flex flex-col h-full flex-1 gap-3 rounded-xl rounded-t-none p-2">
      <div className="px-4 flex items-center">
        {habit?.name === undefined && (
          <h1 className="font-semibold text-3xl px-4 py-2 blur-md">
            You're Awesome
          </h1>
        )}
        {habit?.name !== undefined && (
          <>
            {habit.icon ? (
              <div className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center flex-shrink-0">
                <img src={`/${habit.icon}`} className="w-full h-full object-cover scale-150" alt="" />
              </div>
            ) : (
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: habit.colour }}
              ></span>
            )}
            <h1 className="font-semibold text-3xl px-4 py-2">{habit?.name}</h1>
          </>
        )}
      </div>
      <div className="flex-1 relative">
        <div className="absolute h-full w-full overflow-y-auto space-y-3">
          <AnimatePresence>
            <SubmissionsCalendarHeatmap
              allSubmissions={allSubmissions}
              habit={habit}
            />
          </AnimatePresence>

          {/* Add the Performance Graph */}
          <PerformanceGraph
            habitId={habitId}
            habitColor={habit?.colour ?? "#00000"}
          />

          <StreaksView
            habitId={habitId}
            habitColor={habit?.colour ?? "#00000"}
          />

          <div className="space-y-6">
            <ProgressRings habit={habit} stats={stats} />
            <RecentActivity recentActivity={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Simplified stats component - no more calculations!
const HabitStats = ({ stats }: { stats: any }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="rounded-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          {stats?.currentStreak != null ? (
            <div className="text-2xl font-bold">{stats?.currentStreak}</div>
          ) : (
            <Skeleton className="h-8 w-6" />
          )}
          <p className="text-xs text-muted-foreground">days in a row</p>
        </CardContent>
      </Card>

      <Card className="rounded-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
          <Award className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          {stats?.longestStreak != null ? (
            <div className="text-2xl font-bold">{stats?.longestStreak}</div>
          ) : (
            <Skeleton className="h-8 w-6" />
          )}
          <p className="text-xs text-muted-foreground">personal record</p>
        </CardContent>
      </Card>

      <Card className="rounded-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          {stats?.thisMonth != null ? (
            <div className="text-2xl font-bold">{stats?.thisMonth}</div>
          ) : (
            <Skeleton className="h-8 w-6" />
          )}
          <p className="text-xs text-muted-foreground">completed days</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Simplified progress rings - no more calculations!
const ProgressRings = ({
  stats,
  habit,
}: {
  stats: any;
  habit: DataModel["userHabits"]["document"] | undefined;
}) => {
  console.log(habit?.colour, "ARE_STATS");
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="text-lg">Progress Overview</CardTitle>
        <CardDescription>Your performance this week and month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>This Week</span>
            {stats?.progress?.weekCount != null ? (
              <span>{stats.progress.weekCount}/7 days</span>
            ) : (
              <Skeleton className="h-4 w-10" />
            )}
          </div>
          <Progress
            value={stats?.progress?.week != null ? stats.progress.week : 0}
            className="h-2"
            color={habit?.colour ?? undefined}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>This Month</span>
            {stats?.progress?.monthCount != null ? (
              <span>{stats.progress.monthCount} days</span>
            ) : (
              <Skeleton className="h-4 w-10" />
            )}
          </div>
          <Progress
            value={stats?.progress?.month != null ? stats.progress.month : 0}
            className="h-2"
            color={habit?.colour ?? undefined}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Simplified recent activity - no more calculations!
const RecentActivity = ({ recentActivity }: { recentActivity: any[] }) => {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>Last 7 submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentActivity.map((submission) => (
            <div
              key={submission.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${submission.value ? "bg-green-500" : "bg-red-500"
                    }`}
                />
                <span className="text-sm">
                  {format(new Date(submission.dateFor), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {submission.value ? (
                  <Badge
                    variant="secondary"
                    className="text-green-700 bg-green-100"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-red-700 bg-red-100"
                  >
                    Missed
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
