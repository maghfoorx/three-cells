import { Button } from "~/components/ui/button";
import type { Route } from "./+types/index";
import { Link } from "react-router";
import { cn } from "~/lib/utils";
import { ThreeCellDailyFormShell } from "./components/ThreeCellDailyFormShell";
import LoggedOutHeader from "~/components/LoggedOutHeader";
import LoggedOutFooter from "~/components/LoggedOutFooter";

export default function Home() {
  return (
    <main className="flex flex-col gap-4 items-center w-full flex-1 px-4">
      <LoggedOutHeader />
      <HeroSection />
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
    <section className={cn("mx-auto w-full lg:max-w-6xl", className)}>
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
