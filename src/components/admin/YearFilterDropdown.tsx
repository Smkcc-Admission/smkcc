"use client";

import { useRouter } from "next/navigation";

export default function YearFilterDropdown({ 
  availableYears, 
  selectedYear,
  selectedTerm,
  programId,
  status,
  q
}: {
  availableYears: string[];
  selectedYear: string;
  selectedTerm?: string;
  programId?: string;
  status?: string;
  q?: string;
}) {
  const router = useRouter();

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilter(e.target.value, selectedTerm || "all");
  };

  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilter(selectedYear, e.target.value);
  };

  const updateFilter = (year: string, term: string) => {
    const params = new URLSearchParams();
    if (programId) params.set("programId", programId);
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    params.set("year", year);
    if (term !== "all") {
      params.set("term", term);
    }
    
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      <select 
        value={selectedTerm || "all"} 
        onChange={handleTermChange}
        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[120px]"
      >
        <option value="all">ทุกเทอม</option>
        <option value="1">เทอม 1</option>
        <option value="2">เทอม 2</option>
        <option value="3">เทอม 3 (ฤดูร้อน)</option>
      </select>
      <select 
        value={selectedYear} 
        onChange={handleYearChange}
        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {availableYears.map(y => (
          <option key={y} value={y}>ปี {y}</option>
        ))}
      </select>
    </div>
  );
}
