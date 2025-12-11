import { zodResolver } from "@hookform/resolvers/zod";
import color from "color";
import { z } from "zod";
import { Check, ChevronsUpDown, CircleFadingPlus, ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { useMemo, useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { handleHookMutationError } from "~/lib/handleHookMutationError";
import { api } from "@packages/backend/convex/_generated/api";

const PREDEFINED_HABITS = [
  {
    name: "Workout",
    question: "Did you workout today?",
    icon: "habit-icons/dumbells.webp",
  },
  {
    name: "Push ups",
    question: "Did you do push ups today?",
    icon: "habit-icons/push-ups.webp",
  },
  {
    name: "Reading",
    question: "Did you read today?",
    icon: "habit-icons/reading.webp",
  },
  {
    name: "Studying",
    question: "Did you study today?",
    icon: "habit-icons/studying.webp",
  },
  {
    name: "Taking medicine",
    question: "Did you take your medicine?",
    icon: "habit-icons/taking-medicine.webp",
  },
  {
    name: "Waking up early",
    question: "Did you wake up early?",
    icon: "habit-icons/waking-up-early.webp",
  },
  {
    name: "Walking",
    question: "Did you go for a walk?",
    icon: "habit-icons/walking.webp",
  },
  {
    name: "Drink Water",
    question: "Did you drink enough water?",
    icon: "habit-icons/water.webp",
  },

] as const;

// Extract just the icon paths for the picker
const AVAILABLE_ICONS = PREDEFINED_HABITS.map((h) => h.icon);

const formSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  colour: z.string().min(1),
  habitQuestion: z.string().min(1),
  icon: z.string().optional(),
});

type FormSchema = z.output<typeof formSchema>;

type DialogStep = "selectHabit" | "customizeHabit";

export default function CreateNewHabitDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<DialogStep>("selectHabit");

  const resetForm = useCallback((initialColor: string): FormSchema => {
    return {
      name: "",
      habitQuestion: "",
      colour: initialColor,
      icon: undefined,
    }
  }, []);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: resetForm(getRandomColourForNewHabit()),
  });

  const viewer = useQuery(api.auth.viewer);

  const hasAccess = useMemo(() => {
    return viewer?.isSubscribed || viewer?.hasLifetimeAccess;
  }, [viewer]);

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (open) {
      // Reset to the default step and form values when opening
      setCurrentStep("selectHabit");
      form.reset(resetForm(getRandomColourForNewHabit()));
    }
  };

  const dialogColour = useMemo(() => {
    const formColour = form.watch("colour");
    return color(formColour).mix(color("white"), 0.6).hex();
  }, [form.watch("colour")]);

  const createHabit = useMutation(api.habits.createNewUserHabit);

  const handleSubmitCreateNewHabit = async (data: FormSchema) => {
    try {
      await createHabit({
        name: data.name,
        colour: data.colour,
        habitQuestion: data.habitQuestion,
        icon: data.icon,
      });
      setDialogOpen(false);
    } catch (err) {
      handleHookMutationError(err);
    }
  };

  const selectedIcon = form.watch("icon");

  const handlePredefinedHabitSelect = (habitName: string) => {
    const habit = PREDEFINED_HABITS.find(h => h.name === habitName);
    if (habit) {
      // 1. Pre-fill the form with habit details and a random color
      form.reset({
        name: habit.name,
        habitQuestion: habit.question,
        icon: habit.icon,
        colour: getRandomColourForNewHabit(),
      });

      // 2. Switch to the customization step for review and final creation
      setCurrentStep("customizeHabit");
    }
  };

  const handleCreateCustomHabit = () => {
    // Reset the form to empty values (except for a random color)
    form.reset(resetForm(getRandomColourForNewHabit()));
    setCurrentStep("customizeHabit");
  }


  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant={"outline"} disabled={!hasAccess}>
          <CircleFadingPlus />
        </Button>
      </DialogTrigger>

      <DialogContent
        style={{
          // Apply gradient based on current step or form color
          backgroundImage: currentStep === "customizeHabit"
            ? `linear-gradient(180deg, ${dialogColour}, white)`
            : `linear-gradient(180deg, #f0f0f0, white)`,
        }}
        className="max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {currentStep === "selectHabit" ? "Choose your habit" : "Customize your habit"}
          </DialogTitle>
        </DialogHeader>

        {/* --- Step 1: Habit Selection List --- */}
        {currentStep === "selectHabit" && (
          <div className="space-y-2">
            {PREDEFINED_HABITS.map((habit) => (
              <div
                key={habit.name}
                onClick={() => handlePredefinedHabitSelect(habit.name)}
                className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-gray-300 flex-shrink-0">
                  <img src={`/${habit.icon}`} className="w-full h-full object-cover" alt={habit.name} />
                </div>
                <span className="font-medium text-lg text-gray-700">{habit.name}</span>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleCreateCustomHabit}
            >
              Create your own...
            </Button>
          </div>
        )}

        {/* --- Step 2: Customization Form --- */}
        {currentStep === "customizeHabit" && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmitCreateNewHabit)}
              className="space-y-4"
            >
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Name*</Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="Workout"
                        className="border-black rounded-sm text-sm bg-white"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Icon Selection */}
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <Label>Icon</Label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_ICONS.map((iconPath) => (
                        <div
                          key={iconPath}
                          className={cn(
                            "cursor-pointer p-1 rounded-md border-2",
                            selectedIcon === iconPath ? "border-black bg-gray-100" : "border-transparent hover:bg-gray-50"
                          )}
                          onClick={() => form.setValue("icon", iconPath)}
                        >
                          <div className="w-16 h-16 md:w-22 md:h-22 rounded-sm overflow-hidden flex items-center justify-center">
                            <img
                              src={`/${iconPath}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />


              {/* Colour Selection */}
              <FormField
                control={form.control}
                name="colour"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Colour*</FormLabel>
                    <div className="flex flex-row gap-2 flex-wrap">
                      {habitsFormColourOptions.map((habitColour) => {
                        return (
                          <div
                            key={habitColour}
                            className={cn(
                              "h-6 w-6 rounded-sm border border-gray-50 cursor-pointer",
                              {
                                "border-black border-2":
                                  habitColour === form.getValues("colour"),
                              },
                            )}
                            style={{
                              backgroundColor: habitColour,
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              form.setValue("colour", habitColour);
                            }}
                          ></div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question Field */}
              <FormField
                control={form.control}
                name="habitQuestion"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Question*</Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="e.g. Did you workout today?"
                        className="border-black rounded-sm text-sm bg-white"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className={cn("w-full")} disabled={false}>
                <CircleFadingPlus className="mr-2 h-4 w-4" /> Create habit
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const habitsFormColourOptions = [
  "#FF8A8A",
  "#FFB974",
  "#F49FB6",
  "#FFF176",
  "#7BE495",
  "#B8FF66",
  "#8CFAC0",
  "#72D1F4",
  "#70D6FF",
  "#90BFFF",
  "#D59BF6",
  "#B980F0",
  "#F6A9FF",
];

const getRandomColourForNewHabit = () => {
  return habitsFormColourOptions[
    Math.floor(Math.random() * habitsFormColourOptions.length)
  ];
};