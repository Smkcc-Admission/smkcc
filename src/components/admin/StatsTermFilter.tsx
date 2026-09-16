"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StatsTermFilter({ 
  programId, 
  status, 
  term 
}: { 
  programId?: string, 
  status?: string, 
  term?: string 
}) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTerm = e.target.value;
    const params = new URLSearchParams();
    if (programId) params.set("programId", programId);
    if (status) params.set("status", status);
    if (selectedTerm !== "all") params.set("term", selectedTerm);
    
    router.push(`/stats?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <select 
        value={term || "all"} 
        onChange={handleChange}
        className="border rounded-md px-3 py-2 text-sm bg-white text-gray-700 h-10 border-gray-300"
      >
        <option value="all">ทุกเทอม</option>
        <option value="1">เทอม 1</option>
        <option value="2">เทอม 2</option>
        <option value="3">เทอม 3 (ฤดูร้อน)</option>
      </select>
      {(programId || status || (term && term !== 'all')) && (
        <Link href="/stats">
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">ล้างตัวกรอง</Button>
        </Link>
      )}
    </div>
  );
}
