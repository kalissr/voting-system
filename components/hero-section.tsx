import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-yellow-500/10 to-orange-500/10 dark:from-green-900/20 dark:via-yellow-900/20 dark:to-orange-900/20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text animate-float">韭菜娱乐榜</h1>
          <p className="text-xl md:text-2xl mb-8 text-foreground/80">
            眼花缭乱的安全培训机构，到底哪家强？投票表达你的看法！
          </p>
          <div className="glass-effect p-6 rounded-lg mb-8 max-w-xl mx-auto">
            <p className="text-sm text-foreground/70 mb-4">
              声明：本榜单仅供娱乐，不作为选择培训机构的依据。数据由用户提交，不保证绝对准确。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full">
                  注册参与投票
                </Button>
              </Link>
              <Link href="/apply">
                <Button size="lg" variant="outline" className="w-full">
                  申请上榜
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

