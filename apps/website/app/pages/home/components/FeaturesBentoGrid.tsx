import {
  Activity,
  Calendar,
  Zap,
  TrendingUp,
  Target,
  BarChart3,
  Heart,
  Flame,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "~/components/ui/card";
import { AppStoreButton, WebButton } from "./CTAButtons";

const FEATURES = [
  {
    id: "journaling",
    title: "Daily Journaling",
    description:
      "Reflect on your day with simple prompts. Rate your day from Terrible to Amazing. Understand what makes you tick.",
    icon: Calendar,
    size: "col-span-1 row-span-2",
    keywords: "daily journaling app, personal journal, day reflection",
  },
  {
    id: "habit-tracking",
    title: "Habit Tracking & Streaks",
    description:
      "Build consistent habits with visual streak tracking. GitHub-style heatmaps show your daily progress at a glance.",
    icon: Flame,
    size: "col-span-1 row-span-1",
    keywords: "habit tracker, streak counter, habit building app",
  },
  {
    id: "metrics",
    title: "Track Metrics & Analytics",
    description:
      "Monitor hours studied, calories, weight, or any metric that matters. Interactive graphs reveal trends and patterns.",
    icon: TrendingUp,
    size: "col-span-1 row-span-1",
    keywords: "metric tracker, health tracking, analytics app",
  },
  {
    id: "minimal",
    title: "Beautifully Minimal Design",
    description:
      "No clutter. No overwhelming features. Just the essentials designed with intentionality and care.",
    icon: Zap,
    size: "col-span-1 row-span-1",
    keywords: "minimal app, simple design, productivity app",
  },
  {
    id: "all-in-one",
    title: "All-in-One Life System",
    description:
      "Stop juggling Notion, Todoist, and random habit apps. Everything you need in one beautifully designed place.",
    icon: Target,
    size: "col-span-2 row-span-1",
    keywords: "all-in-one productivity, notion alternative, app consolidation",
  },
];

export default function FeaturesBentoGrid() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Everything you need to track your life
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
          The perfect habit tracker, journal, and metrics app combined into one
          beautifully simple system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Row 1: Three feature cards (Journaling, Habit Tracking, Metrics) */}
        {FEATURES.slice(0, 3).map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className="md:col-span-1 bg-white border border-gray-200 rounded-xl p-6 sm:p-8 hover:border-gray-300 transition-colors duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Icon className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* SEO keywords (hidden but in DOM for search engines) */}
              <div className="sr-only">{feature.keywords}</div>
            </div>
          );
        })}

        {/* Row 2: Minimal Design card (1 col) + Ready to try card (2 cols) */}
        <div className="md:col-span-1 bg-white border border-gray-200 rounded-xl p-6 sm:p-8 hover:border-gray-300 transition-colors duration-200 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Zap className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Beautifully Minimal Design
          </h3>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
            No clutter. No overwhelming features. Just the essentials designed
            with intentionality and care.
          </p>

          <div className="sr-only">
            minimal app, simple design, productivity app
          </div>
        </div>

        <Card className="md:col-span-2 border-gray-200">
          <CardHeader>
            <h3 className="text-lg font-bold text-gray-900">Ready to try?</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-gray-600">
              Available on iPhone and web. Three Cells is built for people who
              want a simple, habit-focused life system. Try the demo, watch
              screenshots, or download the app.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <AppStoreButton />
              <WebButton />
            </div>
          </CardContent>
        </Card>

        {/* Row 3: All-in-one card (3 cols - full width) */}
        <div className="md:col-span-3 bg-white border border-gray-200 rounded-xl p-6 sm:p-8 hover:border-gray-300 transition-colors duration-200 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Target className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            All-in-One Life System
          </h3>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
            Stop juggling Notion, Todoist, and random habit apps. Everything you
            need in one beautifully designed place.
          </p>

          <div className="sr-only">
            all-in-one productivity, notion alternative, app consolidation
          </div>
        </div>
      </div>

      {/* SEO-optimized problem/solution content */}
      <div className="pt-12 sm:pt-16">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          The problem with existing productivity apps
        </h3>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              App Fatigue
            </h4>
            <p className="text-gray-600 leading-relaxed">
              You download Notion for journaling, Todoist for tasks, Streaks for
              habit tracking, and a fitness app for metrics. By week two, you've
              forgotten which apps to check. Sound familiar?
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Our Solution
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Three Cells is the habit tracking and journaling app designed by
              someone who tried everything else first. One app. Three essential
              features. Actually built to stick.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Feature Overwhelm
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Most productivity apps try to be everything. This creates analysis
              paralysis. You spend more time organizing than actually tracking.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Beautifully Simple
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Three Cells strips away the noise. Journal daily, build habits
              with visual streaks, track metrics with gorgeous graphs. That's
              it. That's the app.
            </p>
          </div>
        </div>
      </div>

      {/* SEO schema-friendly benefits section */}
      <div className="sm:mt-20 pt-12 sm:pt-16">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          Why Three Cells is different
        </h3>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Heart className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Habit Tracking That Works
              </h4>
              <p className="text-gray-600 text-sm">
                One-tap habit logging with addictive heatmap visualizations.
                Build streaks and watch your consistency grow.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <BarChart3 className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Data Visualization
              </h4>
              <p className="text-gray-600 text-sm">
                Interactive graphs for any metric. See patterns in your data
                that reveal what drives your best days.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Activity className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Daily Reflection
              </h4>
              <p className="text-gray-600 text-sm">
                Simple prompts to journal daily and rate your day. Understand
                what makes you tick and optimize for better days.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Zap className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Zero Learning Curve
              </h4>
              <p className="text-gray-600 text-sm">
                Minimal, intuitive design means you start tracking in seconds.
                No complex setup. No overwhelming tutorials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
