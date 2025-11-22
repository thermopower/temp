"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, CheckCircle, Clock, AlertTriangle, Users, MapPin, Wind, Thermometer, Eye } from "lucide-react"
import {
  getDongHaeWeather,
  getSmartEvacuationRecommendation,
  type WeatherData,
  type SmartEvacuationRecommendation,
} from "@/lib/weather-service"
import type { AlertLevel } from "@/lib/types"
import Link from "next/link"
import EvacuationProcedures from "@/components/evacuation-procedures"

const alertLevelInfo = {
  white: {
    name: "백색경보",
    description: "자체 조치 가능한 상황",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
  },
  blue: {
    name: "청색경보",
    description: "해당지역 출입통제 필요",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  },
  yellow: {
    name: "황색경보",
    description: "외부 대피 또는 유관기관 지원 필요",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  red: {
    name: "적색경보",
    description: "인근주민까지 영향 가능",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
  },
}

const mockContacts = [
  { id: 1, role: "employee", emergencyRole: "비상대응팀장", isActive: true },
  { id: 2, role: "employee", emergencyRole: "소방반장", isActive: true },
  { id: 3, role: "employee", emergencyRole: "의료반장", isActive: true },
  { id: 4, role: "employee", emergencyRole: null, isActive: true },
  { id: 5, role: "contractor", emergencyRole: null, isActive: true },
]

const evacuationSites = [
  {
    name: "주차장 집결지",
    address: "발전소 정문 주차장",
    capacity: 500,
    facilities: ["응급의료소", "비상통신소"],
  },
]

const alertMessageTemplates = {
  chemical_leak: `🚨 [GS동해전력] 화학물질 누출 비상상황 발생

📍 발생위치: 암모니아 저장탱크
⚠️ 상황: 유해물질 누출사고 
🔔 경보단계: 황색경보

즉시 다음 조치를 취하세요:
1. 현재 위치에서 즉시 대피
2. 호흡기 보호구 착용
3. 바람의 반대방향으로 이동
4. 지정된 집결지로 대피

집결지: 종합사무동 주차장
비상연락처: 119`,

  fire: `🚨 [GS동해전력] 화재 비상상황 발생

📍 발생위치: 부생연료유 저장탱크
⚠️ 상황: 화재사고
🔔 경보단계: 황색경보

즉시 다음 조치를 취하세요:
1. 현재 위치에서 즉시 대피
2. 엘리베이터 사용 금지
3. 계단을 이용하여 신속히 대피
4. 지정된 집결지로 대피

집결지: 종합사무동 주차장
비상연락처: 119`,
}

export default function NotificationsPage() {
  const [alertLevel, setAlertLevel] = useState<AlertLevel>("yellow")
  const [incidentType, setIncidentType] = useState<"leak" | "fire_explosion">("leak")
  const [location, setLocation] = useState("암모니아 저장탱크 (M-TK-01A)")
  const [notificationsSent, setNotificationsSent] = useState(0)
  const [totalContacts, setTotalContacts] = useState(0)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationComplete, setSimulationComplete] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [smartEvacuation, setSmartEvacuation] = useState<SmartEvacuationRecommendation | null>(null)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)

  useEffect(() => {
    // 경보 단계에 따른 대상자 수 계산
    const relevantContacts = mockContacts.filter((contact) => {
      if (alertLevel === "white" || alertLevel === "blue") {
        return contact.role === "employee" && contact.emergencyRole
      }
      return contact.isActive // 황색/적색은 모든 활성 인원
    })
    setTotalContacts(relevantContacts.length)
  }, [alertLevel])

  const loadWeatherAndEvacuation = async () => {
    if (alertLevel !== "yellow" && alertLevel !== "red") return

    setIsLoadingWeather(true)
    try {
      const weatherData = await getDongHaeWeather()
      setWeather(weatherData)

      const evacuation = getSmartEvacuationRecommendation(
        alertLevel as "yellow" | "red",
        incidentType,
        location,
        weatherData,
      )
      setSmartEvacuation(evacuation)
    } catch (error) {
      console.error("기상정보 로드 실패:", error)
    } finally {
      setIsLoadingWeather(false)
    }
  }

  useEffect(() => {
    loadWeatherAndEvacuation()
  }, [alertLevel, incidentType, location])

  const handleSendNotifications = async () => {
    setIsSimulating(true)
    setNotificationsSent(0)

    // 알림 발송 시뮬레이션
    const interval = setInterval(() => {
      setNotificationsSent((prev) => {
        if (prev >= totalContacts) {
          clearInterval(interval)
          setIsSimulating(false)
          setSimulationComplete(true)
          return totalContacts
        }
        return prev + Math.floor(Math.random() * 3) + 1
      })
    }, 500)
  }

  const getEvacuationInfo = () => {
    if (alertLevel !== "yellow" && alertLevel !== "red") return null
    // evacuationSites는 배열이므로 첫 번째 대피소를 사용
    const site = evacuationSites[0]
    return {
      site: site.name,
      route: `${site.address}로 이동`,
      estimatedTime: 15,
      instructions:
        incidentType === "leak"
          ? "호흡기 보호구 착용 후 바람의 반대 방향으로 대피하세요."
          : "신속히 건물 밖으로 대피하고 집합장소에서 인원점검을 받으세요.",
    }
  }

  const getMessageTemplate = () => {
    if (incidentType === "leak") {
      return alertMessageTemplates.chemical_leak
    } else {
      return alertMessageTemplates.fire
    }
  }

  const evacuationInfo = getEvacuationInfo()
  const messageTemplate = getMessageTemplate()
  const alertInfo = alertLevelInfo[alertLevel]

  const getWeatherAwareMessage = () => {
    if (!weather || !smartEvacuation) return messageTemplate || ""

    const baseMessage = messageTemplate || ""
    const weatherInfo = `\n\n🌤️ 현재 기상: ${weather.windDirection}풍 ${weather.windSpeed}m/s, ${weather.temperature}°C\n📍 추천 대피장소: ${smartEvacuation.primarySite}\n⚠️ ${smartEvacuation.specialInstructions}`

    return baseMessage + weatherInfo
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center mb-6">
          <Link href="/report">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">비상 알림 발송</h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* 경보 상태 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                경보 발령 상태
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Badge className={`${alertInfo.bgColor} ${alertInfo.textColor} text-lg px-4 py-2`}>
                  {alertInfo.name}
                </Badge>
                <span className="text-gray-600">{alertInfo.description}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>사고 위치:</strong> {location}
                </div>
                <div>
                  <strong>사고 유형:</strong> {incidentType === "leak" ? "유해물질 누출" : "화재/폭발"}
                </div>
              </div>
            </CardContent>
          </Card>

          {(alertLevel === "yellow" || alertLevel === "red") && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Wind className="h-5 w-5" />
                  실시간 기상정보 (동해시)
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadWeatherAndEvacuation}
                    disabled={isLoadingWeather}
                    className="ml-auto bg-transparent"
                  >
                    {isLoadingWeather ? <Clock className="h-4 w-4 animate-spin" /> : "새로고침"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800">
                {weather ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4" />
                      <div>
                        <div className="font-semibold">{weather.windDirection}풍</div>
                        <div>{weather.windSpeed}m/s</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      <div>
                        <div className="font-semibold">기온</div>
                        <div>{weather.temperature}°C</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <div>
                        <div className="font-semibold">시정</div>
                        <div>{weather.visibility}km</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">강수량</div>
                      <div>{weather.precipitation}mm</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    {isLoadingWeather ? "기상정보 로딩 중..." : "기상정보를 불러올 수 없습니다"}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {smartEvacuation && (alertLevel === "yellow" || alertLevel === "red") && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <MapPin className="h-5 w-5" />
                  스마트 대피장소 안내 (기상 조건 반영)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-orange-800">
                <div className="space-y-3">
                  <div>
                    <strong>추천 대피장소:</strong> {smartEvacuation.primarySite}
                  </div>
                  <div>
                    <strong>대피경로:</strong> {smartEvacuation.route}
                  </div>
                  <div>
                    <strong>예상 대피시간:</strong> {smartEvacuation.estimatedTime}분
                  </div>
                  <div>
                    <strong>기상 고려사항:</strong> {smartEvacuation.weatherConsiderations}
                  </div>
                  {smartEvacuation.alternativeSites.length > 0 && (
                    <div>
                      <strong>대안 대피장소:</strong> {smartEvacuation.alternativeSites.join(", ")}
                    </div>
                  )}
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <strong>특별 지시사항:</strong>
                    <br />
                    {smartEvacuation.specialInstructions}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {evacuationInfo && !smartEvacuation && (alertLevel === "yellow" || alertLevel === "red") && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <MapPin className="h-5 w-5" />
                  대피장소 안내
                </CardTitle>
              </CardHeader>
              <CardContent className="text-orange-800">
                <div className="space-y-3">
                  <div>
                    <strong>대피장소:</strong> {evacuationInfo.site}
                  </div>
                  <div>
                    <strong>대피경로:</strong> {evacuationInfo.route}
                  </div>
                  <div>
                    <strong>예상 대피시간:</strong> {evacuationInfo.estimatedTime}분
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <strong>특별 지시사항:</strong>
                    <br />
                    {evacuationInfo.instructions}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(alertLevel === "yellow" || alertLevel === "red") && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <AlertTriangle className="h-5 w-5" />
                  상세 대피 절차
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EvacuationProcedures alertLevel={alertLevel} incidentType={incidentType} />
              </CardContent>
            </Card>
          )}

          {/* 알림 발송 현황 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                알림 발송 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold">
                  {notificationsSent} / {totalContacts}
                </div>
                <div className="text-sm text-gray-600">
                  {simulationComplete ? "발송 완료" : isSimulating ? "발송 중..." : "발송 대기"}
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${totalContacts > 0 ? (notificationsSent / totalContacts) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  발송 완료: {notificationsSent}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-orange-600" />
                  대기 중: {totalContacts - notificationsSent}
                </div>
              </div>
            </CardContent>
          </Card>

          {(messageTemplate || smartEvacuation) && (
            <Card>
              <CardHeader>
                <CardTitle>발송 메시지 미리보기 {weather && "(기상정보 포함)"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm whitespace-pre-line">
                  {getWeatherAwareMessage()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 발송 버튼 */}
          <div className="flex justify-center">
            <Button
              onClick={handleSendNotifications}
              disabled={isSimulating || simulationComplete}
              size="lg"
              className="h-14 px-8 text-lg font-semibold bg-red-600 hover:bg-red-700"
            >
              {isSimulating ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  알림 발송 중...
                </>
              ) : simulationComplete ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  발송 완료
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  비상 알림 발송 시작
                </>
              )}
            </Button>
          </div>

          {/* 완료 후 안내 */}
          {simulationComplete && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center text-green-800">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold mb-2">알림 발송 완료</h3>
                  <p className="text-sm">
                    총 {totalContacts}명에게 비상 알림이 발송되었습니다.
                    <br />
                    수신 확인 상태는 사고 현황에서 확인할 수 있습니다.
                  </p>
                  <div className="mt-4">
                    <Link href="/status">
                      <Button variant="outline" className="mr-2 bg-transparent">
                        사고 현황 보기
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button>메인으로 돌아가기</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
