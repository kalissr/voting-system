import { nanoid } from "nanoid"
import { cookies } from "next/headers"

const CSRF_TOKEN_COOKIE = "csrf_token"
const CSRF_TOKEN_HEADER = "X-CSRF-Token"
const CSRF_TOKEN_FIELD = "csrfToken"

// 生成CSRF令牌
export function generateCsrfToken(): string {
  const token = nanoid(32)
  cookies().set({
    name: CSRF_TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60, // 1小时
  })
  return token
}

// 验证CSRF令牌
export function validateCsrfToken(token: string): boolean {
  const cookieToken = cookies().get(CSRF_TOKEN_COOKIE)?.value

  if (!cookieToken || !token || cookieToken !== token) {
    return false
  }

  return true
}

// 在表单中添加CSRF令牌
export function withCsrfToken(formData: FormData): FormData {
  const token = generateCsrfToken()
  formData.append(CSRF_TOKEN_FIELD, token)
  return formData
}

// 验证表单中的CSRF令牌
export function verifyCsrfToken(formData: FormData): boolean {
  const token = formData.get(CSRF_TOKEN_FIELD) as string
  return validateCsrfToken(token)
}

