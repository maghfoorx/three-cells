import { YearlyReviewCard } from "~/pages/calendarView/YearlyReviewCard";

export default function YearlyReviewDemoSection() {
    const mockScoreCounts = {
        "-2": 12,
        "-1": 28,
        "0": 45,
        "1": 156,
        "2": 124,
    };

    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
            <div className="flex flex-col gap-8 sm:gap-12">
                <div className="">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                        Spotify Wrapped, but for your life
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
                        See exactly how your year went in seconds. Track your best days,
                        spot patterns, and understand what actually makes you happy.
                    </p>
                </div>
                <div className="w-full">
                    <YearlyReviewCard year="2025" scoreCounts={mockScoreCounts} />
                </div>
            </div>
        </section>
    );
}
