import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea,
} from "recharts";

const data = [
    { complexity: 10, consistency: 95, label: "Paper/Simple App" },
    { complexity: 30, consistency: 85, label: "Dedicated Tracker" },
    { complexity: 50, consistency: 60, label: "Simple Notion Page" },
    { complexity: 70, consistency: 40, label: "Complex Dashboard" },
    { complexity: 90, consistency: 15, label: "Full 'Life OS'" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
                <p className="font-bold text-gray-900">{payload[0].payload.label}</p>
                <p className="text-sm text-gray-600">
                    Complexity: {payload[0].payload.complexity}%
                </p>
                <p className="text-sm text-black font-bold">
                    Consistency: {payload[0].value}%
                </p>
            </div>
        );
    }
    return null;
};

export default function ComplexityGraph() {
    return (
        <div className="w-full bg-gray-50 rounded-xl p-6 my-8 border border-gray-100">
            <h3 className="text-lg font-bold text-center mb-2 text-gray-900">
                The Complexity-Consistency Gap
            </h3>
            <p className="text-center text-sm text-gray-500 mb-6">
                As system complexity rises, long-term consistency plummets.
            </p>
            <div className="w-full h-[300px] [&_.recharts-wrapper]:outline-none">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e5e7eb"
                        />
                        <XAxis
                            dataKey="complexity"
                            type="number"
                            domain={[0, 100]}
                            label={{
                                value: "System Complexity",
                                position: "bottom",
                                offset: 0,
                                style: { fill: "#6b7280" },
                            }}
                            tick={false}
                        />
                        <YAxis
                            label={{
                                value: "Consistency %",
                                angle: -90,
                                position: "insideLeft",
                                style: { fill: "#6b7280" },
                            }}
                            domain={[0, 100]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="consistency"
                            stroke="#000000"
                            strokeWidth={3}
                            dot={{ r: 6, fill: "#000000", strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 8, fill: "#000000" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
