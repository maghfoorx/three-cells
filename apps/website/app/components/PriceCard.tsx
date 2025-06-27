import type React from "react";
import { Check } from "lucide-react";
import { useState, useRef } from "react";
import BuyThreeCellsButton from "./BuyThreeCellsButton";
import { Link } from "react-router";
import { Button } from "./ui/button";

export default function BuyThreeCellsCard({
  login = false,
}: {
  login?: boolean;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x, y });
  };

  const includedFeatures = [
    "Daily journaling to find your success pattern",
    "Clean, distraction-free task management",
    "Build long lasting habits easily",
    "Beautiful all-in-one interface",
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        ref={cardRef}
        className="relative p-4 bg-gradient-to-br from-primary to-secondary rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={
          {
            "--mouse-x": `${mousePosition.x}px`,
            "--mouse-y": `${mousePosition.y}px`,
          } as React.CSSProperties
        }
      >
        <div
          className="absolute inset-0 rounded-3xl opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 8px,
              rgba(0,0,0,0.1) 8px,
              rgba(0,0,0,0.1) 16px
            )`,
          }}
        />

        <div
          className={`absolute inset-0 rounded-3xl transition-opacity duration-300 pointer-events-none ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.15), transparent 40%)`,
          }}
        />

        <div
          className={`absolute inset-0 rounded-3xl transition-opacity duration-300 pointer-events-none ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.1), transparent 50%)`,
          }}
        />

        {/* Save badge */}
        <div className="absolute top-6 right-6 z-10">
          <div className="bg-primary text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 transition-all duration-300 hover:bg-secondary hover:scale-105">
            40% Off <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
          </div>
        </div>

        {/* Main content card */}
        <div className="relative bg-foreground rounded-2xl p-8 text-white overflow-hidden">
          <div
            className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.1), transparent 50%)`,
            }}
          />

          {/* Header */}
          <div className="relative z-10 mb-8">
            {/* Pricing */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl text-gray-500 line-through">£20</span>
              <span className="text-5xl font-light text-white">£12</span>
              <span className="text-gray-400 text-base">One-time</span>
            </div>
            <div className="text-white text-left text-xl">
              Lifetime access. No subscription.
            </div>
          </div>

          {/* Dotted separator */}
          <div className="relative z-10 border-t border-dotted border-gray-600 mb-8"></div>

          {/* Features list */}
          <div className="relative z-10 space-y-4 mb-8">
            {includedFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 transition-all duration-200 hover:translate-x-1"
              >
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:bg-green-500 hover:scale-110">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          {!login && <BuyThreeCellsButton />}
          {login && (
            <Link to={"/track"}>
              <Button className="relative z-10 w-full text-gray-900 hover:bg-gray-100 rounded-sm py-6 text-base font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                Get Three Cells
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
