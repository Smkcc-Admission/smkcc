import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ApplicantStatusManager from "@/components/admin/ApplicantStatusManager";
import DeleteApplicantButton from "@/components/admin/DeleteApplicantButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import AdminDocumentManager from "@/components/admin/AdminDocumentManager";

export default async function ApplicantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const userProgramId = (session?.user as any)?.programId;
  const isAdmin = userRole === 'ADMIN';
  
  const applicant = await prisma.applicant.findUnique({
    where: { id },
    include: { program: true, documents: true },
  });

  if (!applicant) {
    notFound();
  }

  // Prevent STAFF from viewing applicants from other programs
  if (userRole === 'STAFF' && applicant.programId !== userProgramId) {
    notFound();
  }

  const idCardFiles = applicant.documents.filter(d => d.type === 'ID_CARD');
  const transcriptFiles = applicant.documents.filter(d => d.type === 'TRANSCRIPT');
  const houseRegFiles = applicant.documents.filter(d => d.type === 'HOUSE_REGISTRATION');
  const photoFiles = applicant.documents.filter(d => d.type === 'PHOTO');
  const otherFiles = applicant.documents.filter(d => d.type === 'OTHER');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/applicants">
            <Button variant="outline" size="sm">← กลับหน้ารายการ</Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">รายละเอียดผู้สมัคร: {applicant.applicationId}</h2>
        </div>
        {isAdmin && <DeleteApplicantButton applicantId={applicant.id} />}
      </div>

      <ApplicantStatusManager applicantId={applicant.id} currentStatus={applicant.status as any} currentRemark={applicant.remark || ""} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ข้อมูลส่วนตัว */}
        <div className="bg-white p-6 rounded-md border shadow-sm space-y-4">
          <h3 className="text-lg font-bold border-b pb-2">ข้อมูลส่วนตัว</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-gray-500">รหัสการสมัคร:</div>
            <div className="col-span-2 font-semibold text-blue-700">{applicant.applicationId}</div>
            
            <div className="text-gray-500">สาขาที่สมัคร:</div>
            <div className="col-span-2 font-medium">{applicant.program?.name || "-"}</div>

            <div className="text-gray-500">ชื่อ-นามสกุล:</div>
            <div className="col-span-2">{applicant.prefix}{applicant.firstName} {applicant.lastName}</div>
            
            <div className="text-gray-500">เลขบัตร ปชช:</div>
            <div className="col-span-2">{applicant.nationalId}</div>

            <div className="text-gray-500">เบอร์โทรศัพท์:</div>
            <div className="col-span-2">{applicant.phone}</div>

            <div className="text-gray-500">อีเมล:</div>
            <div className="col-span-2">{applicant.email}</div>

            <div className="text-gray-500">วันที่สมัคร:</div>
            <div className="col-span-2">{applicant.createdAt.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}</div>
          </div>
        </div>

        {/* เอกสารประกอบการสมัคร */}
        <div className="bg-white p-6 rounded-md border shadow-sm space-y-4">
          <h3 className="text-lg font-bold border-b pb-2">เอกสารประกอบการสมัคร</h3>
          
          <div className="space-y-4">
            <AdminDocumentManager 
              applicantId={applicant.id}
              title="สำเนาบัตรประชาชน"
              documentType="ID_CARD"
              files={idCardFiles}
            />
            
            <AdminDocumentManager 
              applicantId={applicant.id}
              title="สำเนาทะเบียนบ้าน"
              documentType="HOUSE_REGISTRATION"
              files={houseRegFiles}
            />
            
            <AdminDocumentManager 
              applicantId={applicant.id}
              title="ระเบียนแสดงผลการเรียน (ปพ.1)"
              documentType="TRANSCRIPT"
              files={transcriptFiles}
            />
            
            <AdminDocumentManager 
              applicantId={applicant.id}
              title="รูปถ่าย 1 นิ้ว"
              documentType="PHOTO"
              files={photoFiles}
            />
            
            {otherFiles.length > 0 && (
              <AdminDocumentManager 
                applicantId={applicant.id}
                title="เอกสารอื่นๆ"
                documentType="OTHER"
                files={otherFiles}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
