"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendStatusEmail } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateApplicantStatus(applicantId: string, status: string, notify: boolean, remark?: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userRole = (session.user as any).role;
  const userProgramId = (session.user as any).programId;

  try {
    const existingApplicant = await prisma.applicant.findUnique({ where: { id: applicantId } });
    if (!existingApplicant) throw new Error("Applicant not found");

    if (userRole === 'STAFF' && existingApplicant.programId !== userProgramId) {
      return { success: false, error: "ไม่อนุญาต: คุณสามารถจัดการได้เฉพาะผู้สมัครในสาขาวิชาของคุณเท่านั้น" };
    }

    const applicant = await prisma.applicant.update({
      where: { id: applicantId },
      data: { 
        status: status as any,
        remark: remark || null
      },
    });

    if (notify && applicant.email) {
      await sendStatusEmail(
        applicant.email,
        applicant.firstName,
        applicant.applicationId,
        status,
        applicant.magicToken || "",
        remark || undefined
      );
    }

    revalidatePath("/admin/applicants");
    revalidatePath(`/admin/applicants/${applicantId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

import crypto from 'crypto';

export async function createApplicantAdmin(data: {
  nationalId: string;
  prefix: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  programId: string;
  status: string;
  studyLocation?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userRole = (session.user as any).role;
  const userProgramId = (session.user as any).programId;

  if (userRole === 'STAFF' && data.programId !== userProgramId) {
    return { success: false, error: "ไม่อนุญาต : คุณสามารถเพิ่มผู้สมัครได้เฉพาะในสาขาวิชาของคุณเท่านั้น" };
  }

  try {
    // Check if national ID already exists
    const existing = await prisma.applicant.findUnique({
      where: { nationalId: data.nationalId }
    });
    
    if (existing) {
      return { success: false, error: "เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว" };
    }

    const settings = await prisma.systemSettings.findUnique({ where: { id: "1" } });
    const currentAcademicYear = settings?.currentAcademicYear || String(new Date().getFullYear() + 543);
    const currentTerm = settings?.currentTerm || "1";

    const count = await prisma.applicant.count();
    const appId = `SMKCC${currentAcademicYear}${String(count + 1).padStart(4, '0')}`;
    const magicToken = crypto.randomBytes(32).toString('hex');

    const applicant = await prisma.applicant.create({
      data: {
        applicationId: appId,
        academicYear: currentAcademicYear,
        term: currentTerm,
        nationalId: data.nationalId,
        prefix: data.prefix,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        programId: data.programId,
        studyLocation: data.studyLocation,
        magicToken: magicToken,
        pdpaConsent: true, // Assuming admin got physical consent
        pdpaConsentDate: new Date(),
        status: data.status as any,
        remark: "เพิ่มเข้าระบบโดยเจ้าหน้าที่ (แอดมิน)",
      }
    });

    revalidatePath("/admin/applicants");
    revalidatePath("/admin"); // Revalidate dashboard
    
    return { success: true, applicationId: applicant.applicationId };
  } catch (error) {
    console.error(error);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

export async function deleteApplicant(applicantId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return { success: false, error: "ไม่มีสิทธิ์ในการลบข้อมูลผู้สมัคร (เฉพาะแอดมินเท่านั้น)" };
  }

  try {
    // Delete the applicant (Cascade delete will also delete related documents)
    await prisma.applicant.delete({
      where: { id: applicantId }
    });

    revalidatePath("/admin/applicants");
    revalidatePath("/admin"); 
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}

