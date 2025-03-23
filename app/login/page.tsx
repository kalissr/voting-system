"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { login } from "../actions/auth-actions"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    if (!formData.email.trim()) {
      newErrors.email = "邮箱不能为空"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "请输入有效的邮箱地址"
    }

    if (!formData.password) {
      newErrors.password = "密码不能为空"
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
      formDataObj.append("email", formData.email)
      formDataObj.append("password", formData.password)

      const result = await login(formDataObj)

      if (result.success) {
        toast({
          title: "登录成功",
          description: "欢迎回来！",
        })
        router.push("/")
      } else {
        toast({
          title: "登录失败",
          description: result.message || "登录失败，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("登录失败:", error)
      toast({
        title: "登录失败",
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
            <CardTitle className="text-2xl gradient-text">登录账号</CardTitle>
            <CardDescription>登录后参与投票或管理申请</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">密码</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    忘记密码？
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="输入密码"
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  记住我
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "登录中..." : "登录"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              没有账号？
              <Link href="/register" className="text-primary hover:underline ml-1">
                注册
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </main>
  )
}

