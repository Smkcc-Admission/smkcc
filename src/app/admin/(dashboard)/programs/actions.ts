"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const formatUrl = (url: string | null) => {
  if (!url) return null;
  url = url.trim();
  if (url === "") return null;
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

export async function updateProgram(id: string, data: { name: string, lineOaUrl: string | null, facebookUrl: string | null, tiktokUrl: string | null, contactPhone: string | null, contactName: string | null, isOpen: boolean, locations?: string[] }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userRole = (session.user as any)?.role;
  const userProgramId = (session.user as any)?.programId;

  if (userRole !== 'ADMIN') {
    if (userRole !== 'STAFF' || userProgramId !== id) {
      throw new Error("Unauthorized: You can only edit your own program");
    }
  }

  try {
    await prisma.program.update({
      where: { id },
      data: {
        name: data.name,
        lineOaUrl: formatUrl(data.lineOaUrl),
        facebookUrl: formatUrl(data.facebookUrl),
        tiktokUrl: formatUrl(data.tiktokUrl),
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        isOpen: data.isOpen,
        locations: data.locations || []
      }
    });

    revalidatePath("/admin/programs");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

export async function createProgram(data: { name: string, lineOaUrl: string | null, facebookUrl: string | null, tiktokUrl: string | null, contactPhone: string | null, contactName: string | null, locations?: string[] }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }

  try {
    // Generate a unique code like PRG-1234
    let uniqueCode = "";
    let isUnique = false;
    
    while (!isUnique) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      uniqueCode = `PRG-${randomNum}`;
      const existing = await prisma.program.findUnique({
        where: { code: uniqueCode }
      });
      if (!existing) isUnique = true;
    }

    await prisma.program.create({
      data: {
        code: uniqueCode,
        name: data.name,
        lineOaUrl: formatUrl(data.lineOaUrl),
        facebookUrl: formatUrl(data.facebookUrl),
        tiktokUrl: formatUrl(data.tiktokUrl),
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        isOpen: true,
        locations: data.locations || []
      }
    });

    revalidatePath("/admin/programs");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

export async function deleteProgram(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }

  try {
    const applicantsCount = await prisma.applicant.count({
      where: { programId: id }
    });

    if (applicantsCount > 0) {
      return { success: false, error: "ไม่สามารถลบสาขาวิชานี้ได้ เนื่องจากมีผู้สมัครอยู่ในสาขานี้แล้ว (กรุณาปิดรับสมัครแทน)" };
    }

    await prisma.program.delete({
      where: { id }
    });

    revalidatePath("/admin/programs");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}
