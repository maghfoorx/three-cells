// import {
//   Calendar,
//   TrendingUp,
//   Target,
//   Flame,
//   Award,
//   BarChart3,
//   Clock,
//   CheckCircle2,
// } from "lucide-react";
// import { Badge } from "~/components/ui/badge";
// import { Progress } from "~/components/ui/progress";
// import { Separator } from "~/components/ui/separator";
// import {
//   format,
//   startOfWeek,
//   endOfWeek,
//   startOfMonth,
//   endOfMonth,
//   subDays,
//   differenceInDays,
// } from "date-fns";
// import { api } from "convex/_generated/api";
// import type { DataModel } from "convex/_generated/dataModel";
// import { useQuery } from "convex/react";
// import { AnimatePresence } from "framer-motion";
// import { useParams } from "react-router";
// import SubmissionsCalendarHeatmap from "./SubmissionsCalendarHeatmap";
// import FullscreenSpinner from "~/components/FullscreenSpinner";
// import React, { Suspense, lazy, useMemo } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "~/components/ui/card";

// export default function SingleHabitPage() {
//   const params = useParams();

//   const habitId = params.habitId as DataModel["userHabits"]["document"]["_id"];

//   const result = useQuery(api.habits.getAllSubmissionsForHabit, {
//     habitId: habitId,
//   });

//   const habit = result?.habit;
//   const allSubmissions = result?.allSubmissions ?? [];

//   return (
//     <div className="flex flex-col h-full flex-1 gap-3 rounded-xl rounded-t-none p-2">
//       <div className="flex-1 relative">
//         <div className="absolute h-full w-full overflow-y-auto space-y-3">
//           <AnimatePresence>
//             <SubmissionsCalendarHeatmap
//               allSubmissions={allSubmissions}
//               habit={habit}
//               // Optional: customize date range
//               // startDate={new Date("2025-01-01")}
//               // endDate={new Date()}
//             />
//           </AnimatePresence>
//           {habit != null && (
//             <HabitStats habit={habit} allSubmissions={allSubmissions} />
//           )}
//           <div className="space-y-6">
//             <ProgressRings allSubmissions={allSubmissions} />
//             <RecentActivity allSubmissions={allSubmissions} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Helper function to calculate streaks
// const calculateStreaks = (
//   submissions: DataModel["userHabitSubmissions"]["document"][]
// ) => {
//   if (!submissions.length) return { current: 0, longest: 0 };

//   // Sort by date
//   const sortedSubmissions = [...submissions]
//     .filter((s) => s.value === true) // Only count successful submissions
//     .sort(
//       (a, b) => new Date(a.dateFor).getTime() - new Date(b.dateFor).getTime()
//     );

//   if (!sortedSubmissions.length) return { current: 0, longest: 0 };

//   let currentStreak = 0;
//   let longestStreak = 0;
//   let tempStreak = 1;

//   // Calculate longest streak in history
//   for (let i = 1; i < sortedSubmissions.length; i++) {
//     const prevDate = new Date(sortedSubmissions[i - 1].dateFor);
//     const currDate = new Date(sortedSubmissions[i].dateFor);
//     const daysDiff = differenceInDays(currDate, prevDate);

//     if (daysDiff === 1) {
//       tempStreak++;
//     } else {
//       longestStreak = Math.max(longestStreak, tempStreak);
//       tempStreak = 1;
//     }
//   }
//   longestStreak = Math.max(longestStreak, tempStreak);

//   // Calculate current streak (from today backwards)
//   const today = new Date();
//   const recentSubmissions = sortedSubmissions.reverse();

//   for (const submission of recentSubmissions) {
//     const submissionDate = new Date(submission.dateFor);
//     const daysDiff = differenceInDays(today, submissionDate);

//     if (daysDiff === currentStreak) {
//       currentStreak++;
//     } else {
//       break;
//     }
//   }

//   return { current: currentStreak, longest: longestStreak };
// };

// // Stats component
// const HabitStats = ({
//   habit,
//   allSubmissions,
// }: {
//   habit: DataModel["userHabits"]["document"];
//   allSubmissions: DataModel["userHabitSubmissions"]["document"][];
// }) => {
//   const stats = useMemo(() => {
//     const now = new Date();
//     const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
//     const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
//     const thisMonthStart = startOfMonth(now);
//     const thisMonthEnd = endOfMonth(now);
//     const last30Days = subDays(now, 30);

//     const successfulSubmissions = allSubmissions.filter(
//       (s) => s.value === true
//     );

//     const thisWeekSubmissions = successfulSubmissions.filter((s) => {
//       const date = new Date(s.dateFor);
//       return date >= thisWeekStart && date <= thisWeekEnd;
//     });

//     const thisMonthSubmissions = successfulSubmissions.filter((s) => {
//       const date = new Date(s.dateFor);
//       return date >= thisMonthStart && date <= thisMonthEnd;
//     });

//     const last30DaysSubmissions = successfulSubmissions.filter((s) => {
//       const date = new Date(s.dateFor);
//       return date >= last30Days;
//     });

//     const streaks = calculateStreaks(allSubmissions);

//     // Calculate completion rate
//     const totalDays = allSubmissions.length;

//     return {
//       totalCompleted: successfulSubmissions.length,
//       thisWeek: thisWeekSubmissions.length,
//       thisMonth: thisMonthSubmissions.length,
//       last30Days: last30DaysSubmissions.length,
//       currentStreak: streaks.current,
//       longestStreak: streaks.longest,
//       totalDays,
//     };
//   }, [allSubmissions]);

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       <Card className="rounded-sm">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
//           <Flame className="h-4 w-4 text-orange-500" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold">{stats.currentStreak}</div>
//           <p className="text-xs text-muted-foreground">days in a row</p>
//         </CardContent>
//       </Card>

//       <Card className="rounded-sm">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
//           <Award className="h-4 w-4 text-yellow-500" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold">{stats.longestStreak}</div>
//           <p className="text-xs text-muted-foreground">personal record</p>
//         </CardContent>
//       </Card>

//       <Card className="rounded-sm">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">This Month</CardTitle>
//           <Calendar className="h-4 w-4 text-blue-500" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold">{stats.thisMonth}</div>
//           <p className="text-xs text-muted-foreground">completed days</p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// // Progress rings component
// const ProgressRings = ({
//   allSubmissions,
// }: {
//   allSubmissions: DataModel["userHabitSubmissions"]["document"][];
// }) => {
//   const progress = useMemo(() => {
//     const now = new Date();
//     const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
//     const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
//     const thisMonthStart = startOfMonth(now);
//     const thisMonthEnd = endOfMonth(now);

//     const successfulSubmissions = allSubmissions.filter(
//       (s) => s.value === true
//     );

//     const thisWeekCount = successfulSubmissions.filter((s) => {
//       const date = new Date(s.dateFor);
//       return date >= thisWeekStart && date <= thisWeekEnd;
//     }).length;

//     const thisMonthCount = successfulSubmissions.filter((s) => {
//       const date = new Date(s.dateFor);
//       return date >= thisMonthStart && date <= thisMonthEnd;
//     }).length;

//     // Assuming target of 7 days per week, ~30 days per month
//     const weekProgress = Math.min((thisWeekCount / 7) * 100, 100);
//     const monthProgress = Math.min((thisMonthCount / 30) * 100, 100);

//     return {
//       week: Math.round(weekProgress),
//       month: Math.round(monthProgress),
//       weekCount: thisWeekCount,
//       monthCount: thisMonthCount,
//     };
//   }, [allSubmissions]);

//   return (
//     <Card className="rounded-sm">
//       <CardHeader>
//         <CardTitle className="text-lg">Progress Overview</CardTitle>
//         <CardDescription>Your performance this week and month</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <div className="space-y-2">
//           <div className="flex justify-between text-sm">
//             <span>This Week</span>
//             <span>{progress.weekCount}/7 days</span>
//           </div>
//           <Progress value={progress.week} className="h-2" />
//         </div>

//         <div className="space-y-2">
//           <div className="flex justify-between text-sm">
//             <span>This Month</span>
//             <span>{progress.monthCount} days</span>
//           </div>
//           <Progress value={progress.month} className="h-2" />
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// // Recent activity component
// const RecentActivity = ({
//   allSubmissions,
// }: {
//   allSubmissions: DataModel["userHabitSubmissions"]["document"][];
// }) => {
//   const recentSubmissions = useMemo(() => {
//     return [...allSubmissions]
//       .sort(
//         (a, b) => new Date(b.dateFor).getTime() - new Date(a.dateFor).getTime()
//       )
//       .slice(0, 7);
//   }, [allSubmissions]);

//   return (
//     <Card className="rounded-sm">
//       <CardHeader>
//         <CardTitle className="text-lg">Recent Activity</CardTitle>
//         <CardDescription>Last 7 submissions</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-2">
//           {recentSubmissions.map((submission, index) => (
//             <div
//               key={submission._id}
//               className="flex items-center justify-between py-2"
//             >
//               <div className="flex items-center gap-3">
//                 <div
//                   className={`w-2 h-2 rounded-full ${
//                     submission.value ? "bg-green-500" : "bg-red-500"
//                   }`}
//                 />
//                 <span className="text-sm">
//                   {format(new Date(submission.dateFor), "MMM d, yyyy")}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 {submission.value ? (
//                   <Badge
//                     variant="secondary"
//                     className="text-green-700 bg-green-100"
//                   >
//                     <CheckCircle2 className="w-3 h-3 mr-1" />
//                     Completed
//                   </Badge>
//                 ) : (
//                   <Badge
//                     variant="secondary"
//                     className="text-red-700 bg-red-100"
//                   >
//                     Missed
//                   </Badge>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };
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
