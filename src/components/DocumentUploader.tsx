"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function DocumentUploader({ applicantId }: { applicantId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>("ID_CARD");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicantId", applicantId);
    formData.append("type", docType);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setFile(null);
        alert("อัปโหลดเอกสารสำเร็จ");
        router.refresh();
      } else {
        alert("การอัปโหลดล้มเหลว: " + (data.error || "ไม่ทราบสาเหตุ"));
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="space-y-2">
        <Label>ประเภทเอกสาร</Label>
        <select 
          className="w-full p-2 border rounded-md text-sm" 
          value={docType} 
          onChange={(e) => setDocType(e.target.value)}
        >
          <option value="ID_CARD">สำเนาบัตรประชาชน</option>
          <option value="HOUSE_REGISTRATION">สำเนาทะเบียนบ้าน</option>
          <option value="TRANSCRIPT">วุฒิการศึกษา</option>
          <option value="PHOTO">รูปถ่าย</option>
          <option value="OTHER">อื่นๆ</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label>เลือกไฟล์ (รูปภาพ หรือ PDF)</Label>
        <Input 
          type="file" 
          accept="image/*,.pdf" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
        />
      </div>

      <Button 
        onClick={handleUpload} 
        disabled={!file || uploading} 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {uploading ? "กำลังบันทึกและส่งไปยัง Google Drive..." : "อัปโหลดเอกสาร"}
      </Button>
    </div>
  );
}
