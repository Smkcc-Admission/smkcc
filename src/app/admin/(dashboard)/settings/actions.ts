"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateSystemSettings(isOpen: boolean, currentTerm: string, currentAcademicYear: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    return { error: "ไม่มีสิทธิ์ในการตั้งค่าระบบ" };
  }

  try {
    await prisma.systemSettings.upsert({
      where: { id: "1" },
      update: { isGlobalAdmissionOpen: isOpen, currentTerm, currentAcademicYear },
      create: { id: "1", isGlobalAdmissionOpen: isOpen, currentTerm, currentAcademicYear }
    });
    
    // Revalidate the home page so the change takes effect immediately for public users
    revalidatePath("/");
    revalidatePath("/admin/settings");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update system settings", error);
    return { error: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า" };
  }
}
