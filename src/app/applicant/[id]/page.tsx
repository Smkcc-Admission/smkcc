import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DocumentUploader from "@/components/DocumentUploader";
export default async function ApplicantDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const applicant = await prisma.applicant.findUnique({
    where: { id },
    include: { program: true, documents: true }
  });

  if (!applicant) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">รอตรวจสอบ/รอเอกสาร</span>;
      case 'DOCUMENT_REQUESTED': return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">ขอเอกสารเพิ่มเติม</span>;
      case 'APPROVED': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">อนุมัติการสมัครแล้ว</span>;
      case 'PAID': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">ชำระเงินแล้ว (เสร็จสมบูรณ์)</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">ไม่ผ่านเงื่อนไข</span>;
      default: return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ข้อมูลการสมัครเรียน</h1>
            <p className="text-sm text-gray-500">รหัสการสมัคร: <span className="font-bold text-blue-600">{applicant.applicationId}</span></p>
          </div>
          <div>
            <Link href="/">
              <Button variant="outline">ออกจากระบบ</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>ประวัติส่วนตัว</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
                  <p className="font-semibold text-lg">{applicant.prefix}{applicant.firstName} {applicant.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">เลขประจำตัวประชาชน</p>
                  <p className="font-semibold">{applicant.nationalId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                  <p className="font-semibold">{applicant.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">อีเมล</p>
                  <p className="font-semibold">{applicant.email || "-"}</p>
                </div>
                {(applicant.status === 'DOCUMENT_REQUESTED' || applicant.status === 'REJECTED') && applicant.remark && (
                  <div className="col-span-2 mt-2 text-sm bg-orange-100 border border-orange-200 text-orange-800 p-3 rounded-md">
                    <strong>หมายเหตุจากเจ้าหน้าที่:</strong> {applicant.remark}
                  </div>
                )}
                <div className="col-span-2 bg-blue-50 p-4 rounded-lg mt-2">
                  <p className="text-sm text-blue-600 font-bold mb-1">สาขาวิชาที่สมัคร</p>
                  <p className="font-bold text-xl text-blue-900">{applicant.program?.name || "ยังไม่ได้เลือกสาขา"}</p>
                  
                  {applicant.program?.contactUrl && (
                    <div className="mt-4">
                      <a 
                        href={applicant.program.contactUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-2 bg-[#00B900] hover:bg-[#009900] text-white font-bold py-2 px-4 rounded-lg text-sm shadow-sm transition-colors"
                      >
                        💬 สอบถาม / เข้ากลุ่ม Line สาขา
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>สถานะการสมัคร</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                {getStatusBadge(applicant.status)}
                <p className="text-sm text-center text-gray-500">
                  {applicant.status === "PENDING" && "กรุณาอัปโหลดเอกสารให้ครบถ้วน เพื่อให้เจ้าหน้าที่ตรวจสอบ"}
                  {applicant.status === "APPROVED" && "ยินดีด้วย! การสมัครของคุณผ่านการอนุมัติแล้ว"}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md border-blue-200">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-blue-800">อัปโหลดเอกสาร</CardTitle>
                <CardDescription>ไฟล์รูปภาพ หรือ PDF (ไม่เกิน 5MB)</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <DocumentUploader applicantId={applicant.id} />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-700">เอกสารที่อัปโหลดแล้ว</h4>
                  {applicant.documents.length === 0 ? (
                    <p className="text-xs text-red-500">ยังไม่มีเอกสาร</p>
                  ) : (
                    <ul className="text-sm space-y-1">
                      {applicant.documents.map(doc => (
                        <li key={doc.id} className="text-blue-600 underline">
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer">เอกสาร ({doc.type})</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
