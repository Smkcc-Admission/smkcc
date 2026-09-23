import prisma from "./prisma";

type LogActivityParams = {
  action: string;
  adminEmail: string;
  targetId?: string;
  targetName?: string;
  details?: string;
};

export async function logActivity({ action, adminEmail, targetId, targetName, details }: LogActivityParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        adminEmail,
        targetId,
        targetName,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
