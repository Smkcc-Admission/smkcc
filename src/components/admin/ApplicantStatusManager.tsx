"use client";

import { useState } from "react";
import { updateApplicantStatus } from "@/app/admin/(dashboard)/applicants/actions";
import { Button } from "@/components/ui/button";

export default function ApplicantStatusManager({ applicantId, currentStatus, currentRemark }: { applicantId: string, currentStatus: string, currentRemark: string | null }) {
  const [status, setStatus] = useState(currentStatus);
  const [remark, setRemark] = useState(currentRemark || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [notify, setNotify] = useState(true);

  const handleUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    const result = await updateApplicantStatus(applicantId, newStatus, notify, remark);
    if (result.success) {
      setStatus(newStatus);
      alert(`อัปเดตสถานะสำเร็จ: เปลี่ยนเป็น ${getStatusLabel(newStatus)}`);
    } else {
      alert("เกิดข้อผิดพลาด: ไม่สามารถอัปเดตสถานะได้");
    }
    setIsUpdating(false);
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'PENDING': return "รอตรวจสอบ";
      case 'DOCUMENT_REQUESTED': return "ขอเอกสารเพิ่ม";
      case 'APPROVED': return "อนุมัติแล้ว";
      case 'PAID': return "ชำระเงินแล้ว";
      case 'REJECTED': return "ไม่ผ่านเงื่อนไข";
      default: return s;
    }
  };

  return (
    <div className="bg-white p-6 rounded-md border shadow-sm space-y-4">
      <h3 className="text-lg font-bold">จัดการสถานะการสมัคร</h3>
      <div className="flex flex-col space-y-2 pb-4 border-b">
        <label htmlFor="remark" className="text-sm font-medium text-gray-700">หมายเหตุถึงผู้สมัคร (ใส่เหตุผลที่ขอเอกสารเพิ่ม หรือเหตุผลที่ปฏิเสธ)</label>
        <textarea 
          id="remark" 
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="เช่น สำเนาบัตรประชาชนไม่ชัดเจน ขอให้ถ่ายใหม่..."
          className="border border-gray-300 rounded-md p-2 text-sm w-full focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
        />
        
        <div className="flex items-center space-x-2 pt-2">
          <input 
            type="checkbox" 
            id="notify" 
            checked={notify} 
            onChange={(e) => setNotify(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="notify" className="text-sm text-gray-700">ส่งอีเมลแจ้งเตือนผู้สมัครเมื่อสถานะเปลี่ยน (จะแนบหมายเหตุไปด้วย)</label>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
        <Button 
          variant={status === 'PENDING' ? 'default' : 'outline'} 
          onClick={() => handleUpdate('PENDING')}
          disabled={isUpdating || status === 'PENDING'}
          className={status === 'PENDING' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}
        >
          รอตรวจสอบ
        </Button>
        <Button 
          variant={status === 'DOCUMENT_REQUESTED' ? 'default' : 'outline'} 
          onClick={() => handleUpdate('DOCUMENT_REQUESTED')}
          disabled={isUpdating || status === 'DOCUMENT_REQUESTED'}
          className={status === 'DOCUMENT_REQUESTED' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
        >
          ขอเอกสารเพิ่ม
        </Button>
        <Button 
          variant={status === 'APPROVED' ? 'default' : 'outline'} 
          onClick={() => handleUpdate('APPROVED')}
          disabled={isUpdating || status === 'APPROVED'}
          className={status === 'APPROVED' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
        >
          อนุมัติแล้ว
        </Button>
        <Button 
          variant={status === 'PAID' ? 'default' : 'outline'} 
          onClick={() => handleUpdate('PAID')}
          disabled={isUpdating || status === 'PAID'}
          className={status === 'PAID' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
        >
          ชำระเงินแล้ว
        </Button>
        <Button 
          variant={status === 'REJECTED' ? 'default' : 'outline'} 
          onClick={() => handleUpdate('REJECTED')}
          disabled={isUpdating || status === 'REJECTED'}
          className={status === 'REJECTED' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
        >
          ไม่ผ่านเงื่อนไข
        </Button>
      </div>
    </div>
  );
}
