"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { deleteApplicant } from "@/app/admin/(dashboard)/applicants/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DeleteApplicantButton({ applicantId }: { applicantId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteApplicant(applicantId);
    
    if (res.success) {
      router.push("/admin/applicants");
    } else {
      alert(res.error || "เกิดข้อผิดพลาดในการลบข้อมูล");
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isDeleting}>
          🗑️ {isDeleting ? "กำลังลบ..." : "ลบข้อมูลผู้สมัคร"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">ยืนยันการลบข้อมูลผู้สมัคร?</AlertDialogTitle>
          <AlertDialogDescription>
            คุณกำลังลบข้อมูลผู้สมัครรายนี้ <strong>อย่างถาวร</strong> รวมไปถึงไฟล์เอกสารทั้งหมดที่อัปโหลดเข้ามา การกระทำนี้ไม่สามารถย้อนกลับหรือกู้คืนได้ แน่ใจหรือไม่?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            ยืนยันการลบทิ้ง
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
