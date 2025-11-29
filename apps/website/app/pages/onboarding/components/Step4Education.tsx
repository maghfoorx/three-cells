import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Step4EducationProps {
    onNext: () => void;
}

export default function Step4Education({ onNext }: Step4EducationProps) {
    const features = [
        {
            title: "Journal",
            description: "Two questions. One minute. Understand what makes you tick.",
        },
        {
            title: "Habits",
            description: "One tap tracking. Addictive heatmaps. Watch your streak grow.",
        },
        {
            title: "Tasks",
            description: "Zero fluff. Just what matters. Get stuff done, not organized.",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="bg-white rounded-xl border shadow-sm p-6">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold tracking-tight">
                        One app. Three things.
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        The only productivity system you'll actually use every day.
                    </p>
                </div>

                <div className="space-y-6 mb-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex gap-4 text-left">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <Button onClick={onNext} className="w-full">
                    I'm ready
                </Button>
            </div>
        </motion.div>
    );
}
