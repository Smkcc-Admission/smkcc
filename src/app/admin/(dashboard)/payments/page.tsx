import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PaymentSlipVerificationCard from "@/components/admin/PaymentSlipVerificationCard";
import { CreditCard, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; programId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const userRole = (session.user as any).role;
  const userProgramId = (session.user as any).programId;

  const { filter = "pending", programId } = await searchParams;

  // เงื่อนไขสิทธิ์ STAFF
  const effectiveProgramId = userRole === "STAFF" ? userProgramId : programId;

  // ค้นหาผู้สมัครที่มีการแนบ PAYMENT_SLIP
  const applicantsWithSlip = await prisma.applicant.findMany({
    where: {
      ...(effectiveProgramId ? { programId: effectiveProgramId } : {}),
      documents: {
        some: {
          type: "PAYMENT_SLIP",
        },
      },
    },
    include: {
      program: true,
      documents: {
        where: { type: "PAYMENT_SLIP" },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const programs = await prisma.program.findMany({
    orderBy: { name: "asc" },
  });

  // แบ่งกลุ่มตามตัวกรอง
  const pendingList = applicantsWithSlip.filter((a) => a.status !== "PAID" && !a.paymentRemark);
  const reuploadRequestedList = applicantsWithSlip.filter((a) => a.status !== "PAID" && !!a.paymentRemark);
  const paidList = applicantsWithSlip.filter((a) => a.status === "PAID");

  let displayList = applicantsWithSlip;
  if (filter === "pending") {
    displayList = pendingList;
  } else if (filter === "reupload") {
    displayList = reuploadRequestedList;
  } else if (filter === "paid") {
    displayList = paidList;
  }

  return (
    <div className="space-y-6">
      {/* ส่วนหัวหน้า */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-emerald-600" />
            <span>ตรวจสอบการชำระเงิน (สลิปโอนเงิน)</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            รายการผู้สมัครที่แนบหลักฐานสลิปการโอนเงินเข้ามาในระบบ
          </p>
        </div>
      </div>

      {/* สรุปตัวเลข */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={`/admin/payments?filter=pending${effectiveProgramId ? `&programId=${effectiveProgramId}` : ""}`}
          className={`p-4 rounded-xl border transition-all ${
            filter === "pending"
              ? "bg-yellow-50 border-yellow-300 ring-2 ring-yellow-400"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">รอตรวจสอบ</span>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-700 mt-2">{pendingList.length}</p>
          <p className="text-xs text-gray-500 mt-1">สลิปที่รอเจ้าหน้าที่ตรวจยอด</p>
        </Link>

        <Link
          href={`/admin/payments?filter=reupload${effectiveProgramId ? `&programId=${effectiveProgramId}` : ""}`}
          className={`p-4 rounded-xl border transition-all ${
            filter === "reupload"
              ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">ขอให้แนบสลิปใหม่</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{reuploadRequestedList.length}</p>
          <p className="text-xs text-gray-500 mt-1">แจ้งให้นักศึกษาแก้ไข/แนบใหม่</p>
        </Link>

        <Link
          href={`/admin/payments?filter=paid${effectiveProgramId ? `&programId=${effectiveProgramId}` : ""}`}
          className={`p-4 rounded-xl border transition-all ${
            filter === "paid"
              ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">ชำระเงินเรียบร้อย</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{paidList.length}</p>
          <p className="text-xs text-gray-500 mt-1">ผ่านการยืนยันแล้ว</p>
        </Link>
      </div>

      {/* แถบตัวกรองสาขา (สำหรับ ADMIN) */}
      {userRole === "ADMIN" && (
        <div className="bg-white p-3 rounded-lg border flex items-center gap-3 text-sm">
          <span className="text-gray-600 font-medium">สาขาวิชา:</span>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/payments?filter=${filter}`}
              className={`px-3 py-1 rounded-md text-xs font-semibold ${
                !programId ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ทั้งหมด
            </Link>
            {programs.map((p) => (
              <Link
                key={p.id}
                href={`/admin/payments?filter=${filter}&programId=${p.id}`}
                className={`px-3 py-1 rounded-md text-xs font-semibold ${
                  programId === p.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* รายการสลิป */}
      <div className="space-y-4">
        {displayList.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-base">ไม่พบรายการสลิปในหมวดนี้</p>
            <p className="text-xs text-gray-400 mt-1">
              เมื่อนักศึกษาอัปโหลดสลิปเข้ามา รายการจะแสดงขึ้นที่นี่โดยอัตโนมัติ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayList.map((app) => (
              <PaymentSlipVerificationCard
                key={app.id}
                applicantId={app.id}
                applicantName={`${app.prefix}${app.firstName} ${app.lastName}`}
                applicationId={app.applicationId}
                isPaid={app.status === "PAID"}
                paymentRemark={app.paymentRemark}
                slips={app.documents}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
