import DOMPurify from "dompurify"
import { JSDOM } from "jsdom"

// 创建一个DOMPurify实例
const window = new JSDOM("").window
const purify = DOMPurify(window)

// 清理HTML内容，防止XSS攻击
export function sanitizeHtml(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: [], // 不允许任何HTML标签
    ALLOWED_ATTR: [], // 不允许任何HTML属性
  })
}

// 清理文本内容，用于显示用户输入的内容
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

// 清理URL，确保是安全的URL
export function sanitizeUrl(url: string): string {
  if (!url) return ""

  // 只允许http和https协议
  const pattern = /^(?:(?:https?):\/\/)/i
  if (!pattern.test(url)) {
    return `https://${url}`
  }

  return url
}

