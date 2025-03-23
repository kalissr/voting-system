import { type NextRequest, NextResponse } from "next/server"
import { createCaptchaToken, generateCaptchaImage, generateCaptchaText } from "@/lib/captcha"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "缺少邮箱参数" }, { status: 400 })
    }

    // 生成验证码
    const captchaText = generateCaptchaText()
    const captchaImage = generateCaptchaImage(captchaText)

    // 存储验证码到数据库并生成token
    const { token } = await createCaptchaToken(email)

    // 返回验证码图像和token
    return new NextResponse(captchaImage, {
      headers: {
        "Content-Type": "image/png",
        "X-Captcha-Token": token,
      },
    })
  } catch (error) {
    console.error("生成验证码失败:", error)
    return NextResponse.json({ error: "生成验证码失败" }, { status: 500 })
  }
}

