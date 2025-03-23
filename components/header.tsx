"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, X, User, LogOut } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { logout } from "@/app/actions/auth-actions"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Header() {
  const router = useRouter()
  const { toast } = useToast()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("检查登录状态失败:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "退出成功",
        description: "您已成功退出登录",
      })
      router.push("/")
    } catch (error) {
      console.error("退出登录失败:", error)
      toast({
        title: "退出失败",
        description: "退出登录失败，请稍后再试",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full glass-effect">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold gradient-text">
              韭菜娱乐榜
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              首页
            </Link>
            <Link href="/apply" className="text-foreground hover:text-primary transition-colors">
              申请上榜
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              关于我们
            </Link>
            {user?.role === "ADMIN" && (
              <Link href="/admin" className="text-foreground hover:text-primary transition-colors">
                管理控制台
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <ModeToggle />

            {isLoading ? (
              <div className="h-10 w-20 bg-muted animate-pulse rounded"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>我的账号</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>{user.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm text-muted-foreground">{user.email}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem onClick={() => router.push("/admin")}>管理控制台</DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:block">
                <Link href="/login">
                  <Button variant="outline" className="mr-2">
                    登录
                  </Button>
                </Link>
                <Link href="/register">
                  <Button>注册</Button>
                </Link>
              </div>
            )}

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-effect">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/"
              className="block text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              首页
            </Link>
            <Link
              href="/apply"
              className="block text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              申请上榜
            </Link>
            <Link
              href="/about"
              className="block text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              关于我们
            </Link>
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="block text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                管理控制台
              </Link>
            )}

            {user ? (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  退出登录
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2 pt-2">
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    登录
                  </Button>
                </Link>
                <Link href="/register" className="w-full">
                  <Button className="w-full" onClick={() => setIsMenuOpen(false)}>
                    注册
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

