import { useForm } from "react-hook-form";
import color from "color";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "convex/react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useNavigate, useParams } from "react-router";
import { parse, format } from "date-fns";
import { SCORE_COLORS, SCORE_OPTIONS } from "~/types";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Info, LoaderCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { useEffect } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "@packages/backend/convex/_generated/api";

// Add validation schema
const formSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  score: z.number().min(-2).max(2),
  date_for: z.string(),
});

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

export default function ThreeCellDailyForm() {
  const params = useParams();
  const dateFor = params.trackDate as string;
  const parsedDate = parse(dateFor, "yyyy-MM-dd", new Date());

  const data = useQuery(api.threeCells.threeCellForDate, {
    date: dateFor,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date_for: dateFor,
      summary: "",
      score: 0,
    },
  });

  useEffect(() => {
    if (data != null) {
      const threeCellForDate = {
        summary: data.summary,
        score: data.score,
        date_for: data.dateFor,
      };

      form.reset({
        ...threeCellForDate,
      });
    } else {
      form.reset({
        date_for: dateFor,
        summary: "",
        score: 0,
      });
    }
  }, [data]);

  const submitThreeCellEntry = useMutation(api.threeCells.submitThreeCellEntry);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const input = {
        summary: values.summary,
        score: values.score,
        date_for: format(values.date_for, "yyyy-MM-dd"),
      };

      await submitThreeCellEntry({ input });
    } catch (error) {
      console.error("Submission failed:", error);
    }
  }

  const cardColor = color(
    SCORE_COLORS[form.watch("score").toString()] ?? "#ffffff",
  )
    .fade(0.9)
    .rgb()
    .string();

  return (
    <Card className="max-w-[400px] p-6" style={{ backgroundColor: cardColor }}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <Label className="text-xl font-semibold">Entry</Label>
              <CalendarComponent initialDate={parsedDate} />
            </div>

            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabelWithInfo
                    id="score"
                    label="How did today feel?"
                    information={FIELD_EXPLANATIONS.score}
                  />
                  <FormControl>
                    <div className="flex gap-1 justify-between">
                      {SCORE_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          className={cn(
                            "group p-1 rounded-md border-2 border-transparent",
                            option.color,
                            {
                              "border-gray-100 shadow-md":
                                option.value === field.value,
                            },
                          )}
                        >
                          <img
                            src={option.icon}
                            alt={"Icon"}
                            width={50}
                            className={cn(option.color)}
                            onClick={() => field.onChange(option.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabelWithInfo
                    id="summary"
                    label="Daily pulse"
                    information={FIELD_EXPLANATIONS.summary}
                  />
                  <FormControl>
                    {data === undefined ? (
                      <Skeleton className="h-32 w-full bg-sky-100" />
                    ) : (
                      <Textarea
                        {...field}
                        placeholder="Describe your day..."
                        className="min-h-[128px]"
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="mt-4 w-full">
            {form.formState.isSubmitting ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save Entry
          </Button>
        </form>
      </Form>
    </Card>
  );
}

// Updated FormLabelWithInfo to use shadcn components
const FormLabelWithInfo = ({ id, label, information }: any) => {
  return (
    <div className="flex flex-row gap-1 items-center">
      <FormLabel htmlFor={id} className="text-sm font-medium">
        {label}
      </FormLabel>
      {/*<Popover>
        <PopoverTrigger>
          <Info className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent className="max-w-[300px]">{information}</PopoverContent>
      </Popover>*/}
    </div>
  );
};

const CalendarComponent = ({ initialDate }: { initialDate: Date }) => {
  const navigate = useNavigate();
  const today = new Date();

  const allSubmittedDays = useQuery(api.threeCells.allThreeCellEntries) ?? [];

  const initialDateISO = format(initialDate, "yyyy-MM-dd");

  const filteredDays = allSubmittedDays.filter((day) => {
    return format(new Date(day.dateFor), "yyyy-MM-dd") !== initialDateISO;
  });

  // Then create modifiers with filteredDays
  const scoreModifiers = filteredDays.reduce(
    (acc: any, day: any) => {
      const [year, month, dayStr] = day.dateFor.split("-");
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(dayStr),
      );
      const scoreKey = `score_${day.score}`;

      if (!acc[scoreKey]) acc[scoreKey] = [];
      acc[scoreKey].push(date);
      return acc;
    },
    {} as Record<string, Date[]>,
  );

  const scoreModifierStyles = Object.keys(SCORE_COLORS).reduce(
    (acc, score) => {
      acc[`score_${score}`] = {
        backgroundColor: SCORE_COLORS[score],
        color: "#ffffff",
      };
      return acc;
    },
    {} as Record<string, React.CSSProperties>,
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size={"sm"} className="text-xs">
          {format(initialDate, "dd MMM")}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="single"
          selected={initialDate}
          onSelect={(date) => {
            if (date != null) {
              navigate(`/track/${format(date, "yyyy-MM-dd")}`);
            }
          }}
          disabled={(date) => date > today}
          modifiers={scoreModifiers}
          modifiersStyles={scoreModifierStyles}
        />
      </PopoverContent>
    </Popover>
  );
};
