import type React from "react";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { cn } from "~/lib/utils";
import LoggedOutHeader from "~/components/LoggedOutHeader";
import LoggedOutFooter from "~/components/LoggedOutFooter";
import {
  Check,
  CheckSquare,
  Calendar,
  Target,
  ArrowRight,
  Users,
  Clock,
  Star,
} from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full flex-1">
      <LoggedOutHeader />
      <HeroSection />
      <SocialProofSection />
      <TikTokBridgeSection />
      <VideoShowcaseSection />
      <WhyAllInOneMattersSection />
      <FeaturesOverviewSection />
      <TestimonialsSection />
      <FinalCTASection />
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

const VideoPlayer = ({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden shadow-lg border-2 border-gray-100",
        className
      )}
    >
      <video
        src={src}
        className="w-full h-auto"
        controls={false}
        autoPlay
        preload="metadata"
        muted
        playsInline
        aria-label={alt}
        loop
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

const HeroSection = () => {
  return (
    <Section>
      <div className="flex flex-col items-center justify-between gap-8">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Urgency Badge */}
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              Join people who simplified their productivity this month
            </span>
          </div>

          {/* Pain-Focused Headline */}
          <h1 className="text-5xl font-bold md:text-6xl leading-tight">
            Stop juggling{" "}
            <span className="text-red-600 line-through">6 different apps</span>
            <br />
            <span className="underline italic font-black text-green-600">
              Start winning daily
            </span>
          </h1>

          {/* Clear Value Prop */}
          <div className="text-xl text-muted-foreground max-w-2xl">
            The only productivity system you'll ever need: Journaling, Habits &
            Tasks united in one beautiful app
          </div>

          {/* Strong CTA with Risk Reduction */}
          <div className="mx-auto flex flex-col items-center gap-3">
            <Link to="/track">
              <Button
                className="text-lg px-8 py-5 bg-green-600 hover:bg-green-700"
                size={"lg"}
              >
                Start your productive life today
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            {/* <p className="text-sm text-muted-foreground">
              ✅ Free to start • ✅ No credit card required • ✅ 5-minute setup
            </p> */}
          </div>

          {/* Specific Outcome Promise */}
          <div className="text-lg max-w-3xl bg-blue-50 p-4 rounded-lg border border-blue-200">
            Identify the 2-3 habits that create your best days, track what
            matters most, and finally stop feeling scattered across multiple
            apps.
          </div>
        </div>
      </div>
    </Section>
  );
};

const TikTokBridgeSection = () => {
  return (
    <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-full">
      <Section className="py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            🎵 Came here from TikTok? You're in the right place!
          </h2>
          <p className="text-lg max-w-2xl mx-auto">
            Hey! 👋 This is exactly the app that helps you build good habits,
            journal and keep your tasks in one place.
          </p>
        </div>
      </Section>
    </div>
  );
};

const SocialProofSection = () => {
  return (
    <Section className="py-16">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">
          Backed by the world's top thinkers
        </h2>
        <p className="text-xl text-muted-foreground">
          This isn't another productivity fad. It's the method used by
          bestselling authors and peak performers.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:items-center md:justify-center">
        <div className="flex flex-col items-center text-center max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
          <img
            src={"/cal-newport.webp"}
            alt="Cal Newport"
            className="w-32 h-32 object-cover rounded-full mb-4 border-4 border-blue-200"
          />
          <h3 className="text-xl font-semibold">Cal Newport</h3>
          <p className="text-sm text-blue-600 font-medium mb-2">
            Author of "Deep Work" (500K+ copies sold)
          </p>
          <p className="text-base">
            "This tracking method is essential for maintaining focus, producing
            great work, and building an intentional life."
          </p>
        </div>

        <div className="flex flex-col items-center text-center max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
          <img
            src={"/jim-collins.webp"}
            alt="Jim Collins"
            className="w-32 h-32 object-cover rounded-full mb-4 border-4 border-green-200"
          />
          <h3 className="text-xl font-semibold">Jim Collins</h3>
          <p className="text-sm text-green-600 font-medium mb-2">
            Author of "Good to Great" (4M+ copies sold)
          </p>
          <p className="text-base">
            Uses daily tracking to understand what makes good days great. "This
            method helps me stay focused and do my best work."
          </p>
        </div>
      </div>
    </Section>
  );
};

const VideoShowcaseSection = () => {
  return (
    <div className="bg-gray-50 w-full">
      <Section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            See it in action (3 quick demos)
          </h2>
          <p className="text-xl text-muted-foreground">
            Watch how simple it is to transform your daily routine
          </p>
        </div>

        <div className="space-y-16">
          {/* Journaling Demo */}
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="bg-blue-50 p-2 rounded-lg w-fit mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4">
                Daily Journaling: Find Your Success Pattern
              </h3>
              <div className="space-y-4 text-lg">
                <p className="font-medium text-blue-800">
                  Just 3 questions. 2 minutes daily. Life-changing insights.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Identify what makes your best days great
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Spot patterns you never noticed before
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Make small changes for massive improvements
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex-1">
              <VideoPlayer
                src="/demo-videos/three-cells.mp4"
                alt="Three cells daily journaling demo"
                className="max-w-lg mx-auto"
              />
            </div>
          </div>

          {/* Habits Demo */}
          <div className="flex flex-col-reverse lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <VideoPlayer
                src="/demo-videos/habits.mp4"
                alt="Habit tracking demo with heatmaps"
                className="max-w-lg mx-auto"
              />
            </div>
            <div className="flex-1">
              <div className="bg-green-50 p-2 rounded-lg w-fit mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4">
                Habit Tracking: Build Unstoppable Momentum
              </h3>
              <div className="space-y-4 text-lg">
                <p className="font-medium text-green-800">
                  One click. Visual progress. Motivation that lasts.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Gorgeous yearly heatmaps show your progress
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Color-coded streaks keep you motivated
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Weekly insights reveal your patterns
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tasks Demo */}
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="bg-purple-50 p-2 rounded-lg w-fit mb-4">
                <CheckSquare className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4">
                Task Management: Focus Without Overwhelm
              </h3>
              <div className="space-y-4 text-lg">
                <p className="font-medium text-purple-800">
                  Clean. Simple. Satisfying. Everything you need, nothing you
                  don't.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Edit tasks inline - no popup windows
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Satisfying completion animations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Keyboard shortcuts for power users
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex-1">
              <VideoPlayer
                src="/demo-videos/tasks.mp4"
                alt="Task management demo"
                className="max-w-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

const WhyAllInOneMattersSection = () => {
  return (
    <Section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold md:text-5xl mb-4">
          Why "all-in-one" changes everything
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Ever forgot to journal because you were busy checking habits in
          another app? Or lost track of your goals while switching between
          Todoist, Streaks, and Notes?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
        <div className="p-8 bg-red-50 rounded-xl border-2 border-red-200">
          <h3 className="text-2xl font-bold text-red-800 mb-4 flex items-center gap-2">
            😫 The scattered way
          </h3>
          <ul className="space-y-3 text-red-700 text-lg">
            <li>• Switching between 6+ different apps daily</li>
            <li>• Losing context every time you switch</li>
            <li>• Forgetting to check half your tools</li>
            <li>• No connection between habits and outcomes</li>
            <li>• Feeling overwhelmed by complexity</li>
            <li>• Never seeing the full picture of your progress</li>
          </ul>
        </div>

        <div className="p-8 bg-green-50 rounded-xl border-2 border-green-200">
          <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
            ✨ The Three Cells way
          </h3>
          <ul className="space-y-3 text-green-700 text-lg">
            <li>• One beautiful, unified interface</li>
            <li>• See how your habits affect your best days</li>
            <li>• Complete daily routine in less than 5 minutes</li>
            <li>• Everything connects and makes sense</li>
            <li>• Lightning-fast keyboard shortcuts</li>
            <li>• Finally understand what drives your success</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 p-8 rounded-xl max-w-4xl mx-auto border border-blue-200">
        <p className="text-lg text-center leading-relaxed">
          <strong className="text-blue-800">
            After years of trying complex systems and juggling multiple apps, I
            built exactly what I wanted:
          </strong>{" "}
          a simple, beautiful tool that brings everything together. No more app
          switching. No more lost context. Just pure focus on building the life
          you want.
        </p>
      </div>
    </Section>
  );
};

const FeaturesOverviewSection = () => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white w-full">
      <Section className="py-16">
        <h2 className="text-4xl font-bold md:text-5xl leading-tight text-center mb-4">
          Everything you need, nothing you don't
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
          Built for people who want results, not complexity. Every feature
          serves a purpose.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Daily Journaling</h3>
            <p className="text-muted-foreground text-lg">
              Three powerful questions reveal patterns in your best days. Track
              what matters and optimize your life systematically.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Target className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Smart Habits</h3>
            <p className="text-muted-foreground text-lg">
              Simple one-click tracking with beautiful yearly heatmaps. See your
              progress at a glance and stay motivated long-term.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <CheckSquare className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Effortless Tasks</h3>
            <p className="text-muted-foreground text-lg">
              Clean, distraction-free task management. Edit inline, complete
              with satisfaction, and focus on what truly matters.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
};

const TestimonialsSection = () => {
  return (
    <Section className="py-16">
      <h2 className="text-4xl font-bold text-center mb-12">
        What people are saying
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
          <div className="flex items-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-5 w-5 text-yellow-400 fill-current"
              />
            ))}
          </div>
          <p className="text-gray-700 mb-4">
            "I have tried countless apps over the years. Notion for journaling.
            Todoist for tasks. Various habits app. This is the only app that is
            minimal and has everything I need to achieve my dream life."
          </p>
          <p className="font-semibold">Mags, Software Engineer</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
          <div className="flex items-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-5 w-5 text-yellow-400 fill-current"
              />
            ))}
          </div>
          <p className="text-gray-700 mb-4">
            "Cleanest UI I've seen. Simple. To the point. Does exactly what it
            says. Couldn't be happier."
          </p>
          <p className="font-semibold">Mabroor</p>
        </div>

        {/* <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
          <div className="flex items-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-5 w-5 text-yellow-400 fill-current"
              />
            ))}
          </div>
          <p className="text-gray-700 mb-4">
            "The interface is so clean and beautiful. I actually look forward to
            my daily check-in now. It takes 3 minutes and keeps me on track all
            day."
          </p>
          <p className="font-semibold">Elena R., Designer</p>
        </div> */}
      </div>
    </Section>
  );
};

const FinalCTASection = () => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-blue-600 w-full">
      <Section className="py-20 text-center text-white">
        <h2 className="text-5xl font-bold mb-6">
          Your productive life starts today
        </h2>
        <p className="text-xl mb-4 max-w-3xl mx-auto opacity-90">
          Stop juggling apps and start building the life you want.
        </p>
        <p className="text-lg mb-8 opacity-80">
          The method trusted by Cal Newport and Jim Collins, now in one
          beautiful app.
        </p>

        <div className="flex flex-col items-center gap-6">
          <Link to="/track">
            <Button
              className="text-xl px-12 py-6 bg-white text-green-600 hover:bg-gray-100 font-bold"
              size={"lg"}
            >
              Get started for free
              <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>

          {/* <div className="flex items-center gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Completely free</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>No credit card required</span>
            </div>
          </div> */}
        </div>
      </Section>
    </div>
  );
};
