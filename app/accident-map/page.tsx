"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, AlertTriangle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LOCATION_MAP, type LocationInfo } from "@/lib/location-mapping"

interface AccidentLocation {
  id: number
  location: LocationInfo
  severity: "minor" | "moderate" | "major" | "critical"
  type: string
  timestamp: string
}

export default function AccidentMapPage() {
  const [accidents, setAccidents] = useState<AccidentLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAccidents()
  }, [])

  const fetchAccidents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/incidents")
      if (!response.ok) {
        throw new Error("사고 데이터를 불러올 수 없습니다")
      }
      const data = await response.json()

      const accidentLocations: AccidentLocation[] = data.incidents
        .filter((incident: any) => incident.status === "active")
        .map((incident: any) => {
          const location = getLocationByName(incident.location)
          if (!location) return null

          return {
            id: incident.id,
            location: location,
            severity: mapAlertLevelToSeverity(incident.alertLevel),
            type: incident.type,
            timestamp: new Date(incident.reportedAt).toLocaleString("ko-KR"),
          }
        })
        .filter(Boolean)

      setAccidents(accidentLocations)
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다")
      console.error("[v0] 사고 데이터 로딩 실패:", err)

      const exampleAccidents: AccidentLocation[] = [
        {
          id: 1,
          location: LOCATION_MAP[4], // 암모니아 저장 탱크
          severity: "major",
          type: "유해물질 누출",
          timestamp: new Date().toLocaleString("ko-KR"),
        },
      ]
      setAccidents(exampleAccidents)
    } finally {
      setIsLoading(false)
    }
  }

  const mapAlertLevelToSeverity = (alertLevel: string): "minor" | "moderate" | "major" | "critical" => {
    switch (alertLevel) {
      case "적색경보":
        return "critical"
      case "황색경보":
        return "major"
      case "청색경보":
        return "moderate"
      case "백색경보":
        return "minor"
      default:
        return "minor"
    }
  }

  const getLocationByName = (name: string): LocationInfo | undefined => {
    return LOCATION_MAP.find((location) => location.name === name)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600"
      case "major":
        return "bg-orange-500"
      case "moderate":
        return "bg-blue-500"
      case "minor":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "critical":
        return "적색경보"
      case "major":
        return "황색경보"
      case "moderate":
        return "청색경보"
      case "minor":
        return "백색경보"
      default:
        return "백색경보"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로가기
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">사고 위치 지도</h1>
          </div>
          <Card className="text-center py-12">
            <CardContent>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">사고 현황을 불러오는 중...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">사고 위치 지도</h1>
          <Button variant="outline" size="sm" className="ml-auto bg-transparent" onClick={fetchAccidents}>
            새로고침
          </Button>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Map Container */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                GS동해전력 발전소 배치도
                {accidents.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    진행중인 사고: {accidents.length}건
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
                <img src="/images/plant-layout.png" alt="발전소 배치도" className="w-full h-auto" />

                {accidents.map((accident) => (
                  <div
                    key={accident.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${accident.location.coordinates.x}%`,
                      top: `${accident.location.coordinates.y}%`,
                    }}
                  >
                    {/* Red pulsing dot */}
                    <div className="relative">
                      <div className="w-6 h-6 bg-red-600 rounded-full animate-pulse shadow-lg border-2 border-white"></div>
                      <div className="absolute inset-0 w-6 h-6 bg-red-600 rounded-full animate-ping opacity-75"></div>

                      {/* Location number badge */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <Badge variant="destructive" className="text-xs font-bold">
                          {["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"][accident.location.id - 1]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Location number legend */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <h4 className="font-semibold text-sm mb-2">위치 번호</h4>
                  <div className="space-y-1 text-xs">
                    {LOCATION_MAP.map((location) => (
                      <div key={location.id} className="flex items-center gap-2">
                        <span className="font-mono">
                          {["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"][location.id - 1]}
                        </span>
                        <span className="text-gray-700">{location.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {accidents.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  현재 사고 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accidents.map((accident) => (
                    <div key={accident.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getSeverityColor(accident.severity)}`}></div>
                          <Badge variant="destructive">{getSeverityLabel(accident.severity)}</Badge>
                        </div>
                        <span className="text-sm text-gray-600">{accident.timestamp}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-600" />
                          <span className="font-semibold">
                            {["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"][accident.location.id - 1]}{" "}
                            {accident.location.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{accident.location.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>
                            <strong>사고종류:</strong> {accident.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Shield className="h-5 w-5" />
                  사고 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">현재 진행 중인 사고가 없습니다</h3>
                  <p className="text-gray-600">GS동해전력 안전 운영 중입니다</p>
                  {error && (
                    <p className="text-sm text-orange-600 mt-2">참고: 데모용 예시 데이터가 표시될 수 있습니다</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">비상 대응 지침</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-800">즉시 조치사항</h4>
                  <ul className="space-y-1 text-orange-700">
                    <li>• 사고 지점 접근 금지</li>
                    <li>• 풍향 확인 후 반대방향 대피</li>
                    <li>• 비상연락망 가동</li>
                    <li>• 119 신고 (생명위험 시)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-800">대피 집결지</h4>
                  <ul className="space-y-1 text-orange-700">
                    <li>• 주차장 (암모니아, 수소 사고 시)</li>
                    <li>• 관리동 (염산 사고 시)</li>
                    <li>• 정문 (화재 사고 시)</li>
                    <li>• 풍향 고려하여 안전지역 선택</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
