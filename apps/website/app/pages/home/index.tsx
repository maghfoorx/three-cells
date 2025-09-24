import AppleLogo from "~/components/AppleLogo";
import { cn } from "~/lib/utils";

export default function Home() {
  return (
    <main className="bg-white">
      <HeroSection />
      {/*<ProblemSection />*/}
      <SolutionSection />
      {/*<HowItWorksSection />*/}
      <TestimonialsSection />
      <FinalCTASection />
    </main>
  );
}

const HeroSection = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-16 items-center">
        <div className="flex flex-col gap-2 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900">
            Your days are slipping away. Take them back.
          </h1>
          <div className="">
            <h2 className="text-lg sm:text-xl md:text-2xl text-gray-600">
              Daily journal, habits & tasks app that actually works
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-2">
              Built by someone who tried everything else first
            </p>
          </div>
          <div>
            <AppStoreButton />
          </div>
        </div>
        <div className="flex justify-center">
          <img
            src="/main-app.png"
            alt="Three Cells daily productivity app interface showing journal, habits, and tasks"
            className="w-72 sm:w-80 h-auto max-w-full"
          />
        </div>
      </div>
    </section>
  );
};

const ProblemSection = () => {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-gray-900">
          You know the drill
        </h2>
        <div className="space-y-4 sm:space-y-6 text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
          <p>Monday: "This is it. I'm getting organized."</p>
          <p>
            Download Notion for journaling. Streaks for habits. Todoist for
            tasks.
          </p>
          <p>Tuesday: Spend 20 minutes finding the right app.</p>
          <p>Wednesday: Forget to check two of them.</p>
          <p className="font-semibold text-black text-xl sm:text-2xl pt-4">
            Sound familiar?
          </p>
        </div>
      </div>
    </section>
  );
};

const SolutionSection = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">
          One app. Three things. Actually stick to it.
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          The only productivity system you'll actually use every day
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
        <div className="text-center">
          <div className="mb-6 sm:mb-8">
            <img
              src="/main-app.png"
              alt="Daily journaling feature with three simple reflection questions"
              className="w-48 sm:w-64 h-auto mx-auto max-w-full"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
            Journal
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Two questions. One minute.
            <br className="hidden sm:block" />
            <span className="font-medium">
              Finally understand what makes you tick.
            </span>
          </p>
        </div>

        <div className="text-center">
          <div className="mb-6 sm:mb-8">
            <img
              src="/habits-ss.png"
              alt="Beautiful habit tracking with visual heatmaps and progress streaks"
              className="w-48 sm:w-64 h-auto mx-auto max-w-full"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
            Habits
          </h3>
          <p className="text-gray-600 leading-relaxed">
            One tap tracking. Addictive heatmaps.
            <br className="hidden sm:block" />
            <span className="font-medium">Watch your streak grow.</span>
          </p>
        </div>

        <div className="text-center sm:col-span-2 lg:col-span-1">
          <div className="mb-6 sm:mb-8">
            <img
              src="/tasks-ss.png"
              alt="Clean, distraction-free task management interface"
              className="w-48 sm:w-64 h-auto mx-auto max-w-full"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
            Tasks
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Zero fluff. Just what matters.
            <br className="hidden sm:block" />
            <span className="font-medium">Get stuff done, not organized.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  return (
    <section className="bg-gray-50 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 text-gray-900">
          Your new 5-minute morning ritual
        </h2>

        <div className="space-y-8 sm:space-y-12">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                Open Three Cells
              </h3>
              <p className="text-lg sm:text-xl text-gray-600">
                Everything's right there. No hunting for apps.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                Tap your habits
              </h3>
              <p className="text-lg sm:text-xl text-gray-600">
                Did you meditate yesterday? Tap. Instant dopamine hit.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                Reflect on yesterday
              </h3>
              <p className="text-lg sm:text-xl text-gray-600">
                Three questions. No overthinking. Spot patterns in your best
                days.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                Set today's intention
              </h3>
              <p className="text-lg sm:text-xl text-gray-600">
                Three tasks max. Close the app. Go live your life.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <p className="text-xl sm:text-2xl font-light text-gray-700">
            <span className="font-medium">5 minutes.</span> Every morning.{" "}
            <span className="font-medium">Life transformed.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 text-gray-900">
        What actual users say
      </h2>

      <div className="space-y-8 sm:space-y-12">
        <div className="border-l-4 border-black pl-6 sm:pl-8">
          <p className="text-lg sm:text-xl italic mb-3 sm:mb-4 text-gray-700 leading-relaxed">
            "I've tried everything. Notion for journaling, Todoist for tasks,
            random habit apps. This is the first app that's minimal and has
            everything I need to build my dream life. I actually use it every
            day."
          </p>
          <p className="font-semibold text-gray-900">Mags, Software Engineer</p>
        </div>

        <div className="border-l-4 border-black pl-6 sm:pl-8">
          <p className="text-lg sm:text-xl italic mb-3 sm:mb-4 text-gray-700 leading-relaxed">
            "Finally. An app that doesn't try to do everything. Clean design,
            works perfectly, does exactly what it promises. I'm genuinely happy
            I found this."
          </p>
          <p className="font-semibold text-gray-900">Mabroor</p>
        </div>
      </div>
    </section>
  );
};

const FinalCTASection = () => {
  return (
    <section className="bg-black text-white py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
          Ready to get your life together?
        </h2>
        <p className="mt-4 text-xl sm:text-2xl mb-8 sm:mb-12 text-gray-300 max-w-2xl mx-auto">
          stop app-hopping and started building better habits
        </p>

        <AppStoreButton />

        <div className="mt-2 sm:mt-4">
          <p className="text-gray-400 text-sm sm:text-base">
            <span className="font-medium text-white">Free to start</span> •
            Available on iPhone
          </p>
        </div>
        <div className="flex flex-row gap-6 items-center justify-center mt-8">
          <a
            href="/privacy"
            className="text-white"
            style={{
              color: "white",
            }}
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-white"
            style={{
              color: "white",
            }}
          >
            Terms of Service
          </a>
          <a
            href="mailto:hello@three-cells.com"
            className=""
            style={{
              color: "white",
            }}
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

const AppStoreButton = ({
  variant = "black",
}: {
  variant?: "black" | "white";
}) => {
  const baseClasses =
    "inline-flex items-center gap-3 px-4 py-2 bg-white rounded-lg border-2 border-gray-700";
  const variantClasses =
    variant === "white" ? "bg-black text-white" : "text-white";

  return (
    <a
      href="https://apps.apple.com/us/app/three-cells-your-life-system/id6747948986"
      // href="itms-apps://apps.apple.com/us/app/three-cells-your-life-system/id6747948986"
      // target="_blank"
      // rel="noopener noreferrer"
      className={cn(baseClasses, variantClasses)}
      // style={{ minWidth: "180px", height: "60px" }}
    >
      {/* Apple Logo */}
      <AppleLogo width={40} height={40} />

      {/* Text */}
      <div className="flex flex-col items-start text-left leading-none">
        <div className="text-xs font-normal">Download on the</div>
        <div className="text-lg font-semibold -mt-1">App Store</div>
      </div>
    </a>
  );
};
