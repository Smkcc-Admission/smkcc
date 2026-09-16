"use client";

import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import Link from "next/link";

export type SparklineDataPoint = {
  date: string;
  count: number;
};

type StatCardProps = {
  title: string;
  value: number;
  totalValue: number; // for percentage calculation
  trendValue: number; // total in the last 7 days
  sparklineData: SparklineDataPoint[];
  href: string;
  isActive: boolean;
  colorTheme?: "blue" | "green" | "yellow" | "orange" | "red" | "indigo";
  moneyEstimate?: number; // optional expected revenue
};

const colorMap = {
  indigo: { border: "border-indigo-800", bgActive: "bg-indigo-50", text: "text-indigo-800", stroke: "#3730a3" },
  blue: { border: "border-blue-500", bgActive: "bg-blue-50", text: "text-blue-600", stroke: "#3b82f6" },
  green: { border: "border-green-500", bgActive: "bg-green-50", text: "text-green-600", stroke: "#22c55e" },
  yellow: { border: "border-yellow-500", bgActive: "bg-yellow-50", text: "text-yellow-600", stroke: "#eab308" },
  orange: { border: "border-orange-500", bgActive: "bg-orange-50", text: "text-orange-600", stroke: "#f97316" },
  red: { border: "border-red-500", bgActive: "bg-red-50", text: "text-red-600", stroke: "#ef4444" },
};

function formatNumber(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function StatCard({
  title,
  value,
  totalValue,
  trendValue,
  sparklineData,
  href,
  isActive,
  colorTheme = "blue",
  moneyEstimate
}: StatCardProps) {
  const percentage = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
  const theme = colorMap[colorTheme];

  return (
    <Link href={href} className="block w-full h-full">
      <Card className={`relative flex flex-col h-[130px] overflow-hidden transition-all hover:shadow-md cursor-pointer border-b-4 ${theme.border} ${isActive ? theme.bgActive : 'bg-white'}`}>
        
        {/* Sparkline Background/Footer */}
        <div className="absolute bottom-0 left-0 right-0 h-14 opacity-20 pointer-events-none">
          {sparklineData && sparklineData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke={theme.stroke} 
                  strokeWidth={2} 
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-4">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-semibold text-gray-700 truncate pr-2" title={title}>
              {title}
            </h4>
            <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
              {percentage}%
            </div>
          </div>

          {/* Body */}
          <div className="flex items-end gap-2 mt-auto mb-1">
            <div className={`text-3xl font-bold leading-none ${theme.text}`}>
              {value}
            </div>
            <div className="text-sm font-normal text-gray-500 pb-0.5">คน</div>
          </div>

          {/* Insights */}
          <div className="flex justify-between items-center text-xs mt-1">
            {trendValue > 0 ? (
              <span className="text-green-600 font-medium">↑ +{trendValue} ใน 7 วัน</span>
            ) : (
              <span className="text-gray-400">ไม่มีเพิ่มใน 7 วัน</span>
            )}
            
            {moneyEstimate !== undefined && moneyEstimate > 0 && (
              <span className="text-gray-500 font-medium">💰 ฿{formatNumber(moneyEstimate)}</span>
            )}
          </div>
          
        </div>
      </Card>
    </Link>
  );
}
