import { Button } from "~/components/ui/button";
import type { Route } from "./+types/index";
import { Link } from "react-router";
import { cn } from "~/lib/utils";
import { ThreeCellDailyFormShell } from "./components/ThreeCellDailyFormShell";
import LoggedOutHeader from "~/components/LoggedOutHeader";
import LoggedOutFooter from "~/components/LoggedOutFooter";
import SimplexGraph from "../../../public/simplex-method-graph.png";
import SadPicture from "../../../public/sad.webp";
import HappyPicture from "../../../public/happy.webp";

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full flex-1">
      <LoggedOutHeader />
      <HeroSection />
      <SimplexMethodSection />
      <AvoidLivingTheLiveYouDontLoveSection />
      <ImagineYourIdealLife />
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
      <div className="flex flex-col items-center justify-between gap-8">
        <div className="flex flex-col gap-5 text-center">
          <h1 className="text-5xl font-bold md:text-6xl leading-tight">
            Track less. <br />{" "}
            <span className="underline italic font-black">Achieve</span> more.
          </h1>
          <div>
            <div>Discover your best life with just three questions a day.</div>
            <div>
              A 30 second daily habit to help you understand what makes your
              best days so great.
            </div>
          </div>
          <div className="mx-auto">
            <Link to="/track">
              <Button className="" size={"lg"}>
                Start tracking
              </Button>
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-center font-semibold">
            Three simple questions
          </div>
          <ThreeCellDailyFormShell />
        </div>
      </div>
    </Section>
  );
};

const SimplexMethodSection = () => {
  return (
    <div className="bg-sky-200 w-full mt-4">
      <Section className="py-8">
        <h2 className="text-4xl font-bold md:text-5xl leading-tight text-center">
          Scientifically get your best life
        </h2>
        <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center items-start mt-10">
          <div className="max-w-md mx-auto">
            <div className="font-semibold text-lg">The simplex method</div>
            <ol className="mt-2 list-decimal list-inside space-y-2">
              <li>Look back on your logs.</li>
              <li>Find what your best days have in common.</li>
              <li>Make small changes to match those days.</li>
              <li>Repeat and get closer to your ideal life.</li>
            </ol>
          </div>
          <img
            src={SimplexGraph}
            alt="Graph showing daily data points connected by arrows leading to the ideal 'green' life dot"
            className="mx-auto mt-4 md:mt-0 rounded-md shadow-md"
            width={600}
          />
        </div>
      </Section>
    </div>
  );
};

const AvoidLivingTheLiveYouDontLoveSection = () => {
  return (
    <div className="bg-red-200 w-full">
      <Section className="py-8">
        <h2 className="text-4xl font-bold md:text-5xl leading-tight text-center">
          Avoid your worst life
        </h2>
        <div className="flex flex-col-reverse md:flex-row gap-4 md:justify-between md:items-center items-start mt-10">
          <img
            src={SadPicture}
            alt=""
            className="mx-auto mt-4 md:mt-0 rounded-md shadow-md"
            width={600}
          />
          <div className="max-w-md mx-auto">
            <ul className="list-disc list-inside space-y-2 text-lg">
              <li>1 in 4 adults feel unsatisfied with their daily routines.</li>
              <li>
                60% of people feel disconnected from their life's purpose.
              </li>
              <li>Big goals fade because no one tracks the small stuff.</li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-4">
          You can avoid this by tracking just 3 simple things.
        </div>
      </Section>
    </div>
  );
};

const ImagineYourIdealLife = () => {
  return (
    <div className="bg-green-200 w-full">
      <Section className="py-8">
        <h2 className="text-4xl font-bold md:text-5xl leading-tight text-center">
          Picture a life you love
        </h2>
        <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center items-start mt-10">
          <div className="max-w-md mx-auto">
            <ul className="list-disc list-inside space-y-2 text-lg md:text-lg leading-relaxed">
              <li>You wake up each day feeling energized and focused.</li>
              <li>Your routine is aligned with your values and passions.</li>
              <li>You’re making progress every day toward your best self.</li>
              <li>
                Each moment is more intentional, and your goals feel achievable.
              </li>
            </ul>
          </div>

          <img
            src={HappyPicture}
            alt=""
            className="mx-auto mt-4 md:mt-0 rounded-md shadow-md"
            width={600}
          />
        </div>
        <div className="text-center mt-4">
          This life is just 3 daily questions away.
        </div>
      </Section>
    </div>
  );
};

const TakeTheFirstStepToday = () => {
  return (
    <div className="bg-sky-200 w-full">
      <Section className="py-8 flex flex-col items-center gap-4">
        <h2 className="text-4xl font-bold md:text-5xl leading-tight text-center">
          Take the first step today
        </h2>
        <Link to="/track">
          <Button className="" size={"lg"}>
            Get your ideal life
          </Button>
        </Link>
      </Section>
    </div>
  );
};
