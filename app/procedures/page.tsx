import EvacuationProcedures from "@/components/evacuation-procedures"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function ProceduresPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              메인으로
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">대피 절차</h1>
              <p className="text-gray-600">GS동해전력 화학사고 대응 매뉴얼</p>
            </div>
          </div>
        </div>

        {/* 대피 절차 컴포넌트 */}
        <EvacuationProcedures />

        {/* 하단 안내 */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-blue-800 mb-2">비상상황 발생 시 행동요령</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>1. 즉시 119 신고 후 발전파트장에게 보고</p>
              <p>2. 현장 상황에 따라 적절한 경보 단계 판단</p>
              <p>3. 지정된 대피 절차에 따라 신속하게 행동</p>
              <p>4. 대피 완료 후 지정된 집결지에서 인원 점검</p>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-blue-600">문의: 안전팀장 (긴급연락반장) | 24시간 비상상황 대응 시스템 운영</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
