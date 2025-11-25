import { Globe2Icon, Star, StarHalf } from "lucide-react";
import AppScreenshotsCarousel from "./components/AppScreenShotsCarousel";
import FeaturesBentoGrid from "./components/FeaturesBentoGrid";
import { AppStoreButton, WebButton } from "./components/CTAButtons";
import WhyUsersSection from "./components/WhyUsersUseThreeCells";
import AppLogoIcon from "~/components/AppLogoIcon";
import Footer from "~/components/Footer";

export default function Home() {
  return (
    <main className="bg-white">
      <HeroSection />
      <FeaturesBentoGrid />
      <WhyUsersSection />
      <AppScreenshotsCarousel />
      <SolutionSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}

const HeroSection = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 pb-0 sm:py-20">
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-16 items-center">
        <div className="flex flex-col gap-2 text-center lg:text-left">
          <AppLogoIcon className="size-52 mx-auto" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900">
            Turn Motivation into Discipline
          </h1>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg sm:text-xl md:text-2xl text-gray-600">
              Build lasting habits. Journal daily to find your best days. Track
              metrics that push you forward.
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-2">
              Made by someone who tried everything else first
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 justify-center lg:justify-start">
            <AppStoreButton />
            <WebButton />
          </div>
          {/* ⭐ Rating text with stars */}
          <div className="flex flex-col md:flex-row items-center justify-center lg:justify-start mt-1 text-gray-600 text-sm">
            <div className="flex items-center gap-1 mr-1">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <StarHalf size={16} className="text-yellow-500 fill-yellow-500" />
            </div>
            Rated 4.4 stars on App Store (5,100+ downloads)
          </div>
        </div>
        <div className="flex justify-center">
          <video
            playsInline
            webkit-playsinline="true"
            muted
            autoPlay
            loop
            width="320" // Example based on w-80 being approx 320px
            height="675" // Calculate 320 * (19/9)
            className="w-72 sm:w-80 h-auto max-w-full aspect-[9/19] object-cover"
            poster="/main-app.webp"
          >
            {/* Safari / iOS: MOV with HEVC alpha or ProRes (if you need alpha) */}
            <source src="/app-demo-video-ios.mov" type="video/quicktime" />
            {/* Chrome/Firefox with alpha (on supported platforms) */}
            <source src="/app-demo-video.webm" type="video/webm" />
          </video>
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
              src="/main-app.webp"
              loading="lazy"
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
              loading="lazy"
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
              loading="lazy"
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
        <a href="https://twelve.tools" target="_blank">
          <img
            src="https://twelve.tools/badge0-dark.svg"
            alt="Featured on Twelve Tools"
            width="150"
            height="54"
            loading="lazy"
          />
        </a>
      </div>
    </section>
  );
};
