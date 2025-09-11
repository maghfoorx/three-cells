import color from "color";
import { format } from "date-fns";
import { Info } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

const SCORE_OPTIONS = [
  { value: -2, emoji: "😭", color: "bg-red-500 hover:bg-red-600" },
  { value: -1, emoji: "😞", color: "bg-orange-400 hover:bg-orange-500" },
  { value: 0, emoji: "😐", color: "bg-yellow-400 hover:bg-yellow-500" },
  { value: 1, emoji: "😊", color: "bg-lime-400 hover:bg-lime-500" },
  { value: 2, emoji: "😁", color: "bg-green-500 hover:bg-green-600" },
];

const SCORE_COLORS: { [key: string]: string } = {
  "-2": "#ef4444",
  "-1": "#f97316",
  "0": "#eab308",
  "1": "#84cc16",
  "2": "#22c55e",
};

const FIELD_EXPLANATIONS = {
  summary: (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">📝</span>
        <h3 className="font-semibold">Today's Story</h3>
      </div>
      <p className="text-sm">
        Capture your day in one line! What made today special? Maybe you
        finished a big project, had a great conversation, or just needed a
        reset. This helps spot patterns in your best days.
      </p>
    </div>
  ),
  score: (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">💖</span>
        <h3 className="font-semibold">Vibe Check</h3>
      </div>
      <p className="text-sm">
        Rate your day honestly: -2 for "Ugh, never again" to +2 for "Heck yeah!"
        There's no wrong answer - this helps match feelings with what actually
        happened. Pro tip: Go with your gut!
      </p>
    </div>
  ),
};

export function ThreeCellDailyFormShell() {
  const [score, setScore] = React.useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Daily pulse stored!", {
      position: "top-center",
      style: {
        backgroundColor: "green",
        color: "white",
      },
    });
  };

  const cardColor = color(
    (SCORE_COLORS[score?.toString()] as string) ?? "#ffffff",
  )
    .fade(0.9)
    .rgb()
    .string();

  return (
    <Card
      className="max-w-[400px] bg-gray-100 p-6"
      style={{ backgroundColor: cardColor }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2">
            <Label className="text-xl font-semibold">Entry</Label>
            <Button disabled variant="outline" size={"sm"} className="text-xs">
              {format(new Date(), "dd MMM")}
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {/* Day Summary */}
            <div className="flex-1 space-y-1">
              <FormLabelWithInfo
                label="Summary"
                information={FIELD_EXPLANATIONS.summary}
              />
              <Textarea
                placeholder="Describe your day..."
                className="min-h-[80px] bg-white"
                value="A productive day working on new features"
                readOnly
              />
            </div>

            {/* Score Selector */}
            <div className="flex-1 space-y-1">
              <FormLabelWithInfo
                label="Score"
                information={FIELD_EXPLANATIONS.score}
              />
              <div className="flex h-[40px] gap-1">
                {SCORE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    size={"sm"}
                    type="button"
                    onClick={() => setScore(option.value)}
                    className={cn([
                      "min-w-[50px] flex-1 p-0 text-black transition-all",
                      option.value === score ? option.color : "bg-gray-100",
                    ])}
                  >
                    <span className="text-xs">
                      {option.emoji} {option.value}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className="mt-4 w-full" variant={"outline"}>
          Save Entry
        </Button>
      </form>
    </Card>
  );
}

const FormLabelWithInfo = ({
  label,
  information,
}: {
  label: string;
  information: React.ReactNode;
}) => {
  return (
    <div className="flex flex-row gap-1">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover>
        <PopoverTrigger className="group flex items-center gap-1.5">
          <Info className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent
          className="max-w-[300px] border-none bg-white shadow-lg"
          avoidCollisions={true}
        >
          <div className="space-y-3 p-3">
            {information}
            <p className="text-muted-foreground mt-2 text-xs italic">
              Inspired by Jim Collins' own life
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
