"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, Award, TrendingUp, Filter, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getInstitutions, voteForInstitution } from "@/app/actions/vote-actions"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type Institution = {
  id: string
  name: string
  description: string
  avatarUrl: string
  votes: number
  hasVoted: boolean
}

export function RankingBoard() {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchInstitutions()
  }, [])

  const fetchInstitutions = async () => {
    try {
      setIsLoading(true)
      const result = await getInstitutions()

      if (result.success) {
        setInstitutions(result.institutions)
        setIsLoggedIn(result.isLoggedIn)
      } else {
        setError(result.message || "获取机构列表失败")
      }
    } catch (error) {
      setError("获取机构列表失败，请稍后再试")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVote = async (id: string) => {
    if (!isLoggedIn) {
      toast({
        title: "请先登录",
        description: "您需要登录后才能投票",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await voteForInstitution(id)

      if (result.success) {
        toast({
          title: "投票成功",
          description: "感谢您的参与！",
        })

        // 更新本地状态
        setInstitutions(
          institutions
            .map((inst) => (inst.id === id ? { ...inst, votes: inst.votes + 1, hasVoted: true } : inst))
            .sort((a, b) => b.votes - a.votes),
        )
      } else {
        toast({
          title: "投票失败",
          description: result.message || "投票失败，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "投票失败",
        description: "投票失败，请稍后再试",
        variant: "destructive",
      })
      console.error(error)
    }
  }

  const sortInstitutions = (type: "votes" | "name" | "newest") => {
    const sorted = [...institutions]

    switch (type) {
      case "votes":
        sorted.sort((a, b) => b.votes - a.votes)
        break
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "newest":
        // 在实际应用中，这里应该根据创建时间排序
        // 但由于我们的模拟数据没有创建时间，所以这里只是示例
        break
    }

    setInstitutions(sorted)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold gradient-text">安全培训机构排行榜</h2>
            <p className="text-muted-foreground">正在加载数据...</p>
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="glass-effect overflow-hidden">
              <CardContent className="p-6">
                <div className="flex animate-pulse gap-6 items-center">
                  <div className="h-24 w-24 rounded-full bg-muted"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-4 w-3/4 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 w-1/2 bg-muted rounded"></div>
                  </div>
                  <div className="h-10 w-24 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>加载失败</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold gradient-text">安全培训机构排行榜</h2>
          <p className="text-muted-foreground">根据用户投票实时更新，仅供娱乐参考</p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => sortInstitutions("votes")}>按投票数排序</DropdownMenuItem>
              <DropdownMenuItem onClick={() => sortInstitutions("name")}>按名称排序</DropdownMenuItem>
              <DropdownMenuItem onClick={() => sortInstitutions("newest")}>按最新加入排序</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {institutions.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>暂无数据</AlertTitle>
          <AlertDescription>
            目前还没有机构上榜，请
            <Link href="/apply" className="text-primary hover:underline ml-1">
              申请上榜
            </Link>
            或等待管理员审核。
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6">
          {institutions.map((institution, index) => (
            <Card
              key={institution.id}
              className="glass-effect overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <div className="relative">
                    {index < 3 && (
                      <div className="absolute -top-2 -left-2 z-10">
                        <Badge
                          className={`
                          ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-300" : "bg-amber-700"}
                          text-white font-bold
                        `}
                        >
                          <Award className="h-4 w-4 mr-1" />
                          {index + 1}
                        </Badge>
                      </div>
                    )}
                    <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800">
                      <AvatarImage src={institution.avatarUrl} alt={institution.name} />
                      <AvatarFallback className="text-2xl">{institution.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold">{institution.name}</h3>
                    <p className="text-muted-foreground mb-2">{institution.description}</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                      <Badge variant="outline" className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        排名 #{index + 1}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {institution.votes} 票
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => handleVote(institution.id)}
                      disabled={!isLoggedIn || institution.hasVoted}
                      className={`
                        ${institution.hasVoted ? "bg-green-500 hover:bg-green-600" : ""}
                        transition-all duration-300 hover:scale-105
                      `}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      {institution.hasVoted ? "已投票" : "投票"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoggedIn && (
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>需要登录</AlertTitle>
          <AlertDescription>
            您需要
            <Link href="/login" className="text-primary hover:underline mx-1">
              登录
            </Link>
            后才能投票。没有账号？
            <Link href="/register" className="text-primary hover:underline ml-1">
              立即注册
            </Link>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

