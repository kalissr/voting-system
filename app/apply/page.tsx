"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AlertCircle, Upload, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { submitApplication } from "../actions/application-actions"
import { getCurrentUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ApplyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    institutionName: "",
    description: "",
    website: "",
    contactEmail: "",
    contactPhone: "",
    foundingYear: "",
    avatar: null as File | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        setIsLoggedIn(!!user)
      } catch (error) {
        console.error("检查登录状态失败:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // 检查文件类型
      if (!file.type.match("image/jpeg|image/png|image/jpg")) {
        setErrors({
          ...errors,
          avatar: "只支持 JPG 和 PNG 格式的图片",
        })
        return
      }

      // 检查文件大小 (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({
          ...errors,
          avatar: "图片大小不能超过 2MB",
        })
        return
      }

      setFormData({
        ...formData,
        avatar: file,
      })

      // 创建预览URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      // 清除错误
      if (errors.avatar) {
        setErrors({
          ...errors,
          avatar: "",
        })
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.institutionName.trim()) {
      newErrors.institutionName = "机构名称不能为空"
    }

    if (!formData.description.trim()) {
      newErrors.description = "机构描述不能为空"
    } else if (formData.description.length > 200) {
      newErrors.description = "机构描述不能超过200个字符"
    }

    if (formData.website && !formData.website.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
      newErrors.website = "请输入有效的网站地址"
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "联系邮箱不能为空"
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "请输入有效的邮箱地址"
    }

    if (formData.contactPhone && !formData.contactPhone.match(/^\d{11}$/)) {
      newErrors.contactPhone = "请输入有效的手机号码"
    }

    if (formData.foundingYear && !formData.foundingYear.match(/^\d{4}$/)) {
      newErrors.foundingYear = "请输入有效的成立年份（四位数字）"
    }

    if (!formData.avatar) {
      newErrors.avatar = "请上传机构头像"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoggedIn) {
      toast({
        title: "请先登录",
        description: "您需要登录后才能提交申请",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      const formDataObj = new FormData()
      formDataObj.append("institutionName", formData.institutionName)
      formDataObj.append("description", formData.description)
      formDataObj.append("website", formData.website || "")
      formDataObj.append("contactEmail", formData.contactEmail)
      formDataObj.append("contactPhone", formData.contactPhone || "")
      formDataObj.append("foundingYear", formData.foundingYear || "")
      if (formData.avatar) {
        formDataObj.append("avatar", formData.avatar)
      }

      const result = await submitApplication(formDataObj)

      if (result.success) {
        toast({
          title: "申请提交成功",
          description: "您的申请已提交，请等待管理员审核",
        })
        router.push("/")
      } else {
        toast({
          title: "申请提交失败",
          description: result.message || "申请提交失败，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("提交申请失败:", error)
      toast({
        title: "申请提交失败",
        description: "发生未知错误，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto glass-effect">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">申请上榜</CardTitle>
              <CardDescription>正在加载...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto glass-effect">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">申请上榜</CardTitle>
            <CardDescription>填写培训机构信息，提交后等待管理员审核</CardDescription>
          </CardHeader>
          <CardContent>
            {!isLoggedIn && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>需要登录</AlertTitle>
                <AlertDescription>
                  请先登录后再提交申请。
                  <Link href="/login" className="text-primary hover:underline ml-1">
                    立即登录
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institutionName">机构名称 *</Label>
                <Input
                  id="institutionName"
                  name="institutionName"
                  placeholder="输入培训机构名称"
                  value={formData.institutionName}
                  onChange={handleChange}
                  disabled={!isLoggedIn || isSubmitting}
                />
                {errors.institutionName && <p className="text-sm text-destructive">{errors.institutionName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">机构描述 *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="简要描述培训机构的特点和优势（不超过200字）"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={!isLoggedIn || isSubmitting}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">官方网站</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={!isLoggedIn || isSubmitting}
                  />
                  {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundingYear">成立年份</Label>
                  <Input
                    id="foundingYear"
                    name="foundingYear"
                    placeholder="例如：2010"
                    value={formData.foundingYear}
                    onChange={handleChange}
                    disabled={!isLoggedIn || isSubmitting}
                  />
                  {errors.foundingYear && <p className="text-sm text-destructive">{errors.foundingYear}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">联系邮箱 *</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    disabled={!isLoggedIn || isSubmitting}
                  />
                  {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">联系电话</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    placeholder="11位手机号码"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    disabled={!isLoggedIn || isSubmitting}
                  />
                  {errors.contactPhone && <p className="text-sm text-destructive">{errors.contactPhone}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">机构头像 *</Label>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="avatar"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                          isLoggedIn && !isSubmitting ? "hover:bg-muted/50" : "opacity-70 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">点击上传</span> 或拖放
                          </p>
                          <p className="text-xs text-muted-foreground">支持 JPG, PNG (最大 2MB)</p>
                        </div>
                        <input
                          id="avatar"
                          name="avatar"
                          type="file"
                          accept="image/jpeg, image/png"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={!isLoggedIn || isSubmitting}
                        />
                      </label>
                    </div>
                    {errors.avatar && <p className="text-sm text-destructive mt-2">{errors.avatar}</p>}
                  </div>

                  {previewUrl && (
                    <div className="w-32 h-32 relative">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="预览"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Alert variant="outline" className="bg-muted/50">
                <Info className="h-4 w-4" />
                <AlertTitle>提交须知</AlertTitle>
                <AlertDescription className="text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>提交的信息将由管理员审核，审核通过后才会显示在排行榜上</li>
                    <li>请确保提供的信息真实有效，虚假信息将被拒绝</li>
                    <li>审核结果将通过邮件通知，请留意邮箱</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full" disabled={!isLoggedIn || isSubmitting}>
                {isSubmitting ? "提交中..." : "提交申请"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              有疑问？请
              <a href="mailto:support@example.com" className="text-primary hover:underline ml-1">
                联系我们
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </main>
  )
}

