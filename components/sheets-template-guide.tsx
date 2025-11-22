"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from "lucide-react"

export function SheetsTemplateGuide() {
  const copyTemplate = () => {
    const template = `이름	전화번호	회사	방문목적	상태
김철수	010-1234-5678	ABC건설	공사감리	입장
이영희	010-9876-5432	XYZ엔지니어링	설비점검	입장
박민수	010-5555-1234	DEF컨설팅	안전점검	퇴장
최지원	010-7777-8888	GHI테크	시스템점검	입장`

    navigator.clipboard.writeText(template)
    alert("템플릿이 복사되었습니다!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">구글시트 양식 만들기 가이드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">1단계: 새 구글시트 만들기</h3>
            <p className="text-sm text-gray-600">구글 드라이브에서 "새로 만들기" → "Google Sheets" 선택</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">2단계: 헤더 입력 (첫 번째 행)</h3>
            <div className="grid grid-cols-5 gap-2 mt-2 text-sm">
              <div className="bg-blue-100 p-2 text-center font-medium">A1: 이름</div>
              <div className="bg-blue-100 p-2 text-center font-medium">B1: 전화번호</div>
              <div className="bg-blue-100 p-2 text-center font-medium">C1: 회사</div>
              <div className="bg-blue-100 p-2 text-center font-medium">D1: 방문목적</div>
              <div className="bg-blue-100 p-2 text-center font-medium">E1: 상태</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">3단계: 샘플 데이터 입력</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-gray-300 p-2">이름</th>
                    <th className="border border-gray-300 p-2">전화번호</th>
                    <th className="border border-gray-300 p-2">회사</th>
                    <th className="border border-gray-300 p-2">방문목적</th>
                    <th className="border border-gray-300 p-2">상태</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2">김철수</td>
                    <td className="border border-gray-300 p-2">010-1234-5678</td>
                    <td className="border border-gray-300 p-2">ABC건설</td>
                    <td className="border border-gray-300 p-2">공사감리</td>
                    <td className="border border-gray-300 p-2 bg-green-100">입장</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">이영희</td>
                    <td className="border border-gray-300 p-2">010-9876-5432</td>
                    <td className="border border-gray-300 p-2">XYZ엔지니어링</td>
                    <td className="border border-gray-300 p-2">설비점검</td>
                    <td className="border border-gray-300 p-2 bg-green-100">입장</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">박민수</td>
                    <td className="border border-gray-300 p-2">010-5555-1234</td>
                    <td className="border border-gray-300 p-2">DEF컨설팅</td>
                    <td className="border border-gray-300 p-2">안전점검</td>
                    <td className="border border-gray-300 p-2 bg-red-100">퇴장</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-semibold mb-2 text-yellow-800">중요한 규칙</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • <strong>상태 열</strong>: 반드시 "입장" 또는 "퇴장"만 입력
              </li>
              <li>
                • <strong>전화번호</strong>: 010-0000-0000 형식으로 입력
              </li>
              <li>
                • <strong>첫 번째 행</strong>: 헤더는 절대 변경하지 마세요
              </li>
              <li>
                • <strong>빈 행</strong>: 중간에 빈 행이 있으면 안 됩니다
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">4단계: 공유 설정</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. 우측 상단 "공유" 버튼 클릭</li>
              <li>2. "링크가 있는 모든 사용자" 선택</li>
              <li>3. "뷰어" 권한으로 설정</li>
              <li>4. "링크 복사" 후 시스템에 입력</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button onClick={copyTemplate} className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              템플릿 복사하기
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("https://sheets.google.com", "_blank")}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              구글시트 열기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
