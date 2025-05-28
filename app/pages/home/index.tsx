import type React from "react";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { cn } from "~/lib/utils";
import { ThreeCellDailyFormShell } from "./components/ThreeCellDailyFormShell";
import LoggedOutHeader from "~/components/LoggedOutHeader";
import LoggedOutFooter from "~/components/LoggedOutFooter";
import {
  Check,
  CheckSquare,
  Calendar,
  Target,
  Users,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full flex-1">
      <LoggedOutHeader />
      <HeroSection />
      <FeaturesOverviewSection />
      <JournalingSection />
      <HabitsSection />
      <TodosSection />
      <UsedBySuccessfulPeopleSection />
      <WhyAllInOneMattersSection />
      <TakeTheFirstStepToday />
      <LoggedOutFooter />
    </main>
  );
}

const Section = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section className={cn("mx-auto w-full lg:max-w-6xl px-4", className)}>
      {children}
    </section>
  );
};

const HeroSection = () => {
  return (
    <Section>
      <div className="flex flex-col items-center justify-between gap-8 py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-5xl font-bold md:text-6xl leading-tight">
            Your productivity,{" "}
            <span className="underline italic font-black">simplified</span>
          </h1>
          <div className="text-xl text-muted-foreground max-w-2xl">
            Journaling, Habits & Todos. All in one place.
          </div>
          <div className="text-lg max-w-3xl">
            Stop juggling multiple apps. Track your thoughts, build better
            habits, and manage tasks with a clean, intuitive interface designed
            to inspire action.
          </div>
          <div className="mx-auto">
            <Link to="/track">
              <Button className="text-lg px-8 py-6" size={"lg"}>
                Start your productive life
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
};

const FeaturesOverviewSection = () => {
  return (
    <div className="bg-secondary w-full">
      <Section className="py-16">
        <h2 className="text-4xl font-bold md:text-5xl leading-tight text-center mb-12">
          Everything you need in one place
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Daily Journaling</h3>
            <p className="text-muted-foreground">
              Three simple questions to understand what makes your best days
              great. Track patterns and optimize your life.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Habits</h3>
            <p className="text-muted-foreground">
              Simple checkbox tracking with yearly heatmaps. See your progress
              at a glance and stay motivated.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <CheckSquare className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Effortless Todos</h3>
            <p className="text-muted-foreground">
              Clean, distraction-free task management. Edit inline, complete
              with satisfaction, and stay focused on what matters.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
};

const JournalingSection = () => {
  return (
    <Section className="py-16">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1">
          <h2 className="text-4xl font-bold mb-6">
            Discover patterns in your best days
          </h2>
          <div className="space-y-4 text-lg">
            <p>
              Just three questions a day. That's all it takes to understand what
              makes your life fulfilling and productive.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Track what matters most to you
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Find patterns in your best days
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Make small changes for big improvements
              </li>
            </ul>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-col items-center p-6 rounded-lg">
            <div className="text-center font-semibold mb-2">
              Three simple questions
            </div>
            <ThreeCellDailyFormShell />
          </div>
        </div>
      </div>
    </Section>
  );
};

const HabitsSection = () => {
  return (
    <div className="bg-secondary w-full">
      <Section className="py-16">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                Morning Routine
              </h3>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, i) => (
                    <div key={day} className="flex flex-col items-center">
                      <span className="text-sm font-semibold uppercase">
                        {day}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {i + 1}
                      </span>
                      <div className="mt-1">
                        {i < 5 ? (
                          <Check className="text-green-700 h-6 w-6" />
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                5/7 days this week • 89% this month
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-6">Build habits that stick</h2>
            <div className="space-y-4 text-lg">
              <p>
                Simple checkbox tracking with powerful visual feedback. See your
                progress with yearly heatmaps that motivate you to keep going.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  One-click habit tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Beautiful yearly heatmaps
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Color-coded progress visualization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Weekly and monthly insights
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

const TodosSection = () => {
  return (
    <Section className="py-16">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1">
          <h2 className="text-4xl font-bold mb-6">
            Tasks that don't overwhelm
          </h2>
          <div className="space-y-4 text-lg">
            <p>
              Clean, distraction-free task management. Edit inline, complete
              with satisfaction, and focus on what truly matters.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Inline editing for quick updates
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Satisfying completion animations
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Clean, minimal interface
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Keyboard shortcuts for power users
              </li>
            </ul>
          </div>
        </div>
        <div className="flex-1">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-sm shadow-md bg-sky-300">
              <div className="w-5 h-5 border-2 border-gray-600 rounded mt-0.5"></div>
              <div className="flex-1">
                <div className="font-medium">Review quarterly goals</div>
                <div className="text-sm text-muted-foreground">
                  Check progress on Q4 objectives
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-sm shadow-md bg-green-200 opacity-60">
              <Check className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1 line-through">
                <div className="font-medium">Finish project proposal</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-sm shadow-md bg-sky-300">
              <div className="w-5 h-5 border-2 border-gray-600 rounded mt-0.5"></div>
              <div className="flex-1">
                <div className="font-medium">Call mom</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

const UsedBySuccessfulPeopleSection = () => {
  return (
    <div className="bg-secondary w-full">
      <Section className="py-16 flex flex-col items-center gap-10">
        <h2 className="text-4xl font-bold md:text-5xl leading-tight text-center">
          Backed by the world's top thinkers
        </h2>

        <div className="flex flex-col md:flex-row gap-10 md:items-center md:justify-center w-full">
          <div className="flex flex-col items-center text-center max-w-sm mx-auto">
            <img
              src={"/jim-collins.webp"}
              alt="Cal Newport"
              className="w-48 h-48 object-cover"
            />
            <h3 className="text-xl font-semibold">Jim Collins</h3>
            <p className="text-base mt-2">
              Author of <em>Good to Great</em>. Uses daily tracking to
              understand what makes good days great and bad days bad. This
              method helps him stay focused and do his best work.
            </p>
          </div>

          <div className="flex flex-col items-center text-center max-w-sm mx-auto">
            <img
              src={"/cal-newport.webp"}
              alt="Cal Newport"
              className="w-48 h-48 object-cover"
            />
            <h3 className="text-xl font-semibold">Cal Newport</h3>
            <p className="text-base mt-2">
              Author of <em>Deep Work</em>. Advocates for this tracking method
              to maintain focus, produce great work, and build an intentional
              life.
            </p>
          </div>
        </div>

        <p className="text-center text-lg max-w-2xl mt-6">
          This method is simple, effective, and used by people doing amazing
          things. Now you can combine it with habits and todos in one beautiful
          interface.
        </p>
      </Section>
    </div>
  );
};

const WhyAllInOneMattersSection = () => {
  return (
    <Section className="py-16 flex flex-col items-center gap-8">
      <h2 className="text-4xl font-bold md:text-5xl text-center">
        Why all-in-one matters
      </h2>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
        <div className="p-6 bg-red-50 rounded-lg border border-red-200">
          <h3 className="text-xl font-semibold text-red-800 mb-3">
            The old way
          </h3>
          <ul className="space-y-2 text-red-700">
            <li>• Switching between 5+ different apps</li>
            <li>• Losing context between tools</li>
            <li>• Forgetting to check everything</li>
            <li>• Overwhelming interfaces</li>
            <li>• No connection between habits and goals</li>
          </ul>
        </div>

        <div className="p-6 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-xl font-semibold text-green-800 mb-3">
            The simple way
          </h3>
          <ul className="space-y-2 text-green-700">
            <li>• One clean, beautiful interface</li>
            <li>• See connections between all areas</li>
            <li>• Build a complete daily routine</li>
            <li>• Keyboard shortcuts for speed</li>
            <li>• Everything works together</li>
          </ul>
        </div>
      </div>

      <p className="text-lg max-w-3xl text-center">
        After years of trying complex systems and multiple apps, I built what I
        actually wanted:
        <span className="font-semibold">
          {" "}
          a simple, beautiful tool that brings everything together
        </span>
        . No more app switching. No more lost context. Just pure focus on what
        matters.
      </p>
    </Section>
  );
};

const TakeTheFirstStepToday = () => {
  return (
    <div className="bg-secondary w-full">
      <Section className="py-16 flex flex-col items-center gap-6">
        <h2 className="text-4xl font-bold md:text-5xl leading-tight text-center">
          Start your productive life today
        </h2>
        <p className="text-xl text-muted-foreground text-center max-w-2xl">
          Join thousands who've simplified their productivity with journaling,
          habits, and todos in one beautiful place.
        </p>
        <Link to="/track">
          <Button className="text-lg px-8 py-6" size={"lg"}>
            Get started for free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </Section>
    </div>
  );
};
