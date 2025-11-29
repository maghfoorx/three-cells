import { useForm } from "react-hook-form";
import color from "color";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { SCORE_COLORS } from "~/types";
import { Card } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { format } from "date-fns";

const formSchema = z.object({
    summary: z.string().min(1, "Summary is required"),
    score: z.number().min(-2).max(2),
});

type FormSchema = z.output<typeof formSchema>;

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

const SCORE_OPTIONS = [
    {
        value: -2,
        emoji: "😭",
        color: "bg-red-500 group-hover:bg-red-600 hover:bg-red-600",
        icon: "/terrible.png",
    },
    {
        value: -1,
        emoji: "😞",
        color: "bg-orange-400 group-hover:bg-orange-500 hover:bg-orange-500",
        icon: "/bad.png",
    },
    {
        value: 0,
        emoji: "😐",
        color: "bg-yellow-400 group-hover:bg-yellow-500 hover:bg-yellow-500",
        icon: "/okay.png",
    },
    {
        value: 1,
        emoji: "😊",
        color: "bg-lime-400 group-hover:bg-lime-500 hover:bg-lime-500",
        icon: "/good.png",
    },
    {
        value: 2,
        emoji: "😁",
        color: "bg-green-500 group-hover:bg-green-600 hover:bg-green-600",
        icon: "/amazing.png",
    },
];

interface Step2DailyProps {
    onNext: (data: FormSchema) => void;
    onBack: () => void;
}

export default function Step2Daily({ onNext, onBack }: Step2DailyProps) {
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            summary: "",
            score: 0,
        },
    });

    const submitThreeCellEntry = useMutation(api.threeCells.submitThreeCellEntry);

    const onSubmit = async (values: FormSchema) => {
        try {
            const input = {
                summary: values.summary,
                score: values.score,
                date_for: format(new Date(), "yyyy-MM-dd"), // Use current date for onboarding
            };

            await submitThreeCellEntry({ input });
            onNext(values);
        } catch (error) {
            console.error("Submission failed:", error);
        }
    };

    const cardColor = color(
        SCORE_COLORS[form.watch("score").toString()] ?? "#ffffff"
    )
        .fade(0.9)
        .rgb()
        .string();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md mx-auto"
        >
            <Card className="p-6" style={{ backgroundColor: cardColor }}>
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Daily Check-in</h2>
                    <p className="text-muted-foreground text-sm">
                        How was your day? Track your mood and a quick summary.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex flex-col gap-4">
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
                                                            "group p-1 rounded-md border-2 border-transparent cursor-pointer transition-all hover:scale-110",
                                                            option.color,
                                                            {
                                                                "border-gray-100 shadow-md scale-110":
                                                                    option.value === field.value,
                                                            }
                                                        )}
                                                        onClick={() => field.onChange(option.value)}
                                                    >
                                                        <img
                                                            src={option.icon}
                                                            alt={option.emoji}
                                                            width={50}
                                                            className={cn(option.color, "rounded-sm")}
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
                                            <Textarea
                                                {...field}
                                                placeholder="Describe your day..."
                                                className="min-h-[128px] bg-white/50 backdrop-blur-sm"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button type="submit" className="w-full">
                                Continue
                            </Button>
                        </div>
                    </form>
                </Form>
            </Card>
        </motion.div>
    );
}

const FormLabelWithInfo = ({ id, label, information }: any) => {
    return (
        <div className="flex flex-row gap-1 items-center mb-1">
            <FormLabel htmlFor={id} className="text-sm font-medium">
                {label}
            </FormLabel>
        </div>
    );
};
