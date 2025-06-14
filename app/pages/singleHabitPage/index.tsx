import { Calendar, Flame, Award, CheckCircle2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { format } from "date-fns";
import { api } from "convex/_generated/api";
import type { DataModel } from "convex/_generated/dataModel";
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
      <h1 className="font-semibold text-3xl px-4 py-2">{habit?.name}</h1>
      <div className="flex-1 relative">
        <div className="absolute h-full w-full overflow-y-auto space-y-3">
          <AnimatePresence>
            <SubmissionsCalendarHeatmap
              allSubmissions={allSubmissions}
              habit={habit}
            />
          </AnimatePresence>

          {stats && <HabitStats stats={stats} />}

          <div className="space-y-6">
            {stats && <ProgressRings stats={stats} />}
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
          <div className="text-2xl font-bold">{stats.currentStreak}</div>
          <p className="text-xs text-muted-foreground">days in a row</p>
        </CardContent>
      </Card>

      <Card className="rounded-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
          <Award className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.longestStreak}</div>
          <p className="text-xs text-muted-foreground">personal record</p>
        </CardContent>
      </Card>

      <Card className="rounded-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.thisMonth}</div>
          <p className="text-xs text-muted-foreground">completed days</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Simplified progress rings - no more calculations!
const ProgressRings = ({ stats }: { stats: any }) => {
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
            <span>{stats.progress.weekCount}/7 days</span>
          </div>
          <Progress value={stats.progress.week} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>This Month</span>
            <span>{stats.progress.monthCount} days</span>
          </div>
          <Progress value={stats.progress.month} className="h-2" />
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
                  className={`w-2 h-2 rounded-full ${
                    submission.value ? "bg-green-500" : "bg-red-500"
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
