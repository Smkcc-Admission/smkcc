"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIDashboardSummary() {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const year = searchParams.get('year');
      const url = year ? `/api/admin/ai-summary?year=${year}` : "/api/admin/ai-summary";
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch AI summary");
      }
      const data = await res.json();
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลด AI สรุปข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm relative overflow-hidden">
      {/* Decorative background sparkle effect */}
      <div className="absolute -top-10 -right-10 opacity-10 text-blue-500 pointer-events-none">
        <Sparkles size={120} />
      </div>

      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-700">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <CardTitle className="text-lg font-bold">AI สรุปภาพรวมรายวัน</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchSummary} 
          disabled={loading}
          className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
          title="สร้างสรุปใหม่"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-2 py-2 animate-pulse">
            <div className="h-4 bg-indigo-200/50 rounded w-3/4"></div>
            <div className="h-4 bg-indigo-200/50 rounded w-full"></div>
            <div className="h-4 bg-indigo-200/50 rounded w-5/6"></div>
            <div className="h-4 bg-indigo-200/50 rounded w-1/2"></div>
            <p className="text-xs text-indigo-400 mt-2">AI กำลังวิเคราะห์ข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-500 py-4 bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <div className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line py-1">
            {summary}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
