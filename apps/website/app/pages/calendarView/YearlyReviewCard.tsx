import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { SCORE_COLORS, SCORE_IMAGES } from "~/types";
import { motion } from "framer-motion";

interface YearlyReviewCardProps {
    year: string;
    scoreCounts: Record<number, number>;
}

export function YearlyReviewCard({ year, scoreCounts }: YearlyReviewCardProps) {
    const scores = [-2, -1, 0, 1, 2];
    const totalEntries = Object.values(scoreCounts).reduce((a, b) => a + b, 0);
    const maxCount = Math.max(...Object.values(scoreCounts), 1); // Avoid divide by zero

    return (
        <Card className="py-0 py-4 rounded-md flex flex-col h-full">
            <CardHeader className="">
                <CardTitle className="text-xs uppercase">{year} OVERVIEW</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center gap-3">
                {scores.map((score) => {
                    const count = scoreCounts[score] || 0;
                    const percentage = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
                    const barWidth = (count / maxCount) * 100;

                    return (
                        <div key={score} className="flex items-center gap-2 text-xs">
                            <img src={SCORE_IMAGES[score.toString()]} width={20} height={20} />
                            <div className="flex-1 h-6 bg-muted/30 rounded-sm overflow-hidden relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barWidth}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="h-full rounded-sm absolute top-0 left-0"
                                    style={{ backgroundColor: SCORE_COLORS[score.toString()] }}
                                />
                                <div className="absolute inset-0 flex items-center px-2">
                                    <span className="text-[10px] font-medium mix-blend-difference text-white/0">
                                        {/* Hidden text for spacing if needed, or just overlay */}
                                    </span>
                                </div>
                            </div>
                            <div className="w-8 text-right text-muted-foreground">
                                {count}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
