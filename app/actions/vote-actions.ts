"use server"

import { prisma } from "@/lib/db"
import { getCurrentUser, requireAuth } from "@/lib/auth"
import { getClientIp } from "@/lib/get-ip"
import { revalidatePath } from "next/cache"

export async function voteForInstitution(institutionId: string) {
  try {
    const user = await requireAuth()
    const clientIp = getClientIp()

    // 检查用户是否已经为该机构投过票
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_institutionId: {
          userId: user.id,
          institutionId,
        },
      },
    })

    if (existingVote) {
      return { success: false, message: "您已经为该机构投过票了" }
    }

    // 创建投票记录
    await prisma.vote.create({
      data: {
        userId: user.id,
        institutionId,
        ipAddress: clientIp,
      },
    })

    revalidatePath("/")
    return { success: true, message: "投票成功" }
  } catch (error) {
    console.error("投票失败:", error)
    return { success: false, message: "投票失败，请稍后再试" }
  }
}

export async function getInstitutions() {
  try {
    const institutions = await prisma.institution.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: {
        votes: {
          _count: "desc",
        },
      },
    })

    const currentUser = await getCurrentUser()

    let userVotes: string[] = []

    if (currentUser) {
      const votes = await prisma.vote.findMany({
        where: {
          userId: currentUser.id,
        },
        select: {
          institutionId: true,
        },
      })

      userVotes = votes.map((vote) => vote.institutionId)
    }

    return {
      success: true,
      institutions: institutions.map((inst) => ({
        id: inst.id,
        name: inst.name,
        description: inst.description,
        avatarUrl: inst.avatarUrl || "/placeholder.svg?height=80&width=80",
        votes: inst._count.votes,
        hasVoted: userVotes.includes(inst.id),
      })),
      isLoggedIn: !!currentUser,
    }
  } catch (error) {
    console.error("获取机构列表失败:", error)
    return { success: false, message: "获取机构列表失败，请稍后再试" }
  }
}

