import { type NextRequest, NextResponse } from "next/server"
import { rateLimit } from "./lib/rate-limit"

export async function middleware(req: NextRequest) {
  // 应用速率限制
  const rateLimitResponse = await rateLimit(req)
  if (rateLimitResponse) return rateLimitResponse

  // 添加安全头部
  const response = NextResponse.next()

  // 内容安全策略
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.vercel-blob.com; font-src 'self'; connect-src 'self' https://*.vercel-blob.com;",
  )

  // 防止点击劫持
  response.headers.set("X-Frame-Options", "DENY")

  // 启用XSS保护
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // 禁止MIME类型嗅探
  response.headers.set("X-Content-Type-Options", "nosniff")

  // 引用策略
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // 权限策略
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()")

  return response
}

// 配置中间件应用的路径
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

