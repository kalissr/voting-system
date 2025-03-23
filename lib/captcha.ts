import { createCanvas } from "canvas"
import { randomBytes } from "crypto"
import { prisma } from "./db"

// 生成随机验证码
export function generateCaptchaText(length = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    result += chars.charAt(randomIndex)
  }
  return result
}

// 创建验证码图像
export function generateCaptchaImage(text: string) {
  const width = 150
  const height = 50
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // 背景
  ctx.fillStyle = "#f0f0f0"
  ctx.fillRect(0, 0, width, height)

  // 添加干扰线
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgb(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, ${Math.random() * 100 + 100})`
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.lineTo(Math.random() * width, Math.random() * height)
    ctx.stroke()
  }

  // 添加干扰点
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgb(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, ${Math.random() * 100 + 100})`
    ctx.beginPath()
    ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2)
    ctx.fill()
  }

  // 绘制文本
  ctx.font = "bold 30px Arial"
  ctx.fillStyle = "#333"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  // 每个字符略微倾斜和位移
  const textWidth = width / (text.length + 1)
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i)
    const x = (i + 1) * textWidth
    const y = height / 2 + Math.random() * 6 - 3
    const angle = Math.random() * 0.4 - 0.2

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  }

  return canvas.toBuffer("image/png")
}

// 生成验证码并存储到数据库
export async function createCaptchaToken(email: string) {
  const captchaText = generateCaptchaText()
  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10分钟有效期

  // 删除该邮箱之前的验证码
  await prisma.verificationToken.deleteMany({
    where: { email },
  })

  // 创建新的验证码
  await prisma.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  })

  return { captchaText, token }
}

// 验证验证码
export async function verifyCaptcha(email: string, token: string, captchaInput: string) {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      email,
      token,
      expires: {
        gt: new Date(),
      },
    },
  })

  if (!verificationToken) {
    return false
  }

  // 验证成功后删除该验证码
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  })

  return true
}

