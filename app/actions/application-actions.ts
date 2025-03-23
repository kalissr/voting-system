"use server"

import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { applicationSchema } from "@/lib/validations"
import { uploadImage } from "@/lib/upload"
import { sanitizeText } from "@/lib/sanitize"
import { revalidatePath } from "next/cache"

export async function submitApplication(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawFormData = {
      institutionName: formData.get("institutionName") as string,
      description: formData.get("description") as string,
      website: formData.get("website") as string,
      contactEmail: formData.get("contactEmail") as string,
      contactPhone: formData.get("contactPhone") as string,
      foundingYear: formData.get("foundingYear") as string,
    }

    // 验证表单数据
    const validatedFields = applicationSchema.parse(rawFormData)

    // 检查是否已经提交过申请
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: user.id,
        status: "PENDING",
      },
    })

    if (existingApplication) {
      return { success: false, message: "您已经提交过申请，请等待审核" }
    }

    // 处理头像上传
    const avatarFile = formData.get("avatar") as File
    let avatarUrl = null

    if (avatarFile && avatarFile.size > 0) {
      avatarUrl = await uploadImage(avatarFile)
    }

    // 清理用户输入，防止XSS攻击
    const sanitizedName = sanitizeText(validatedFields.institutionName)
    const sanitizedDescription = sanitizeText(validatedFields.description)

    // 创建申请
    await prisma.application.create({
      data: {
        userId: user.id,
        name: sanitizedName,
        description: sanitizedDescription,
        website: validatedFields.website,
        contactEmail: validatedFields.contactEmail,
        contactPhone: validatedFields.contactPhone,
        foundingYear: validatedFields.foundingYear,
        avatarUrl,
      },
    })

    revalidatePath("/apply")
    return { success: true, message: "申请提交成功，请等待审核" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message }
    }

    console.error("提交申请失败:", error)
    return { success: false, message: "提交申请失败，请稍后再试" }
  }
}

// 其他函数保持不变...

