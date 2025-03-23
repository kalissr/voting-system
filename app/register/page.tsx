"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Eye, EyeOff, User, Mail, Lock, RefreshCw } from "lucide-react"
import { register } from "../actions/auth-actions"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { getCsrfToken } from "next-auth/react"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState("")
  const [captchaUrl, setCaptchaUrl] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    captcha: "",
    agreeTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (formData.email) {
      refreshCaptcha()
    }
  }, [formData.email])

  const refreshCaptcha = async () => {
    if (!formData.email) {
      toast({
        title: "请先输入邮箱",
        description: "需要邮箱地址才能生成验证码",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/captcha?email=${encodeURIComponent(formData.email)}`)

      if (!response.ok) {
        throw new Error("获取验证码失败")
      }

      const token = response.headers.get("X-Captcha-Token")
      if (!token) {
        throw new Error("获取验证码失败")
      }

      setCaptchaToken(token)

      // 创建Blob URL
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setCaptchaUrl(url)

      // 清理之前的Blob URL
      return () => {
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("获取验证码失败:", error)
      toast({
        title: "获取验证码失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "用户名不能为空"
    } else if (formData.username.length < 3) {
      newErrors.username = "用户名至少需要3个字符"
    }

    if (!formData.email.trim()) {
      newErrors.email = "邮箱不能为空"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "请输入有效的邮箱地址"
    }

    if (!formData.password) {
      newErrors.password = "密码不能为空"
    } else if (formData.password.length < 6) {
      newErrors.password = "密码至少需要6个字符"
    }

    if (!formData.captcha) {
      newErrors.captcha = "请输入验证码"
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "请同意使用条款和隐私政策"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      const formDataObj = new FormData()
      formDataObj.append("username", formData.username)
      formDataObj.append("email", formData.email)
      formDataObj.append("password", formData.password)
      formDataObj.append("captchaToken", captchaToken)
      formDataObj.append("captcha", formData.captcha)

      // 添加CSRF令牌
      const csrfToken = await getCsrfToken()
      formDataObj.append("csrfToken", csrfToken as string)

      const result = await register(formDataObj)

      if (result.success) {
        toast({
          title: "注册成功",
          description: "欢迎加入韭菜娱乐榜！",
        })
        router.push("/")
      } else {
        toast({
          title: "注册失败",
          description: result.message || "注册失败，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("注册失败:", error)
      toast({
        title: "注册失败",
        description: "发生未知错误，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto glass-effect">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">注册账号</CardTitle>
            <CardDescription>创建账号参与投票或申请上榜</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    placeholder="输入用户名"
                    className="pl-10"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="设置密码"
                    className="pl-10"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "隐藏密码" : "显示密码"}</span>
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="captcha">验证码</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="captcha"
                      name="captcha"
                      placeholder="输入验证码"
                      value={formData.captcha}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    {captchaUrl ? (
                      <div className="bg-white px-3 py-2 rounded">
                        <Image
                          src={captchaUrl || "/placeholder.svg"}
                          alt="验证码"
                          width={100}
                          height={40}
                          className="h-10"
                        />
                      </div>
                    ) : (
                      <div className="bg-muted px-3 py-2 rounded font-mono text-sm h-10 flex items-center">
                        输入邮箱获取
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={refreshCaptcha}
                      disabled={isSubmitting || !formData.email}
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="sr-only">刷新验证码</span>
                    </Button>
                  </div>
                </div>
                {errors.captcha && <p className="text-sm text-destructive">{errors.captcha}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="agreeTerms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  我同意
                  <Link href="/terms" className="text-primary hover:underline ml-1">
                    使用条款
                  </Link>
                  和
                  <Link href="/privacy" className="text-primary hover:underline ml-1">
                    隐私政策
                  </Link>
                </label>
              </div>
              {errors.agreeTerms && <p className="text-sm text-destructive">{errors.agreeTerms}</p>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "注册中..." : "注册"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              已有账号？
              <Link href="/login" className="text-primary hover:underline ml-1">
                登录
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </main>
  )
}

