import { z } from "zod"
import { revalidatePath } from "next/cache"
import { comparePasswords, generateToken, setAuthCookie } from "@/lib/auth"
import { loginSchema } from "@/schemas"
import { verifyCsrfToken } from "@/lib/csrf"
import { isAccountLocked, trackLoginAttempt } from "@/lib/login-attempts"
import { logAudit } from "@/lib/audit"
import { prisma } from "@/lib/db"

export async function login(formData: FormData) {
  try {
    // 验证CSRF令牌
    if (!verifyCsrfToken(formData)) {
      return { success: false, message: "无效的请求，请刷新页面重试" }
    }

    const rawFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    // 验证表单数据
    const validatedFields = loginSchema.parse(rawFormData)

    // 检查账户是否被锁定
    const locked = await isAccountLocked(validatedFields.email)
    if (locked) {
      await logAudit(
        "user.login",
        "account",
        undefined,
        `Failed login attempt for locked account: ${validatedFields.email}`,
      )
      return { success: false, message: "账户已被锁定，请15分钟后再试或联系管理员" }
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: validatedFields.email },
    })

    if (!user) {
      await trackLoginAttempt(validatedFields.email, false)
      await logAudit(
        "user.login",
        "account",
        undefined,
        `Failed login attempt: user not found for ${validatedFields.email}`,
      )
      return { success: false, message: "邮箱或密码不正确" }
    }

    // 验证密码
    const passwordValid = await comparePasswords(validatedFields.password, user.password)

    if (!passwordValid) {
      await trackLoginAttempt(validatedFields.email, false)
      await logAudit("user.login", "account", user.id, "Failed login attempt: invalid password")
      return { success: false, message: "邮箱或密码不正确" }
    }

    // 登录成功，重置尝试次数
    await trackLoginAttempt(validatedFields.email, true)

    // 生成JWT令牌并设置cookie
    const token = generateToken(user.id, user.role)
    setAuthCookie(token)

    // 记录审计日志
    await logAudit("user.login", "account", user.id, "Successful login")

    revalidatePath("/")
    return { success: true, message: "登录成功" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message }
    }

    console.error("登录失败:", error)
    return { success: false, message: "登录失败，请稍后再试" }
  }
}

