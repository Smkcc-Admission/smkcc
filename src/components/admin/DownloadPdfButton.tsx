"use client";

import { Button } from "@/components/ui/button";

export default function DownloadPdfButton({ programId }: { programId?: string }) {
  const handlePrint = () => {
    // Get current URL search params to preserve year and status if present
    const searchParams = new URLSearchParams(window.location.search);
    if (programId) searchParams.set('programId', programId);
    
    const url = `/admin/print-report?${searchParams.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <Button 
      variant="outline" 
      onClick={handlePrint} 
      className="border-blue-600 text-blue-600 hover:bg-blue-50"
    >
      🖨️ พิมพ์ / บันทึก PDF (A4 แนวนอน)
    </Button>
  );
}
