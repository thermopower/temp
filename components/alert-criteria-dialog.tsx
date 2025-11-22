"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

type AlertLevel = "white" | "blue" | "yellow" | "red"

interface CriteriaItem {
  id: string
  category: string
  white: string
  blue: string
  yellow: string
  red: string
}

const criteriaData: CriteriaItem[] = [
  {
    id: "scope",
    category: "사고 범위",
    white: "방류벽 내부",
    blue: "방류벽 외부",
    yellow: "사업장 외부",
    red: "사업장 외부",
  },
  {
    id: "self-response",
    category: "자체조치",
    white: "가능(밸브 등)",
    blue: "가능(소화수, 소석회 등)",
    yellow: "불가능",
    red: "불가능",
  },
  {
    id: "casualties",
    category: "인명 피해",
    white: "없음",
    blue: "없음",
    yellow: "없음",
    red: "있음",
  },
  {
    id: "evacuation",
    category: "주민 대피",
    white: "X",
    blue: "X",
    yellow: "X",
    red: "O(암모니아)",
  },
]

const alertLevelConfig = {
  white: { label: "백색", color: "bg-gray-100 text-gray-800 border-gray-300" },
  blue: { label: "청색", color: "bg-blue-100 text-blue-800 border-blue-300" },
  yellow: { label: "황색", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  red: { label: "적색", color: "bg-red-100 text-red-800 border-red-300" },
}

interface AlertCriteriaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedOptions?: Record<string, string>
}

export function AlertCriteriaDialog({ open, onOpenChange, selectedOptions = {} }: AlertCriteriaDialogProps) {
  const shouldHighlight = (criteriaId: string, cellValue: string): boolean => {
    const criteriaToSelectedOptionsMapping: Record<string, string | undefined> = {
      scope: selectedOptions["scope"],
      "self-response": selectedOptions["self-response"],
      casualties: selectedOptions["casualties"],
      evacuation: selectedOptions["evacuation"],
    }

    const selectedValue = criteriaToSelectedOptionsMapping[criteriaId]

    if (!selectedValue) return false

    switch (criteriaId) {
      case "scope":
        return cellValue === selectedValue
      case "self-response":
        return cellValue === selectedValue
      case "casualties":
        return cellValue === selectedValue
      case "evacuation":
        if (selectedValue === "필요") {
          return cellValue.includes("O")
        } else if (selectedValue === "불필요") {
          return cellValue === "X"
        }
        break
    }
    return false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-purple-600" />
            경보단계별 세부기준 및 판정 원칙
          </DialogTitle>
          <DialogDescription>각 경보 단계의 판정 기준과 원칙을 확인하세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 판정 원칙 */}
          <Card className="border-purple-300 bg-purple-50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-purple-900 text-lg mb-2">경보단계 판정 원칙</h3>
                    <div className="space-y-2 text-purple-800">
                      <p className="font-semibold">✓ 기준이 하나라도 초과할 경우 다음 경보단계로 판정</p>
                      <div className="bg-white p-4 rounded-lg border border-purple-200 mt-3">
                        <p className="font-medium text-purple-900 mb-2">판정 우선순위:</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          <li>
                            <strong>인명 피해 발생</strong> → 즉시 적색경보
                          </li>
                          <li>
                            <strong>주민 대피 필요</strong> → 즉시 적색경보
                          </li>
                          <li>
                            <strong>사업장 외부 확산</strong> 또는 <strong>자체조치 불가능</strong> → 황색경보
                          </li>
                          <li>
                            <strong>방류벽 외부</strong> 또는 <strong>소화수/소석회 필요</strong> → 청색경보
                          </li>
                          <li>그 외 → 백색경보</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 경보 단계별 세부 기준 테이블 */}
          <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="p-1.5 md:p-4 text-left text-[11px] md:text-sm font-semibold bg-gray-100 border border-gray-300 w-[22%]">
                      기준
                    </th>
                    {(Object.keys(alertLevelConfig) as AlertLevel[]).map((level) => (
                      <th
                        key={level}
                        className={`p-2 md:p-4 text-center text-xs md:text-sm font-semibold border border-gray-300 w-[19.5%] ${
                          alertLevelConfig[level].color
                        }`}
                      >
                        {alertLevelConfig[level].label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {criteriaData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-1.5 md:p-4 text-[11px] md:text-sm font-medium bg-gray-50 border border-gray-300">
                        {item.category}
                      </td>
                      <td
                        className={`p-2 md:p-4 text-center text-xs md:text-sm border border-gray-300 transition-colors ${
                          shouldHighlight(item.id, item.white) ? "bg-blue-100 text-blue-900 font-bold" : ""
                        }`}
                      >
                        {item.white}
                      </td>
                      <td
                        className={`p-2 md:p-4 text-center text-xs md:text-sm border border-gray-300 transition-colors ${
                          shouldHighlight(item.id, item.blue) ? "bg-blue-100 text-blue-900 font-bold" : ""
                        }`}
                      >
                        {item.blue}
                      </td>
                      <td
                        className={`p-2 md:p-4 text-center text-xs md:text-sm border border-gray-300 transition-colors ${
                          shouldHighlight(item.id, item.yellow) ? "bg-blue-100 text-blue-900 font-bold" : ""
                        }`}
                      >
                        {item.yellow}
                      </td>
                      <td
                        className={`p-2 md:p-4 text-center text-xs md:text-sm border border-gray-300 transition-colors ${
                          shouldHighlight(item.id, item.red) ? "bg-blue-100 text-blue-900 font-bold" : ""
                        }`}
                      >
                        {item.red}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 경보 단계별 대응 조치 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-gray-300">
              <CardContent className="pt-6">
                <Badge className="bg-gray-100 text-gray-800 border-gray-300 mb-3">백색</Badge>
                <p className="text-sm text-gray-700">
                  방류벽 내부 소규모 누출, 밸브 조작 등으로 자체 조치 가능한 경미한 사고
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-300">
              <CardContent className="pt-6">
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 mb-3">청색</Badge>
                <p className="text-sm text-gray-700">
                  방류벽 외부로 확산되었으나 소화수, 소석회 등으로 자체 조치 가능한 사고
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-300">
              <CardContent className="pt-6">
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 mb-3">황색</Badge>
                <p className="text-sm text-gray-700">
                  사업장 외부로 확산되었거나 자체 조치가 불가능하여 외부 지원이 필요한 사고
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-300">
              <CardContent className="pt-6">
                <Badge className="bg-red-100 text-red-800 border-red-300 mb-3">적색</Badge>
                <p className="text-sm text-gray-700">
                  인명 피해가 발생했거나 주민 대피가 필요한 중대 사고 (암모니아 누출 등)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
