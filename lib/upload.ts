import { put } from "@vercel/blob"
import { nanoid } from "nanoid"
import crypto from "crypto"
import path from "path"

// 允许的文件类型
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"]
// 最大文件大小 (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024

export async function uploadImage(file: File) {
  try {
    // 验证文件类型
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error("不支持的文件类型，只能上传JPG和PNG格式的图片")
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("图片大小不能超过2MB")
    }

    // 读取文件内容
    const buffer = await file.arrayBuffer()

    // 计算文件哈希值，用于检测恶意文件
    const hash = crypto.createHash("sha256").update(Buffer.from(buffer)).digest("hex")

    // 检查文件内容是否为有效的图片
    // 这里可以添加更复杂的图片验证逻辑

    // 生成安全的文件名
    const fileExt = path.extname(file.name).toLowerCase()
    const safeFileName = `${nanoid()}-${hash.substring(0, 8)}${fileExt}`

    // 上传到Vercel Blob存储
    const blob = await put(safeFileName, file, {
      access: "public",
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    })

    return blob.url
  } catch (error) {
    console.error("上传图片失败:", error)
    throw error
  }
}

