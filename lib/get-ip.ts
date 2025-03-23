import { headers } from "next/headers"

export function getClientIp() {
  const headersList = headers()

  // 尝试从各种头部获取真实IP
  const forwardedFor = headersList.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  const realIp = headersList.get("x-real-ip")
  if (realIp) {
    return realIp
  }

  // 如果无法获取，返回一个占位符
  return "0.0.0.0"
}

