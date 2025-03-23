// 客户端CSRF令牌获取函数
export async function getCsrfToken(): Promise<string> {
  try {
    const response = await fetch("/api/csrf")
    if (!response.ok) {
      throw new Error("获取CSRF令牌失败")
    }
    const data = await response.json()
    return data.token
  } catch (error) {
    console.error("获取CSRF令牌失败:", error)
    throw error
  }
}

