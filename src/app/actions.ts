"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import crypto from 'crypto';
import { sendMagicLinkEmail } from '@/lib/email';

export async function submitLeadCapture(data: {
  nationalId: string;
  prefix: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  programId?: string;
  studyLocation?: string;
  pdpaConsent: boolean;
}) {
  try {
    // Basic validation
    if (!data.pdpaConsent) {
      return { success: false, error: "กรุณายอมรับเงื่อนไขนโยบายความเป็นส่วนตัว (PDPA)" };
    }
    
    // Check if national ID already exists
    const existing = await prisma.applicant.findUnique({
      where: { nationalId: data.nationalId }
    });
    
    if (existing) {
      return { success: false, error: "เลขบัตรประชาชนนี้เคยลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบด้วยหมายเลขนี้เพื่อตรวจสอบสถานะ" };
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
        programId: data.programId || undefined,
        studyLocation: data.studyLocation || undefined,
        magicToken: magicToken,
        pdpaConsent: data.pdpaConsent,
        pdpaConsentDate: new Date(),
        status: "PENDING",
      },
      include: {
        program: true
      }
    });
    
    if (data.email) {
      sendMagicLinkEmail(
        data.email, 
        applicant.applicationId, 
        applicant.magicToken!, 
        data.firstName,
        applicant.program?.lineOaUrl
      ).catch(console.error);
    }

    revalidatePath("/");
    
    return { success: true, applicationId: applicant.applicationId, id: applicant.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "เกิดข้อผิดพลาดจากระบบ กรุณาลองใหม่อีกครั้ง" };
  }
}

export async function getActivePrograms() {
  try {
    return await prisma.program.findMany({
      where: { isOpen: true },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function verifyApplicant(data: { applicationId: string; nationalId: string }) {
  try {
    const applicant = await prisma.applicant.findFirst({
      where: {
        applicationId: data.applicationId,
        nationalId: data.nationalId
      }
    });

    if (applicant) {
      return { success: true, id: applicant.id };
    }
    return { success: false, error: "ไม่พบข้อมูลผู้สมัคร กรุณาตรวจสอบรหัสการสมัครและเลขบัตรประชาชนอีกครั้ง" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "เกิดข้อผิดพลาดจากระบบ" };
  }
}

export async function verifyMagicToken(token: string) {
  try {
    const applicant = await prisma.applicant.findUnique({
      where: { magicToken: token }
    });

    if (applicant) {
      return { success: true, id: applicant.id };
    }
    return { success: false, error: "ลิงก์ไม่ถูกต้อง หรือหมดอายุแล้ว" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "เกิดข้อผิดพลาดจากระบบ" };
  }
}

