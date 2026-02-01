"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useFormatCurrency } from "@/context/StoreConfigContext"

export function Overview({ data }: { data: any[] }) {
    const formatCurrency = useFormatCurrency();

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="name"
                    stroke="#ffffff20"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#ffffff50" }}
                    dy={10}
                />
                <YAxis
                    stroke="#ffffff20"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fill: "#ffffff50" }}
                    width={80}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
                    }}
                    itemStyle={{ color: "#fff", fontSize: "12px" }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#fff"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
