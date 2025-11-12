import {
  Heart,
  Brain,
  TrendingUp,
  Users,
  Leaf,
  BookOpen,
  Sparkles,
  Target,
  Zap,
  Home,
} from "lucide-react";
import { Card } from "~/components/ui/card";
import { AppStoreButton, WebButton } from "./CTAButtons";

const motivations = [
  {
    icon: Heart,
    title: "Be Healthier & Stronger",
    description: "Build the habits that lead to lasting physical wellness",
    color: "bg-red-50 text-red-600",
    accentColor: "border-red-200",
  },
  {
    icon: Brain,
    title: "Reduce Stress & Anxiety",
    description: "Find peace through mindfulness and consistent routines",
    color: "bg-purple-50 text-purple-600",
    accentColor: "border-purple-200",
  },
  {
    icon: Sparkles,
    title: "Become Your Best Self",
    description: "Level up and reach your full potential",
    color: "bg-yellow-50 text-yellow-600",
    accentColor: "border-yellow-200",
  },
  {
    icon: TrendingUp,
    title: "Build Consistency",
    description: "Stop procrastinating and stay productive day after day",
    color: "bg-blue-50 text-blue-600",
    accentColor: "border-blue-200",
  },
  {
    icon: Users,
    title: "Better Relationships",
    description: "Be present and dependable for the people you love",
    color: "bg-pink-50 text-pink-600",
    accentColor: "border-pink-200",
  },
  {
    icon: BookOpen,
    title: "Never Stop Learning",
    description: "Grow your skills and knowledge every single day",
    color: "bg-green-50 text-green-600",
    accentColor: "border-green-200",
  },
  {
    icon: Target,
    title: "Take Control of Your Life",
    description: "Create structure, eliminate chaos, live intentionally",
    color: "bg-indigo-50 text-indigo-600",
    accentColor: "border-indigo-200",
  },
  {
    icon: Leaf,
    title: "Live Sustainably",
    description: "Build habits that are good for you and the environment",
    color: "bg-emerald-50 text-emerald-600",
    accentColor: "border-emerald-200",
  },
  {
    icon: Zap,
    title: "Boost Energy & Feel Better",
    description: "Wake up energized and proud of your day",
    color: "bg-orange-50 text-orange-600",
    accentColor: "border-orange-200",
  },
  {
    icon: Home,
    title: "Build a Better Future",
    description: "Financial freedom and security for you and your family",
    color: "bg-slate-50 text-slate-600",
    accentColor: "border-slate-200",
  },
  {
    icon: Heart,
    title: "Create Good Habits That Stick",
    description: "Prove to yourself you can make changes that last",
    color: "bg-red-50 text-red-600",
    accentColor: "border-red-200",
  },
  {
    icon: Brain,
    title: "Find Confidence & Discipline",
    description: "Build self-trust through daily commitment",
    color: "bg-purple-50 text-purple-600",
    accentColor: "border-purple-200",
  },
  {
    icon: Users,
    title: "Be a Role Model",
    description: "Set an example of excellence for your kids and family",
    color: "bg-pink-50 text-pink-600",
    accentColor: "border-pink-200",
  },
  {
    icon: Sparkles,
    title: "Achieve Your Dreams",
    description: "Turn ambitions into reality through consistent action",
    color: "bg-yellow-50 text-yellow-600",
    accentColor: "border-yellow-200",
  },
  {
    icon: TrendingUp,
    title: "Master Your Day",
    description: "Make every day count and eliminate wasted time",
    color: "bg-blue-50 text-blue-600",
    accentColor: "border-blue-200",
  },
];

export default function WhyUsersSection() {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-balance">
            Why People Download Three Cells
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
            Join thousands who are transforming their lives with simple,
            beautiful habit tracking
          </p>
        </div>

        {/* Motivations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {motivations.map((motivation, index) => {
            const IconComponent = motivation.icon;
            return (
              <Card
                key={index}
                className={`p-6 border-l-4 hover:shadow-lg transition-all duration-300 cursor-pointer ${motivation.accentColor}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg flex-shrink-0 ${motivation.color}`}
                  >
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 leading-tight">
                      {motivation.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {motivation.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            Your journey to a better you starts with a single day. What will you
            track today?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AppStoreButton />
            <WebButton />
          </div>
        </div>
      </div>
    </section>
  );
}
