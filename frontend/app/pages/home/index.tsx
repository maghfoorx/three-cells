import { Button } from "~/components/ui/button";
import type { Route } from "./+types/index";
import { useState } from "react";
import { Link } from "react-router";
import AppLogoIcon from "~/components/AppLogoIcon";
import { cn } from "~/lib/utils";
import { Card } from "~/components/ui/card";
import { ThreeCellDailyFormShell } from "./components/ThreeCellDailyFormShell";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Three Cells" },
    { name: "description", content: "Three Cells description" },
  ];
}

export default function Home() {
  return (
    <>
      <header className="my-4 mx-auto w-full text-sm not-has-[nav]:hidden lg:max-w-6xl">
        <nav className="flex items-center justify-between gap-4">
          <Link to={"/"}>
            <AppLogoIcon className="h-10 w-10 rounded-md" />
          </Link>
          <div />
        </nav>
      </header>
      <main className="w-full flex-1">
        <HeroSection />
      </main>
      <div className="hidden h-14.5 lg:block"></div>
    </>
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
            <Link to="/profile">
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
