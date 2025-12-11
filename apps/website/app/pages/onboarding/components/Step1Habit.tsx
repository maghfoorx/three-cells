import { zodResolver } from "@hookform/resolvers/zod";
import color from "color";
import { z } from "zod";
import { CircleFadingPlus, ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { useMutation } from "convex/react";
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

interface Step1HabitProps {
    onNext: (data: FormSchema) => void;
}

type DialogStep = "selectHabit" | "customizeHabit";

export default function Step1Habit({ onNext }: Step1HabitProps) {
    const [currentStep, setCurrentStep] = useState<DialogStep>("selectHabit");

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            habitQuestion: "",
            colour: getRandomColourForNewHabit(),
            icon: undefined,
        },
    });

    const dialogColour = useMemo(() => {
        return color(form.watch("colour")).mix(color("white"), 0.6).hex();
    }, [form.watch("colour")]);

    const createHabit = useMutation(api.habits.createNewUserHabit);

    const handleSubmit = async (data: FormSchema) => {
        try {
            await createHabit({
                name: data.name,
                colour: data.colour,
                habitQuestion: data.habitQuestion,
                icon: data.icon,
            });
            onNext(data);
        } catch (error) {
            console.error("Failed to create habit:", error);
            // Optionally handle error (e.g. show toast)
        }
    };

    const handlePredefinedHabitSelect = (habitName: string) => {
        const habit = PREDEFINED_HABITS.find((h) => h.name === habitName);
        if (habit) {
            form.reset({
                name: habit.name,
                habitQuestion: habit.question,
                icon: habit.icon,
                colour: getRandomColourForNewHabit(),
            });
            setCurrentStep("customizeHabit");
        }
    };

    const handleCreateCustomHabit = () => {
        form.reset({
            name: "",
            habitQuestion: "",
            colour: getRandomColourForNewHabit(),
            icon: undefined,
        });
        setCurrentStep("customizeHabit");
    };

    const selectedIcon = form.watch("icon");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md mx-auto"
        >
            <div
                className="rounded-xl border shadow-sm p-6 max-h-[80vh] overflow-y-auto"
                style={{
                    backgroundImage:
                        currentStep === "customizeHabit"
                            ? `linear-gradient(180deg, ${dialogColour}, white)`
                            : `linear-gradient(180deg, #f0f0f0, white)`,
                }}
            >
                <div className="mb-6 text-center relative">
                    {currentStep === "customizeHabit" && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-0 top-0 h-6 w-6 -ml-2"
                            onClick={() => setCurrentStep("selectHabit")}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <h2 className="text-2xl font-bold tracking-tight">
                        {currentStep === "selectHabit"
                            ? "Choose your habit"
                            : "Customize your habit"}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {currentStep === "selectHabit"
                            ? "Start small. What's one thing you want to do daily?"
                            : "Make it yours."}
                    </p>
                </div>

                {currentStep === "selectHabit" && (
                    <div className="space-y-2">
                        {PREDEFINED_HABITS.map((habit) => (
                            <div
                                key={habit.name}
                                onClick={() => handlePredefinedHabitSelect(habit.name)}
                                className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-gray-300 flex-shrink-0">
                                    <img
                                        src={`/${habit.icon}`}
                                        className="w-full h-full object-cover"
                                        alt={habit.name}
                                    />
                                </div>
                                <span className="font-medium text-lg text-gray-700">
                                    {habit.name}
                                </span>
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

                {currentStep === "customizeHabit" && (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="space-y-4"
                        >
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
                                                className="border-black/20 rounded-sm text-sm bg-white/50 backdrop-blur-sm focus:bg-white transition-colors"
                                                autoComplete="off"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                                        selectedIcon === iconPath
                                                            ? "border-black bg-gray-100"
                                                            : "border-transparent hover:bg-gray-50"
                                                    )}
                                                    onClick={() => form.setValue("icon", iconPath)}
                                                >
                                                    <div className="w-12 h-12 rounded-sm overflow-hidden flex items-center justify-center">
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

                            <FormField
                                control={form.control}
                                name="colour"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Colour*</FormLabel>
                                        <div className="flex flex-row gap-2 flex-wrap justify-center sm:justify-start">
                                            {habitsFormColourOptions.map((habitColour) => {
                                                return (
                                                    <div
                                                        key={habitColour}
                                                        className={cn(
                                                            "h-8 w-8 rounded-full border border-black/10 cursor-pointer transition-transform hover:scale-110",
                                                            {
                                                                "border-black border-2 scale-110":
                                                                    habitColour === form.getValues("colour"),
                                                            }
                                                        )}
                                                        style={{
                                                            backgroundColor: habitColour,
                                                        }}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            form.setValue("colour", habitColour);
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                                className="border-black/20 rounded-sm text-sm bg-white/50 backdrop-blur-sm focus:bg-white transition-colors"
                                                autoComplete="off"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full mt-4">
                                Continue
                            </Button>
                        </form>
                    </Form>
                )}
            </div>
        </motion.div>
    );
}

