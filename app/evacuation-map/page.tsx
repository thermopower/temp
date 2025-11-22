"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, AlertTriangle, Phone } from "lucide-react"
import InteractivePlantMap from "@/components/interactive-plant-map"

export default function EvacuationMapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-red-800">비상 대피장소 안내</h1>
          <p className="text-red-600 text-sm md:text-base">GS동해전력 비상상황 시 대피장소 및 경로 안내</p>
        </div>

        {/* Emergency Contact */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <Phone className="h-5 w-5" />
              <span className="font-semibold">비상연락처: 119 / 033-530-5000</span>
            </div>
          </CardContent>
        </Card>

        {/* Plant Layout Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-red-600" />
              시설 배치도 및 대피경로
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InteractivePlantMap />
            {/* Evacuation markers overlay */}
            <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
              1차 대피장소: 구사옥
            </div>
            <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              2차 대피장소: 동해시청 별관
            </div>
          </CardContent>
        </Card>

        {/* Evacuation Locations */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  황색경보
                </Badge>
                1차 대피장소
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-yellow-600" />
                <span className="font-semibold">구사옥</span>
              </div>
              <p className="text-sm text-gray-600">
                • 위치: 발전소 내부 안전구역
                <br />• 수용인원: 약 200명
                <br />• 시설: 비상용품, 통신장비 구비
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  적색경보
                </Badge>
                2차 대피장소
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <span className="font-semibold">동해시청 별관</span>
              </div>
              <p className="text-sm text-gray-600">
                • 위치: 발전소 외부 안전지역
                <br />• 수용인원: 약 500명
                <br />• 시설: 의료진, 구호물품 완비
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Risk Areas Warning */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              위험지역 주의사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">화재/폭발 위험지역</h4>
                <ul className="space-y-1 text-orange-700">
                  <li>• 부생연료유 탱크</li>
                  <li>• 수소룸</li>
                  <li>• 암모니아 저장탱크</li>
                  <li>• 가스터빈 연료공급라인</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">대피 시 주의사항</h4>
                <ul className="space-y-1 text-orange-700">
                  <li>• 바람 방향을 확인하여 대피</li>
                  <li>• 엘리베이터 사용 금지</li>
                  <li>• 젖은 수건으로 코와 입 보호</li>
                  <li>• 안전요원의 지시에 따라 행동</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              대피경로 안내
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-1">1단계: 즉시 대피</h4>
                <p className="text-blue-700">현재 위치에서 가장 가까운 비상구로 신속히 이동</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-1">2단계: 집결지 이동</h4>
                <p className="text-green-700">지정된 집결지에서 인원점검 및 상황파악</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-1">3단계: 최종 대피</h4>
                <p className="text-purple-700">경보 단계에 따라 1차 또는 2차 대피장소로 이동</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-4">
          <p>GS동해전력 비상대응시스템 | 최종 업데이트: {new Date().toLocaleDateString("ko-KR")}</p>
        </div>
      </div>
    </div>
  )
}
