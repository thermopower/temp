"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Clock,
  MapPin,
  AlertTriangle,
  Users,
  CheckCircle,
  XCircle,
  Phone,
  Map,
  Navigation,
  Shield,
  Wind,
} from "lucide-react"
import type { Incident, Contact } from "@/lib/types"
import InteractivePlantMap from "@/components/interactive-plant-map"
import { getLocationByName } from "@/lib/location-mapping"

interface PageProps {
  params: {
    id: string
  }
}

interface EvacuationShelter {
  id: string
  name: string
  location: string
  capacity: number
  distance: string
  facilities: string[]
  alertLevels: string[]
  coordinates: { lat: number; lng: number }
}

const evacuationShelters: EvacuationShelter[] = [
  {
    id: "primary",
    name: "구사옥",
    location: "발전소 내부 안전구역",
    capacity: 200,
    distance: "300m",
    facilities: ["비상용품", "통신장비", "의료키트", "식수"],
    alertLevels: ["백색", "청색", "황색"],
    coordinates: { lat: 37.5665, lng: 129.169 },
  },
  {
    id: "secondary",
    name: "동해시청 별관",
    location: "동해시 천곡동",
    capacity: 500,
    distance: "2.5km",
    facilities: ["의료진", "구호물품", "임시숙소", "급식시설"],
    alertLevels: ["적색"],
    coordinates: { lat: 37.5245, lng: 129.1142 },
  },
  {
    id: "tertiary",
    name: "동해종합운동장",
    location: "동해시 발한동",
    capacity: 1000,
    distance: "3.2km",
    facilities: ["대규모 수용", "헬기장", "구급차 접근", "방송시설"],
    alertLevels: ["적색"],
    coordinates: { lat: 37.5089, lng: 129.1234 },
  },
]

export default function IncidentDetailPage({ params }: PageProps) {
  const [incident, setIncident] = useState<Incident | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weatherData, setWeatherData] = useState({
    windDirection: "북동풍",
    windSpeed: "3.2m/s",
    temperature: "15°C",
    humidity: "65%",
  })

  useEffect(() => {
    fetchIncidentData()
    const weatherInterval = setInterval(() => {
      const directions = ["북풍", "북동풍", "동풍", "남동풍", "남풍", "남서풍", "서풍", "북서풍"]
      const randomDirection = directions[Math.floor(Math.random() * directions.length)]
      const randomSpeed = (Math.random() * 5 + 1).toFixed(1)
      setWeatherData((prev) => ({
        ...prev,
        windDirection: randomDirection,
        windSpeed: `${randomSpeed}m/s`,
      }))
    }, 10000) // Update every 10 seconds

    return () => clearInterval(weatherInterval)
  }, [params.id])

  const fetchIncidentData = async () => {
    try {
      setIsLoading(true)

      // Fetch incident details
      const incidentResponse = await fetch(`/api/incidents/${params.id}`)
      if (!incidentResponse.ok) {
        throw new Error("사고 정보를 불러올 수 없습니다")
      }
      const incidentData = await incidentResponse.json()
      setIncident(incidentData.incident)

      // Fetch contacts for notification statistics
      const contactsResponse = await fetch("/api/contacts")
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json()
        setContacts(contactsData.contacts || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">사고 정보를 불러오는 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{error || "사고 정보를 찾을 수 없습니다"}</h3>
            <Link href="/status">
              <Button variant="outline">사고 현황으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 알림 수신 현황 시뮬레이션
  const totalContacts = contacts.length
  const confirmedCount = Math.floor(totalContacts * 0.7) // 70% 확인 (시뮬레이션)
  const confirmationRate = totalContacts > 0 ? (confirmedCount / totalContacts) * 100 : 0

  // 경보 단계별 색상
  const getAlertColor = (level: string) => {
    switch (level) {
      case "백색":
        return "bg-gray-100 text-gray-800"
      case "청색":
        return "bg-blue-100 text-blue-800"
      case "황색":
        return "bg-yellow-100 text-yellow-800"
      case "적색":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const locationInfo = getLocationByName(incident.location)
  const formatLocationDisplay = (location: string) => {
    if (locationInfo) {
      return `⑤${locationInfo.id} ${locationInfo.name}`
    }
    return location
  }

  const getRecommendedShelters = (alertLevel: string) => {
    return evacuationShelters.filter(
      (shelter) =>
        shelter.alertLevels.includes(alertLevel) || (alertLevel === "적색" && shelter.alertLevels.includes("적색")),
    )
  }

  const recommendedShelters = getRecommendedShelters(incident.alertLevel)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center mb-6">
          <Link href="/status">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              사고 현황으로
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">사고 상세 정보 및 대응 현황</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 사고 기본 정보 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <CardTitle className="text-xl">{incident.type}</CardTitle>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant={incident.status === "active" ? "destructive" : "secondary"}>
                      {incident.status === "active" ? "진행중" : "해결됨"}
                    </Badge>
                    <Badge className={getAlertColor(incident.alertLevel)}>{incident.alertLevel}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{formatLocationDisplay(incident.location)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{new Date(incident.reportedAt).toLocaleString("ko-KR")}</span>
                  </div>
                </div>

                {incident.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">사고 상황</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{incident.description}</p>
                  </div>
                )}

                {incident.emergencyResponse && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      비상대응 현황
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p className="text-blue-700">
                          <strong>비상상황본부:</strong> {incident.emergencyResponse.commandCenter}
                        </p>
                        <p className="text-blue-700">
                          <strong>대피경로:</strong> {incident.emergencyResponse.evacuationRoute}
                        </p>
                        <p className="text-blue-700">
                          <strong>영향범위:</strong> {incident.emergencyResponse.affectedRadius}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-blue-700">
                          <strong>사용장비:</strong> {incident.emergencyResponse.equipmentUsed.join(", ")}
                        </p>
                        {incident.emergencyResponse.externalAgencies.length > 0 && (
                          <p className="text-blue-700">
                            <strong>협력기관:</strong> {incident.emergencyResponse.externalAgencies.join(", ")}
                          </p>
                        )}
                        {incident.emergencyResponse.estimatedResolutionTime && (
                          <p className="text-blue-700">
                            <strong>예상 해결시간:</strong> {incident.emergencyResponse.estimatedResolutionTime}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600">신고자: {incident.reportedBy}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-blue-600 font-medium flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      알림 발송: {incident.notificationsSent || 0}명
                    </span>
                    <span className="text-sm text-green-600 font-medium flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      유관기관: {incident.emergencyResponse?.externalAgencies.length || 0}개
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Map className="h-5 w-5 mr-2" />
                  발전소 배치도 및 사고 위치
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InteractivePlantMap showAccidentMarker={true} accidentLocation={incident.location} />
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800">
                  <Wind className="h-5 w-5 mr-2" />
                  기상 조건 (대피 방향 결정 요소)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="font-semibold text-orange-800">풍향</div>
                    <div className="text-lg font-bold text-orange-600">{weatherData.windDirection}</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="font-semibold text-orange-800">풍속</div>
                    <div className="text-lg font-bold text-orange-600">{weatherData.windSpeed}</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="font-semibold text-orange-800">온도</div>
                    <div className="text-lg font-bold text-orange-600">{weatherData.temperature}</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="font-semibold text-orange-800">습도</div>
                    <div className="text-lg font-bold text-orange-600">{weatherData.humidity}</div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>대피 시 주의:</strong> 현재 {weatherData.windDirection} 바람으로 인해 화학물질이{" "}
                    {weatherData.windDirection.includes("북") ? "남쪽" : "북쪽"} 방향으로 확산될 수 있습니다. 바람의
                    반대 방향으로 대피하세요.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <Navigation className="h-5 w-5 mr-2" />
                  대피장소 안내 ({incident.alertLevel} 기준)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendedShelters.map((shelter, index) => (
                    <div key={shelter.id} className="p-4 border rounded-lg bg-green-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-green-800 flex items-center">
                            <Badge variant="outline" className="mr-2 bg-green-100 text-green-800">
                              {index === 0 ? "1차" : index === 1 ? "2차" : "3차"}
                            </Badge>
                            {shelter.name}
                          </h4>
                          <p className="text-sm text-green-700">{shelter.location}</p>
                        </div>
                        <div className="text-right text-sm text-green-600">
                          <div>거리: {shelter.distance}</div>
                          <div>수용: {shelter.capacity}명</div>
                        </div>
                      </div>
                      <div className="text-sm text-green-700">
                        <strong>시설:</strong> {shelter.facilities.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    대피 시 주의사항
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• 바람 방향을 확인하여 바람의 반대 방향으로 대피</li>
                    <li>• 엘리베이터 사용 금지, 계단 이용</li>
                    <li>• 젖은 수건으로 코와 입을 보호</li>
                    <li>• 안전요원의 지시에 따라 질서있게 행동</li>
                    <li>• 개인 소지품보다 신속한 대피 우선</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 대응 현황 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  현장 대응 현황
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">8</div>
                    <div className="text-sm text-gray-600">현장대응반</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-gray-600">구호반</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">6</div>
                    <div className="text-sm text-gray-600">경계유도반</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>대피 완료율</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 알림 수신 현황 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  알림 수신 현황
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {totalContacts > 0 ? (
                  <>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{confirmationRate.toFixed(0)}%</div>
                      <div className="text-sm text-gray-600">수신 확인률</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>확인 완료</span>
                        <span className="text-green-600">{confirmedCount}명</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>미확인</span>
                        <span className="text-red-600">{totalContacts - confirmedCount}명</span>
                      </div>
                      <Progress value={confirmationRate} className="h-2" />
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-3">부서별 확인 현황</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>발전팀</span>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span>8/8</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>안전팀</span>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span>6/6</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>환경화학팀</span>
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            <span>4/7</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>협력사</span>
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            <span>18/24</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">연락처 데이터가 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 빠른 액션 */}
            <Card>
              <CardHeader>
                <CardTitle>빠른 액션</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-transparent" variant="outline">
                  미확인자에게 재발송
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  상황 업데이트 발송
                </Button>
                <Link href="/evacuation-map" className="block">
                  <Button className="w-full bg-transparent" variant="outline">
                    대피장소 상세 지도
                  </Button>
                </Link>
                <Button className="w-full" variant="destructive">
                  경보 해제
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
