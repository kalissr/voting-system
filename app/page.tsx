import { RankingBoard } from "@/components/ranking-board"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <RankingBoard />
      </div>
      <Footer />
    </main>
  )
}

