import { motion } from "framer-motion";

export default function HabitLoop() {
    return (
        <div className="w-full py-16 bg-white rounded-xl border border-gray-100 my-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

            <h3 className="text-lg font-bold text-center mb-12 text-gray-900 z-10">
                The Atomic Habit Loop
            </h3>

            <div className="relative w-64 h-64 z-10 mb-8">
                {/* Circular Path */}
                <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                    <circle
                        cx="128"
                        cy="128"
                        r="100"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                        fill="none"
                    />
                    <motion.circle
                        cx="128"
                        cy="128"
                        r="100"
                        stroke="#000000"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                </svg>

                {/* Nodes */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-lg shadow-md border border-gray-100 text-center w-24">
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Step 1
                    </span>
                    <span className="font-bold text-gray-900">Cue</span>
                </div>

                <div className="absolute bottom-4 right-4 translate-x-1/2 translate-y-1/2 bg-white p-2 rounded-lg shadow-md border border-gray-100 text-center w-24">
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Step 2
                    </span>
                    <span className="font-bold text-gray-900">Routine</span>
                </div>

                <div className="absolute bottom-4 left-4 -translate-x-1/2 translate-y-1/2 bg-white p-2 rounded-lg shadow-md border border-gray-100 text-center w-24">
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Step 3
                    </span>
                    <span className="font-bold text-gray-900">Reward</span>
                </div>

                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-4xl mb-1"
                        >
                            🔥
                        </motion.div>
                        <p className="text-sm font-medium text-gray-500">Habit Formed</p>
                    </div>
                </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-8 max-w-md px-4 z-10 leading-relaxed">
                Three Cells optimizes this loop by making the <strong>Cue</strong>{" "}
                obvious (one app), the <strong>Routine</strong> easy (one tap), and the{" "}
                <strong>Reward</strong> satisfying (heatmaps).
            </p>
        </div>
    );
}
