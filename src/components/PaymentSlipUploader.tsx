"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle2, AlertTriangle, Clock, RefreshCw, FileText } from "lucide-react";

interface SlipUploaderProps {
  applicantId: string;
  paymentSlips: Array<{
    id: string;
    fileUrl: string;
    createdAt: Date | string;
  }>;
  applicantStatus: string;
  paymentRemark?: string | null;
}

export default function PaymentSlipUploader({
  applicantId,
  paymentSlips,
  applicantStatus,
  paymentRemark,
}: SlipUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicantId", applicantId);
    formData.append("type", "PAYMENT_SLIP");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFile(null);
        alert("อัปโหลดสลิปหลักฐานการชำระเงินสำเร็จ");
        router.refresh();
      } else {
        alert("การอัปโหลดล้มเหลว: " + (data.error || "ไม่ทราบสาเหตุ"));
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setUploading(false);
    }
  };

  const hasSlip = paymentSlips.length > 0;
  const isPaid = applicantStatus === "PAID";
  const needsReupload = !!paymentRemark && !isPaid;

  return (
    <div className="space-y-4">
      {/* สถานะการชำระเงิน */}
      {isPaid ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-900">ชำระเงินเรียบร้อยแล้ว (สมบูรณ์)</h4>
            <p className="text-sm text-emerald-700 mt-0.5">
              เจ้าหน้าที่ตรวจสอบและยืนยันการชำระเงินเรียบร้อยแล้ว
            </p>
          </div>
        </div>
      ) : needsReupload ? (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>เจ้าหน้าที่ขอให้อัปโหลดสลิปใหม่</span>
          </div>
          <p className="text-sm text-amber-900 pl-7 font-medium">
            <strong>เหตุผล:</strong> {paymentRemark}
          </p>
          <p className="text-xs text-amber-700 pl-7">
            โปรดตรวจสอบความถูกต้องและแนบไฟล์สลิปใหม่อีกครั้งด้านล่าง
          </p>
        </div>
      ) : hasSlip ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-xl flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-blue-900">แนบสลิปแล้ว - รอเจ้าหน้าที่การเงินตรวจสอบ</h4>
            <p className="text-sm text-blue-700 mt-0.5">
              ระบบได้รับหลักฐานการชำระเงินแล้ว เจ้าหน้าที่จะทำการตรวจสอบยอดเงินต่อไป
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm text-gray-600">
          เมื่อท่านชำระเงินตามที่สาขาวิชาแจ้งแล้ว สามารถแนบภาพสลิปหรือไฟล์ PDF หลักฐานได้ที่นี่
        </div>
      )}

      {/* รายการสลิปที่เคยอัปโหลด */}
      {hasSlip && (
        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            สลิปที่แนบไว้ ({paymentSlips.length} ไฟล์)
          </p>
          <div className="space-y-1.5">
            {paymentSlips.map((slip, idx) => (
              <div
                key={slip.id}
                className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg border text-sm transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-gray-700 truncate">
                    สลิปหลักฐาน #{idx + 1}
                  </span>
                </div>
                <a
                  href={slip.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline shrink-0 ml-2"
                >
                  เปิดดูสลิป
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* กล่องอัปโหลด (ถ้ายังไม่ PAID หรือมีการขอให้แนบใหม่) */}
      {!isPaid && (
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="slip-file" className="text-sm font-semibold text-gray-700">
              {hasSlip ? "แนบสลิปเพิ่มเติม / แนบสลิปใหม่" : "เลือกไฟล์สลิป (JPG, PNG หรือ PDF)"}
            </Label>
            <Input
              id="slip-file"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer file:cursor-pointer"
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 py-5"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึกและอัปโหลดสลิป...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>{hasSlip ? "อัปโหลดสลิปใหม่" : "บันทึกและส่งสลิปชำระเงิน"}</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
