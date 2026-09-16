"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { AdminRole } from "@prisma/client";

// Helper for checking if the current user is a super admin
async function checkAdminRole() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");
  
  const currentUser = await prisma.adminUser.findUnique({
    where: { email: session.user.email }
  });

  if (!currentUser || currentUser.role !== 'ADMIN') {
    throw new Error("Permission Denied: Only ADMIN can perform this action");
  }

  return currentUser;
}

export async function addAdminUser(email: string, role: string, programId?: string) {
  try {
    await checkAdminRole();
    
    // Check if user already exists
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "อีเมลนี้มีอยู่ในระบบแล้ว" };
    }

    await prisma.adminUser.create({
      data: {
        email,
        role: role as AdminRole,
        programId: (role === 'STAFF' && programId) ? programId : null
      }
    });

    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAdminUser(id: string) {
  try {
    const currentUser = await checkAdminRole();
    
    // Prevent deleting oneself
    const targetUser = await prisma.adminUser.findUnique({ where: { id } });
    if (targetUser?.email === currentUser.email) {
      return { success: false, error: "ไม่สามารถลบบัญชีของตัวเองได้" };
    }

    await prisma.adminUser.delete({
      where: { id }
    });

    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAdminRole(id: string, role: string, programId?: string) {
  try {
    const currentUser = await checkAdminRole();

    // Prevent downgrading oneself
    const targetUser = await prisma.adminUser.findUnique({ where: { id } });
    if (targetUser?.email === currentUser.email && role !== 'ADMIN') {
      return { success: false, error: "ไม่สามารถลดสิทธิ์ตัวเองได้" };
    }

    await prisma.adminUser.update({
      where: { id },
      data: { 
        role: role as AdminRole,
        programId: (role === 'STAFF' && programId) ? programId : null
      }
    });

    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
