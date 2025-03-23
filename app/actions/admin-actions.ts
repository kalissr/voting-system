"use server"

import { z } from "zod"
import { prisma } from "@/lib/db"
import { comparePasswords, hashPassword, requireAdmin } from "@/lib/auth"
import { changePasswordSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function changeAdminPassword(formData: FormData) {
  try {
    const admin = await requireAdmin()

    const rawFormData = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    }

    // 验证表单数据
    const validatedFields = changePasswordSchema.parse(rawFormData)

    // 获取管理员信息
    const adminUser = await prisma.user.findUnique({
      where: { id: admin.id },
    })

    if (!adminUser) {
      return { success: false, message: "管理员账号不存在" }
    }

    // 验证当前密码
    const passwordValid = await comparePasswords(validatedFields.currentPassword, adminUser.password)

    if (!passwordValid) {
      return { success: false, message: "当前密码不正确" }
    }

    // 更新密码
    const hashedPassword = await hashPassword(validatedFields.newPassword)
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    })

    revalidatePath("/admin")
    return { success: true, message: "密码修改成功" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message }
    }

    console.error("修改密码失败:", error)
    return { success: false, message: "修改密码失败，请稍后再试" }
  }
}

