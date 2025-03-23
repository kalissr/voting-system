import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AlertTriangle, Shield, Users, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold gradient-text text-center mb-8">关于韭菜娱乐榜</h1>

          <Card className="glass-effect mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">项目初衷</CardTitle>
              <CardDescription>为什么我们创建这个平台</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                随着网络安全行业的快速发展，越来越多的安全培训机构如雨后春笋般涌现，让人眼花缭乱。
                作为一个安全从业者，我经常被问到"哪家培训机构比较好"这样的问题。
              </p>
              <p>
                韭菜娱乐榜的创建纯属娱乐性质，旨在通过用户投票的方式，让大家了解各个安全培训机构的受欢迎程度。
                我们不对任何培训机构的质量做出保证，排名仅反映用户投票情况。
              </p>
              <p>本项目没有任何商业化行为，不接受任何形式的广告或赞助，保持中立客观的立场。</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  数据声明
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  我们无法完全保证数据的准确性和安全性，但会尽力维护。 所有机构信息均由用户提交，我们不对其真实性负责。
                  投票数据可能存在误差，仅供参考。
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl">
                  <AlertTriangle className="h-5 w-5 mr-2 text-accent" />
                  免责声明
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  本榜单仅供娱乐，不作为选择培训机构的依据。 用户应自行判断培训机构的质量和适合度。
                  我们不对因使用本站信息造成的任何损失负责。
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-effect mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">参与方式</CardTitle>
              <CardDescription>如何参与韭菜娱乐榜</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">注册账号</h3>
                  <p className="text-sm text-muted-foreground">
                    注册一个账号，一个IP只能注册一个账户，注册时需要进行人机验证。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-secondary/10 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">参与投票</h3>
                  <p className="text-sm text-muted-foreground">
                    浏览排行榜，为你认可的安全培训机构投票。每个账户只能为每个机构投票一次。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-accent/10 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">申请上榜</h3>
                  <p className="text-sm text-muted-foreground">
                    如果你是培训机构的代表，可以申请将你的机构添加到排行榜中。申请需要经过管理员审核。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-2xl">联系我们</CardTitle>
              <CardDescription>有问题或建议？请联系我们</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">如果你有任何问题、建议或反馈，欢迎通过以下方式联系我们：</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="font-medium">邮箱：</span>
                  <a href="mailto:contact@example.com" className="text-primary hover:underline">
                    contact@example.com
                  </a>
                </li>
                <li>
                  <span className="font-medium">GitHub：</span>
                  <a
                    href="https://github.com/example/voting-system"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    github.com/example/voting-system
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </main>
  )
}

