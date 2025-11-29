import { zodResolver } from "@hookform/resolvers/zod";
import color from "color";
import { z } from "zod";
import { CircleFadingPlus } from "lucide-react";
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
import { useMemo } from "react";
import { motion } from "framer-motion";

const formSchema = z.object({
    name: z.string().min(1, "Habit name is required"),
    colour: z.string().min(1),
    habitQuestion: z.string().min(1),
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

export default function Step1Habit({ onNext }: Step1HabitProps) {
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            habitQuestion: "",
            colour: getRandomColourForNewHabit(),
        },
    });

    const dialogColour = useMemo(() => {
        return color(form.watch("colour")).mix(color("white"), 0.6).hex();
    }, [form.watch("colour")]);

    const handleSubmit = (data: FormSchema) => {
        onNext(data);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md mx-auto"
        >
            <div
                className="rounded-xl border shadow-sm p-6"
                style={{
                    backgroundImage: `linear-gradient(180deg, ${dialogColour}, white)`,
                }}
            >
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Create a habit</h2>
                    <p className="text-muted-foreground text-sm">
                        Start small. What's one thing you want to do daily?
                    </p>
                </div>

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
            </div>
        </motion.div>
    );
}
