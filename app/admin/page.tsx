"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Lock, CheckCircle, XCircle, AlertCircle, LogOut } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getApplications, approveApplication, rejectApplication } from "../actions/application-actions"
import { changeAdminPassword } from "../actions/admin-actions"
import { logout } from "../actions/auth-actions"

type Application = {
  id: string
  name: string
  description: string
  contactEmail: string
  avatarUrl: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  submittedBy: string
  submitterEmail: string
}

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      try {
        const result = await getApplications()

        if (result.success) {
          setApplications(result.applications)
          setIsLoggedIn(true)
        } else {
          // 如果获取失败，可能是因为用户不是管理员或未登录
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error("获取申请列表失败:", error)
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAndLoadData()
  }, [])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    })

    // 清除对应字段的错误
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: "",
      })
    }
  }

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {}

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "当前密码不能为空"
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "新密码不能为空"
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = "新密码至少需要8个字符"
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "请确认新密码"
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致"
    }

    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      const formDataObj = new FormData()
      formDataObj.append("currentPassword", passwordForm.currentPassword)
      formDataObj.append("newPassword", passwordForm.newPassword)
      formDataObj.append("confirmPassword", passwordForm.confirmPassword)

      const result = await changeAdminPassword(formDataObj)

      if (result.success) {
        toast({
          title: "密码修改成功",
          description: "管理员密码已成功修改",
        })
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        toast({
          title: "密码修改失败",
          description: result.message || "密码修改失败，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("修改密码失败:", error)
      toast({
        title: "密码修改失败",
        description: "发生未知错误，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApplicationAction = async (id: string, action: "approve" | "reject") => {
    try {
      const result = action === "approve" ? await approveApplication(id) : await rejectApplication(id)

      if (result.success) {
        toast({
          title: action === "approve" ? "申请已通过" : "申请已拒绝",
          description: action === "approve" ? "该机构已添加到排行榜" : "该申请已被拒绝",
        })

        // 更新本地状态
        setApplications(
          applications.map((app) =>
            app.id === id ? { ...app, status: action === "approve" ? "APPROVED" : "REJECTED" } : app,
          ),
        )
      } else {
        toast({
          title: "操作失败",
          description: result.message || "操作失败，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("处理申请失败:", error)
      toast({
        title: "操作失败",
        description: "发生未知错误，请稍后再试",
        variant: "destructive",
      })
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // 在实际应用中，这里应该调用登录API
    // 但为了演示，我们直接跳转到登录页面
    router.push("/login")
  }

  const handleAdminLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("退出登录失败:", error)
      toast({
        title: "退出登录失败",
        description: "发生未知错误，请稍后再试",
        variant: "destructive",
      })
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">管理员控制台</CardTitle>
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
        {!isLoggedIn ? (
          <Card className="max-w-md mx-auto glass-effect">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">管理员登录</CardTitle>
              <CardDescription>请输入管理员账号和密码</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminUsername">管理员账号</Label>
                  <Input id="adminUsername" placeholder="输入管理员账号" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">管理员密码</Label>
                  <div className="relative">
                    <Input
                      id="adminPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="输入管理员密码"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "隐藏密码" : "显示密码"}</span>
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  登录
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold gradient-text">管理员控制台</h1>
              <Button variant="outline" onClick={handleAdminLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            </div>

            <Tabs defaultValue="applications" className="w-full">
              <TabsList className="grid w-full md:w-auto grid-cols-2">
                <TabsTrigger value="applications">申请审核</TabsTrigger>
                <TabsTrigger value="settings">管理员设置</TabsTrigger>
              </TabsList>

              <TabsContent value="applications" className="mt-6">
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle>申请审核</CardTitle>
                    <CardDescription>审核培训机构的上榜申请</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {applications.filter((app) => app.status === "PENDING").length === 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>没有待审核的申请</AlertTitle>
                          <AlertDescription>当前没有待审核的申请，所有申请已处理完毕。</AlertDescription>
                        </Alert>
                      )}

                      {applications
                        .filter((app) => app.status === "PENDING")
                        .map((application) => (
                          <Card key={application.id} className="overflow-hidden">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                                <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800">
                                  <AvatarImage src={application.avatarUrl} alt={application.name} />
                                  <AvatarFallback className="text-xl">
                                    {application.name.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 text-center md:text-left">
                                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                    <h3 className="text-xl font-bold">{application.name}</h3>
                                    <Badge variant="outline" className="md:ml-2">
                                      待审核
                                    </Badge>
                                  </div>
                                  <p className="text-muted-foreground mb-2">{application.description}</p>
                                  <p className="text-sm mb-1">
                                    <span className="font-medium">联系邮箱：</span>
                                    {application.contactEmail}
                                  </p>
                                  <p className="text-sm mb-1">
                                    <span className="font-medium">申请人：</span>
                                    {application.submittedBy}
                                  </p>
                                  <p className="text-sm mb-4">
                                    <span className="font-medium">申请时间：</span>
                                    {formatDate(application.createdAt)}
                                  </p>

                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                      onClick={() => handleApplicationAction(application.id, "approve")}
                                      className="bg-green-500 hover:bg-green-600"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      通过申请
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => handleApplicationAction(application.id, "reject")}
                                      className="text-destructive border-destructive hover:bg-destructive/10"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      拒绝申请
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                      <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4">已处理的申请</h3>
                        <div className="space-y-4">
                          {applications
                            .filter((app) => app.status !== "PENDING")
                            .map((application) => (
                              <Card key={application.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage src={application.avatarUrl} alt={application.name} />
                                      <AvatarFallback className="text-sm">
                                        {application.name.substring(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium">{application.name}</h4>
                                        <Badge
                                          variant={application.status === "APPROVED" ? "default" : "destructive"}
                                          className="ml-2"
                                        >
                                          {application.status === "APPROVED" ? "已通过" : "已拒绝"}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        处理时间：{formatDate(application.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle>管理员设置</CardTitle>
                    <CardDescription>修改管理员密码和其他设置</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">当前密码</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="输入当前密码"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
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
                        {passwordErrors.currentPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">新密码</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="输入新密码"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            disabled={isSubmitting}
                          />
                        </div>
                        {passwordErrors.newPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">确认新密码</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="再次输入新密码"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            disabled={isSubmitting}
                          />
                        </div>
                        {passwordErrors.confirmPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                        )}
                      </div>

                      <Button type="submit" className="mt-2" disabled={isSubmitting}>
                        <Lock className="h-4 w-4 mr-2" />
                        {isSubmitting ? "修改中..." : "修改密码"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}

