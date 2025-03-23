import Link from "next/link"

export function Footer() {
  return (
    <footer className="glass-effect mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 gradient-text">韭菜娱乐榜</h3>
            <p className="text-sm text-muted-foreground">
              本站仅供娱乐，不作为选择培训机构的依据。 数据由用户提交，不保证绝对准确。
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-muted-foreground hover:text-primary transition-colors">
                  申请上榜
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  关于我们
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  使用条款
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  隐私政策
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">免责声明</h3>
            <p className="text-sm text-muted-foreground">
              本站不向第三方出售用户数据，仅存储必要信息（如IP用于防刷票）。
              本站不对任何培训机构的质量做出保证，排名仅反映用户投票情况。
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} 韭菜娱乐榜. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  )
}

