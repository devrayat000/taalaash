// "use client";

// import dayjs from "dayjs";
// import {
//   Line,
//   LineChart,
//   ResponsiveContainer,
//   Tooltip,
//   TooltipProps,
//   XAxis,
//   YAxis,
// } from "recharts";
// import type {
//   NameType,
//   ValueType,
// } from "recharts/types/component/DefaultTooltipContent";

// export interface DailyUserChartProps {
//   dailyUsers: any[];
// }

// export default function DailyUserChart({ dailyUsers }: DailyUserChartProps) {
//   return (
//     <div className="h-56 md:h-64 lg:h-80">
//       <ResponsiveContainer>
//         <LineChart data={dailyUsers}>
//           <XAxis
//             tickLine={false}
//             dataKey="created_date"
//             tickFormatter={(value) => dayjs(value).format("DD MMM")}
//             className="text-xs md:text-sm lg:text-base"
//           />
//           <YAxis
//             tickLine={false}
//             dataKey="count"
//             className="text-xs md:text-sm lg:text-base"
//           />
//           <Tooltip content={CustomTooltip} shared />
//           <Line
//             type="linear"
//             dataKey="count"
//             label="User count"
//             className="stroke-card-result"
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// function CustomTooltip<TValue extends ValueType, TName extends NameType>({
//   active,
//   payload,
//   contentStyle,
//   labelStyle,
//   itemStyle,
// }: TooltipProps<TValue, TName>) {
//   if (!active || !payload) {
//     return null;
//   }

//   return (
//     <div
//       className="rounded-md bg-background border border-border p-3"
//       style={contentStyle}
//     >
//       <div className="text-sm text-muted-foreground" style={labelStyle}>
//         {payload[0].payload.created_date}
//       </div>
//       <div className="text-lg font-bold" style={itemStyle}>
//         Count: {payload[0].payload.count}
//       </div>
//     </div>
//   );
// }
