import { compare, hash } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import { prisma } from "./db"
import { redirect } from "next/navigation"
import { cache } from "react"
import { headers } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const COOKIE_NAME = "auth_token"
const TOKEN_EXPIRY = "1d" // 缩短令牌有效期为1天
const MAX_LOGIN_ATTEMPTS = 5 // 最大登录尝试次数
const LOGIN_LOCKOUT_TIME = 15 * 60 * 1000 // 15分钟锁定时间

export async function hashPassword(password: string) {
  return hash(password, 12) // 增加哈希强度
}

export async function comparePasswords(plainPassword: string, hashedPassword: string) {
  return compare(plainPassword, hashedPassword)
}

export function generateToken(userId: string, role: string) {
  return sign(
    {
      userId,
      role,
      // 添加更多令牌声明
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    {
      expiresIn: TOKEN_EXPIRY,
      // 添加令牌标识符
      jwtid: crypto.randomUUID(),
    },
  )
}

export function setAuthCookie(token: string) {
  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // 防止CSRF攻击
    maxAge: 60 * 60 * 24, // 1天
  })
}

export function removeAuthCookie() {
  cookies().delete(COOKIE_NAME)
}

// 使用缓存提高性能
export const getCurrentUser = cache(async () => {
  try {
    const token = cookies().get(COOKIE_NAME)?.value

    if (!token) {
      return null
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string; role: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return user
  } catch (error) {
    // 令牌无效或过期
    removeAuthCookie()
    return null
  }
})

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?error=unauthenticated")
  }

  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?error=unauthenticated")
  }

  if (user.role !== "ADMIN") {
    redirect("/?error=unauthorized")
  }

  return user
}

function getClientIp() {
  const headersList = headers()
  const xForwardedFor = headersList.get("x-forwarded-for")

  if (xForwardedFor) {
    return xForwardedFor.split(",")[0]
  }

  return headersList.get("remote-addr") || "127.0.0.1"
}

// 添加登录尝试跟踪
export async function trackLoginAttempt(email: string, success: boolean) {
  const now = new Date()

  if (success) {
    // 登录成功，重置尝试次数
    await prisma.loginAttempt.deleteMany({
      where: { email },
    })
    return true
  }

  // 登录失败，记录尝试
  await prisma.loginAttempt.create({
    data: {
      email,
      timestamp: now,
      ipAddress: getClientIp(),
    },
  })

  // 检查是否超过最大尝试次数
  const recentAttempts = await prisma.loginAttempt.count({
    where: {
      email,
      timestamp: {
        gte: new Date(now.getTime() - LOGIN_LOCKOUT_TIME),
      },
    },
  })

  return recentAttempts < MAX_LOGIN_ATTEMPTS
}

// 检查账户是否被锁定
export async function isAccountLocked(email: string) {
  const now = new Date()

  const recentAttempts = await prisma.loginAttempt.count({
    where: {
      email,
      timestamp: {
        gte: new Date(now.getTime() - LOGIN_LOCKOUT_TIME),
      },
    },
  })

  return recentAttempts >= MAX_LOGIN_ATTEMPTS
}

