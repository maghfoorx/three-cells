import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { motion } from "framer-motion";

interface Step3SourceProps {
    onNext: (data: any) => void;
}

export default function Step3Source({ onNext }: Step3SourceProps) {
    const [source, setSource] = useState<string>("");
    const [otherSource, setOtherSource] = useState<string>("");

    const handleNext = () => {
        if (source === "other") {
            if (otherSource.trim()) {
                onNext({ source: `other: ${otherSource}` });
            }
        } else if (source) {
            onNext({ source });
        }
    };

    const isNextDisabled = !source || (source === "other" && !otherSource.trim());

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
                        How did you hear about us?
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        We'd love to know how you found Three Cells.
                    </p>
                </div>

                <div className="space-y-4">
                    <Select onValueChange={setSource} value={source}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="twitter">Twitter / X</SelectItem>
                            <SelectItem value="reddit">Reddit</SelectItem>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="google">Google Search</SelectItem>
                            <SelectItem value="app_store">App Store</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>

                    {source === "other" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <Input
                                placeholder="Please specify..."
                                value={otherSource}
                                onChange={(e) => setOtherSource(e.target.value)}
                                className="w-full"
                            />
                        </motion.div>
                    )}

                    <Button
                        onClick={handleNext}
                        className="w-full mt-4"
                        disabled={isNextDisabled}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
