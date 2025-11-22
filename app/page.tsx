import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, List, Users } from "lucide-react"
import WeatherWidget from "@/components/weather-widget"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              <span className="block sm:inline">GS동해전력</span>
              <span className="block sm:inline sm:ml-2">사고 알림 시스템</span>
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto"></p>
          <div className="mt-4 text-sm text-gray-500"></div>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <Link href="/report">
            <Button
              size="lg"
              className="w-full h-16 text-lg font-medium bg-red-600 hover:bg-red-700 text-white shadow-lg"
            >
              <AlertTriangle className="h-5 w-5 mr-3" />
              사고 신고(최초 발견자)
            </Button>
          </Link>

          <Link href="/status">
            <Button
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg font-medium bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
            >
              <List className="h-5 w-5 mr-3" />
              경보 승인(제어실)
            </Button>
          </Link>

          <Link href="/emergency-contacts">
            <Button
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg font-medium bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-lg border-2 border-yellow-500"
            >
              <Users className="h-5 w-5 mr-3" />
              주요 비상연락망
            </Button>
          </Link>

          <Link href="/procedures">
            <Button
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg font-medium border-2 border-orange-500 text-orange-600 hover:bg-orange-50 bg-transparent"
            >
              <AlertTriangle className="h-5 w-5 mr-3" />
              대피 절차
            </Button>
          </Link>

          <Link href="/contacts">
            <Button
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg font-medium border-2 border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
            >
              <Users className="h-5 w-5 mr-3" />
              명단 관리(관리자)
            </Button>
          </Link>
        </div>
        {/* </CHANGE> */}

        <div className="max-w-2xl mx-auto mt-8 mb-8">
          <WeatherWidget />
        </div>

        <div className="text-center mt-12 text-sm text-gray-500">
          <p>24시간 비상상황 대응 시스템</p>
          <p>
            긴급상황 발생시: 119 신고 후<br className="sm:hidden" /> 발전파트장(033-820-1411) 보고
          </p>
          <p>문의: 안전팀장 (긴급연락반장,033-820-1370)</p>
        </div>
      </div>
    </div>
  )
}
