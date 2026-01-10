"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

export function Overview({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#ffffff33"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#ffffff50" }}
                />
                <YAxis
                    stroke="#ffffff33"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `Rs.${value}`}
                    tick={{ fill: "#ffffff50" }}
                />
                <Bar
                    dataKey="total"
                    fill="currentColor"
                    radius={[2, 2, 0, 0]}
                    className="fill-white/90 hover:fill-white transition-colors"
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
