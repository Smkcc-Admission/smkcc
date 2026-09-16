import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ApplicantStatusManager from "@/components/admin/ApplicantStatusManager";
import DeleteApplicantButton from "@/components/admin/DeleteApplicantButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

  const renderFileList = (files: any[]) => {
    if (!files || files.length === 0) return <p className="text-gray-500 italic text-sm">ยังไม่ได้อัปโหลด</p>;
    return (
      <ul className="space-y-2 mt-2">
        {files.map((file, i) => (
          <li key={file.id} className="flex items-center gap-2">
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
    );
  };

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
            <div className="col-span-2">{applicant.createdAt.toLocaleString('th-TH')}</div>
          </div>
        </div>

        {/* เอกสารประกอบการสมัคร */}
        <div className="bg-white p-6 rounded-md border shadow-sm space-y-4">
          <h3 className="text-lg font-bold border-b pb-2">เอกสารประกอบการสมัคร</h3>
          
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded border">
              <div className="font-semibold text-gray-700">สำเนาบัตรประชาชน</div>
              {renderFileList(idCardFiles)}
            </div>

            <div className="p-3 bg-gray-50 rounded border">
              <div className="font-semibold text-gray-700">สำเนาทะเบียนบ้าน</div>
              {renderFileList(houseRegFiles)}
            </div>

            <div className="p-3 bg-gray-50 rounded border">
              <div className="font-semibold text-gray-700">ระเบียนแสดงผลการเรียน (ปพ.1)</div>
              {renderFileList(transcriptFiles)}
            </div>

            <div className="p-3 bg-gray-50 rounded border">
              <div className="font-semibold text-gray-700">รูปถ่าย 1 นิ้ว</div>
              {renderFileList(photoFiles)}
            </div>

            {otherFiles.length > 0 && (
              <div className="p-3 bg-gray-50 rounded border">
                <div className="font-semibold text-gray-700">เอกสารอื่นๆ</div>
                {renderFileList(otherFiles)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
