"use client";

import { useState } from "react";
import { verifyPaymentSlip } from "@/app/admin/(dashboard)/applicants/actions";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";

interface PaymentVerificationProps {
  applicantId: string;
  applicantName: string;
  applicationId: string;
  isPaid: boolean;
  paymentRemark: string | null;
  slips: Array<{
    id: string;
    fileUrl: string;
    createdAt: Date | string;
  }>;
}

export default function PaymentSlipVerificationCard({
  applicantId,
  applicantName,
  applicationId,
  isPaid,
  paymentRemark,
  slips,
}: PaymentVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState(paymentRemark || "");

  const handleApprove = async () => {
    if (!confirm(`ยืนยันการชำระเงินสำหรับ ${applicantName} (${applicationId}) หรือไม่?`)) {
      return;
    }
    setLoading(true);
    const res = await verifyPaymentSlip(applicantId, true);
    setLoading(false);
    if (res.success) {
      alert("บันทึกการอนุมัติการชำระเงินเรียบร้อยแล้ว");
    } else {
      alert(res.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("โปรดระบุเหตุผลที่ขอให้แนบสลิปใหม่");
      return;
    }
    setLoading(true);
    const res = await verifyPaymentSlip(applicantId, false, rejectReason);
    setLoading(false);
    if (res.success) {
      alert("ส่งคำขอให้แนบสลิปใหม่เรียบร้อยแล้ว");
      setShowRejectBox(false);
    } else {
      alert(res.error || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-base">{applicantName}</span>
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded">
              {applicationId}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            สลิปที่แนบ: {slips.length} รายการ
          </p>
        </div>

        <div>
          {isPaid ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ชำระเงินเรียบร้อยแล้ว
            </span>
          ) : paymentRemark ? (
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              ขอให้แนบสลิปใหม่
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
              รอการตรวจสอบ
            </span>
          )}
        </div>
      </div>

      {/* แจ้งเตือนเหตุผลถ้ามี */}
      {paymentRemark && !isPaid && (
        <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-lg">
          <strong>เหตุผลที่ขอให้แนบใหม่ล่าสุด:</strong> {paymentRemark}
        </div>
      )}

      {/* แสดงรายการสลิป */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-600">ไฟล์สลิปหลักฐาน:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {slips.map((s, idx) => (
            <a
              key={s.id}
              href={s.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm text-gray-700 hover:text-blue-700 transition-colors group"
            >
              <span className="font-medium text-xs truncate">
                สลิปใบที่ #{idx + 1} ({new Date(s.createdAt).toLocaleDateString('th-TH')})
              </span>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0 ml-2" />
            </a>
          ))}
        </div>
      </div>

      {/* กล่องระบุเหตุผลขอสลิปใหม่ */}
      {showRejectBox && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
          <label className="text-xs font-bold text-amber-900 block">
            ระบุเหตุผลที่ขอให้อัปโหลดสลิปใหม่ (จะแสดงให้นักศึกษาเห็น):
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="เช่น ยอดเงินไม่ถูกต้อง (ขาด 500 บาท), ภาพสลิปเบลอ มองไม่เห็นเวลาโอน..."
            rows={2}
            className="w-full text-xs p-2 border border-amber-300 rounded focus:ring-1 focus:ring-amber-500 bg-white"
          />
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRejectBox(false)}
              disabled={loading}
              className="text-xs h-8"
            >
              ยกเลิก
            </Button>
            <Button
              size="sm"
              onClick={handleReject}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
            >
              {loading ? "กำลังบันทึก..." : "ยืนยันส่งขอสลิปใหม่"}
            </Button>
          </div>
        </div>
      )}

      {/* ปุ่มจัดการ */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t">
        {!isPaid && !showRejectBox && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRejectBox(true)}
            disabled={loading}
            className="text-amber-700 border-amber-300 hover:bg-amber-50 text-xs h-9"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
            ขอให้แนบสลิปใหม่
          </Button>
        )}

        <Button
          size="sm"
          onClick={handleApprove}
          disabled={loading || isPaid}
          className={`text-xs h-9 ${
            isPaid
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          )}
          {isPaid ? "ยืนยันชำระเงินแล้ว" : "อนุมัติการชำระเงิน"}
        </Button>
      </div>
    </div>
  );
}
