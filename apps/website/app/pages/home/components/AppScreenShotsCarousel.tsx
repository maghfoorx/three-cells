import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const screenshots = [
  "/demo-ss/journal.png",
  "/demo-ss/habits.png",
  "/demo-ss/metrics.png",
  "/demo-ss/single-habit.png",
  "/demo-ss/calendar-view.png",
  "/demo-ss/log.png",
  "/demo-ss/metric-entry.png",
  "/demo-ss/single-metric.png",
  "/demo-ss/tasks.png",
];

export default function AppScreenshotsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clone first and last images for smooth looping
  const extendedScreenshots = [
    screenshots[screenshots.length - 1],
    ...screenshots,
    screenshots[0],
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleTransitionEnd = () => {
    // If we reach the clone of the last or first slide, jump instantly
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(screenshots.length);
    } else if (currentIndex === screenshots.length + 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    }
  };

  useEffect(() => {
    if (!isTransitioning) {
      // Disable transition, jump to proper slide instantly
      const timer = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => prev - 1);
    pauseAutoPlay();
  };

  const goToNext = () => {
    setCurrentIndex((prev) => prev + 1);
    pauseAutoPlay();
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index + 1); // +1 because of the leading clone
    pauseAutoPlay();
  };

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  return (
    <section className="px-4 sm:px-6 sm:py-20">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
          See it in action
        </h2>
        <p className="text-lg sm:text-xl text-gray-600">
          Simple, beautiful, and actually useful
        </p>
      </div>

      <div className="relative">
        <div ref={containerRef} className="relative overflow-hidden rounded-sm">
          <div
            onTransitionEnd={handleTransitionEnd}
            className={`flex ${
              isTransitioning
                ? "transition-transform duration-500 ease-out"
                : ""
            }`}
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {extendedScreenshots.map((screenshot, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 flex justify-center items-center px-4"
              >
                <img
                  src={screenshot}
                  alt={`App screenshot ${index + 1}`}
                  className="w-64 sm:w-72 md:w-80 h-auto max-w-full"
                />
              </div>
            ))}
          </div>

          {/* Arrows */}
          <button
            onClick={goToPrevious}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>

          <button
            onClick={goToNext}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Next screenshot"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6 sm:mt-8">
          {screenshots.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index + 1 === currentIndex
                  ? "w-8 h-2 bg-black"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
