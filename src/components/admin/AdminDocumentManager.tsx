"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminDocumentManager({ 
  applicantId, 
  title, 
  documentType, 
  files 
}: { 
  applicantId: string, 
  title: string, 
  documentType: string, 
  files: any[] 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicantId", applicantId);
    formData.append("type", documentType);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      router.refresh(); // Refresh the page to show the new document
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsUploading(false);
      // reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="p-3 bg-gray-50 rounded border">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-700">{title}</div>
        <div className="relative">
          <input 
            type="file" 
            id={`file-upload-${documentType}`}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleFileChange}
            disabled={isUploading}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <Button variant="outline" size="sm" className="h-7 text-xs flex items-center gap-1 cursor-pointer" disabled={isUploading}>
            {isUploading ? (
              <span className="w-3 h-3 border-2 border-t-transparent border-gray-600 rounded-full animate-spin"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {isUploading ? "กำลังอัปโหลด..." : "อัปโหลดแทน"}
          </Button>
        </div>
      </div>
      
      {error && <div className="text-red-500 text-xs mb-2">{error}</div>}

      {(!files || files.length === 0) ? (
        <p className="text-gray-500 italic text-sm">ยังไม่ได้อัปโหลด</p>
      ) : (
        <ul className="space-y-2 mt-2">
          {files.map((file, i) => (
            <li key={file.id} className="flex items-center justify-between">
              <a 
                href={file.fileUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-2 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                ไฟล์ที่ {i + 1}
              </a>
              <span className="text-xs text-gray-400">- อัปโหลดเมื่อ {new Date(file.createdAt).toLocaleDateString('th-TH')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
