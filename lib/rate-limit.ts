import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// 创建Redis客户端
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// 速率限制配置
const RATE_LIMIT_MAX = 100 // 最大请求次数
const RATE_LIMIT_WINDOW = 60 * 1000 // 时间窗口（毫秒）

export async function rateLimit(req: NextRequest) {
  // 获取客户端IP
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1"

  // 创建唯一键
  const key = `rate-limit:${ip}`

  // 获取当前计数
  let count = (await redis.get(key)) as number | null
  count = count || 0

  // 如果超过限制，返回429状态码
  if (count >= RATE_LIMIT_MAX) {
    return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429, headers: { "Retry-After": "60" } })
  }

  // 增加计数并设置过期时间
  await redis.set(key, count + 1, { ex: RATE_LIMIT_WINDOW / 1000 })

  // 继续处理请求
  return null
}

