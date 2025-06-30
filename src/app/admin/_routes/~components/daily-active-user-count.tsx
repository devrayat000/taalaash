// "use client";

// import dayjs from "dayjs";
// import {
//   Bar,
//   BarChart,
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

// export interface DailyActiveUserBarProps {
//   data: any[];
// }

// export default function DailyActiveUserBar({ data }: DailyActiveUserBarProps) {
//   return (
//     <div className="h-56 md:h-64 lg:h-80">
//       <ResponsiveContainer>
//         <BarChart
//           data={data}
//           className="[&_.recharts-tooltip-cursor]:fill-slate-800/30"
//         >
//           <XAxis
//             tickLine={false}
//             axisLine={false}
//             dataKey="date"
//             tickFormatter={(value) => dayjs(value).format("DD MMM")}
//             className="text-xs md:text-sm lg:text-base"
//           />
//           <YAxis
//             tickLine={false}
//             axisLine={false}
//             dataKey="active1DayUsers"
//             className="text-xs md:text-sm lg:text-base"
//           />
//           <Tooltip content={CustomTooltip} shared />
//           <Bar
//             dataKey="active1DayUsers"
//             label="Active Users"
//             className="fill-card-result"
//             radius={[8, 8, 0, 0]}
//           />
//         </BarChart>
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
//         {dayjs(payload[0].payload.date).format("DD MMM YYYY")}
//       </div>
//       <div className="text-lg font-bold" style={itemStyle}>
//         Count: {payload[0].payload.active1DayUsers}
//       </div>
//     </div>
//   );
// }
