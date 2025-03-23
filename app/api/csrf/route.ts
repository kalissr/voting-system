import { type NextRequest, NextResponse } from "next/server"
import { generateCsrfToken } from "@/lib/csrf"

export async function GET(request: NextRequest) {
  try {
    const token = generateCsrfToken()
    return NextResponse.json({ token })
  } catch (error) {
    console.error("生成CSRF令牌失败:", error)
    return NextResponse.json({ error: "生成CSRF令牌失败" }, { status: 500 })
  }
}

