import { prisma } from "./db"
import { getClientIp } from "./get-ip"

type AuditAction =
  | "user.register"
  | "user.login"
  | "user.logout"
  | "user.password_change"
  | "vote.cast"
  | "application.submit"
  | "application.approve"
  | "application.reject"
  | "admin.login"
  | "admin.logout"
  | "admin.password_change"

export async function logAudit(action: AuditAction, resource: string, userId?: string, details?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        resource,
        userId,
        details,
        ipAddress: getClientIp(),
      },
    })
  } catch (error) {
    console.error("记录审计日志失败:", error)
    // 不要让审计日志失败影响主要功能
  }
}

