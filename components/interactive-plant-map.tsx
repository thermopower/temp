"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, AlertTriangle, Info, Zap, Droplets, Factory, Building2 } from "lucide-react"
import { LOCATION_MAP } from "@/lib/location-mapping"

interface AccidentLocation {
  id: string
  name: string
  x: number // percentage
  y: number // percentage
  type: "chemical" | "fire" | "electrical" | "mechanical"
  description: string
  riskLevel: "low" | "medium" | "high"
  locationNumber?: number // Added location number mapping
}

interface InteractivePlantMapProps {
  selectedLocation?: string
  onLocationSelect?: (location: AccidentLocation) => void
  showAccidentMarker?: boolean
  accidentLocation?: string
}

const facilityLocations: AccidentLocation[] = [
  {
    id: "turbine-building-1",
    name: "1호기 터빈건물",
    x: 25,
    y: 45,
    type: "mechanical",
    description: "1호기 터빈 발전기 설비",
    riskLevel: "high",
    locationNumber: 1,
  },
  {
    id: "turbine-building-2",
    name: "2호기 터빈건물",
    x: 45,
    y: 45,
    type: "mechanical",
    description: "2호기 터빈 발전기 설비",
    riskLevel: "high",
    locationNumber: 2,
  },
  {
    id: "boiler-building-1",
    name: "1호기 보일러 건물",
    x: 25,
    y: 65,
    type: "fire",
    description: "1호기 보일러 및 연소설비",
    riskLevel: "high",
    locationNumber: 3,
  },
  {
    id: "boiler-building-2",
    name: "2호기 보일러 건물",
    x: 45,
    y: 65,
    type: "fire",
    description: "2호기 보일러 및 연소설비",
    riskLevel: "high",
    locationNumber: 4,
  },
  {
    id: "ammonia-storage",
    name: "암모니아 저장 탱크",
    x: 70,
    y: 55,
    type: "chemical",
    description: "탈질설비용 암모니아 저장시설",
    riskLevel: "high",
    locationNumber: 5,
  },
  {
    id: "chemical-storage",
    name: "복수탈염 약품저장 탱크",
    x: 15,
    y: 75,
    type: "chemical",
    description: "복수탈염용 화학약품 저장시설",
    riskLevel: "medium",
    locationNumber: 6,
  },
  {
    id: "fuel-oil-tank",
    name: "부생연료유 저장 탱크",
    x: 10,
    y: 85,
    type: "fire",
    description: "보조연료용 부생연료유 저장시설",
    riskLevel: "high",
    locationNumber: 7,
  },
  {
    id: "fgd-wastewater",
    name: "탈황폐수처리 건물",
    x: 20,
    y: 90,
    type: "chemical",
    description: "탈황설비 폐수처리시설",
    riskLevel: "medium",
    locationNumber: 8,
  },
  {
    id: "power-wastewater",
    name: "수처리 및 발전폐수처리 건물",
    x: 35,
    y: 90,
    type: "chemical",
    description: "발전소 폐수처리시설",
    riskLevel: "medium",
    locationNumber: 9,
  },
]

const getLocationIcon = (type: AccidentLocation["type"]) => {
  switch (type) {
    case "chemical":
      return <Droplets className="h-4 w-4" />
    case "fire":
      return <AlertTriangle className="h-4 w-4" />
    case "electrical":
      return <Zap className="h-4 w-4" />
    case "mechanical":
      return <Factory className="h-4 w-4" />
    default:
      return <Building2 className="h-4 w-4" />
  }
}

const getRiskColor = (riskLevel: AccidentLocation["riskLevel"]) => {
  switch (riskLevel) {
    case "high":
      return "bg-red-500 border-red-600"
    case "medium":
      return "bg-yellow-500 border-yellow-600"
    case "low":
      return "bg-green-500 border-green-600"
    default:
      return "bg-gray-500 border-gray-600"
  }
}

const getTypeColor = (type: AccidentLocation["type"]) => {
  switch (type) {
    case "chemical":
      return "text-purple-600 bg-purple-100"
    case "fire":
      return "text-red-600 bg-red-100"
    case "electrical":
      return "text-blue-600 bg-blue-100"
    case "mechanical":
      return "text-gray-600 bg-gray-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

export default function InteractivePlantMap({
  selectedLocation,
  onLocationSelect,
  showAccidentMarker = false,
  accidentLocation,
}: InteractivePlantMapProps) {
  const [hoveredLocation, setHoveredLocation] = useState<AccidentLocation | null>(null)
  const [showAllMarkers, setShowAllMarkers] = useState(false)

  const accidentFacility = accidentLocation
    ? facilityLocations.find((loc) => {
        // Check if location string contains numbered format (①, ②, etc.)
        const numberMatch = accidentLocation.match(/[①②③④⑤⑥⑦⑧⑨](\d+)/)
        if (numberMatch) {
          const locationNumber = Number.parseInt(numberMatch[1])
          return loc.locationNumber === locationNumber
        }
        // Fallback to name matching
        return (
          loc.name.includes(accidentLocation) ||
          accidentLocation.includes(loc.name) ||
          loc.description.includes(accidentLocation)
        )
      })
    : null

  const isAmmoniaAccident =
    accidentLocation && (accidentLocation.includes("암모니아") || accidentLocation.includes("ammonia"))

  return (
    <div className="space-y-4">
      {/* 컨트롤 패널 */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={showAllMarkers ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAllMarkers(!showAllMarkers)}
          >
            <MapPin className="h-4 w-4 mr-1" />
            {showAllMarkers ? "마커 숨기기" : "전체 시설 보기"}
          </Button>
        </div>

        {/* 범례 */}
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>고위험</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>중위험</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>저위험</span>
          </div>
        </div>
      </div>

      {isAmmoniaAccident && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              암모니아 저장탱크 상세 배치도
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full bg-white rounded-lg overflow-hidden border-2 border-red-200">
              <Image
                src="/images/ammonia-tank-layout.jpg"
                alt="암모니아 저장탱크 상세 배치도"
                width={1200}
                height={800}
                className="w-full h-auto"
                priority
              />

              {/* 사고 위치 마커 */}
              <div
                className="absolute w-10 h-10 bg-red-600 border-4 border-white rounded-full shadow-lg animate-pulse z-20 flex items-center justify-center"
                style={{
                  left: "70%",
                  top: "32%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <AlertTriangle className="h-5 w-5 text-white" />
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1 rounded whitespace-nowrap font-medium">
                  🚨 암모니아 저장탱크 사고 발생
                </div>
              </div>

              {/* 대피 방향 안내 */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-sm">
                <div className="flex items-center text-sm font-medium text-red-800 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  암모니아 누출 시 대피 안내
                </div>
                <div className="text-xs text-gray-700 space-y-2">
                  <div className="font-medium text-red-700">⚠️ 즉시 대피 필요</div>
                  <div>• 바람의 반대 방향으로 대피</div>
                  <div>• 젖은 수건으로 코와 입 보호</div>
                  <div>• 1차 대피: 구사옥 (300m)</div>
                  <div>• 2차 대피: 동해시청 별관 (2.5km)</div>
                  <div className="text-red-600 font-medium">• 암모니아는 공기보다 가벼워 위로 확산</div>
                </div>
              </div>

              {/* 위험 범위 표시 */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                <div className="text-sm font-medium text-red-800 mb-2">위험 범위</div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-700">즉시 위험 (100m)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-700">주의 필요 (300m)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-700">모니터링 (500m)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <div className="font-medium mb-1">암모니아 특성 및 주의사항</div>
                  <ul className="text-xs space-y-1">
                    <li>• 무색의 자극적인 냄새가 나는 기체</li>
                    <li>• 공기보다 가벼워 위쪽으로 확산</li>
                    <li>• 눈, 코, 목에 심한 자극을 줌</li>
                    <li>• 고농도 노출 시 호흡곤란 및 화상 위험</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 지도 컨테이너 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            GS동해전력 발전소 번호별 배치도
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full bg-gray-50 rounded-lg overflow-hidden">
            <Image
              src="/images/plant-layout-numbered.png"
              alt="GS동해전력 발전소 번호별 배치도"
              width={1200}
              height={800}
              className="w-full h-auto"
              priority
            />

            {/* 시설 마커들 */}
            {(showAllMarkers || accidentFacility) &&
              facilityLocations.map((location) => {
                const isAccidentSite = accidentFacility?.id === location.id
                const shouldShow = showAllMarkers || isAccidentSite

                if (!shouldShow) return null

                return (
                  <div
                    key={location.id}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110 ${
                      isAccidentSite ? "z-20" : "z-10"
                    }`}
                    style={{
                      left: `${location.x}%`,
                      top: `${location.y}%`,
                    }}
                    onMouseEnter={() => setHoveredLocation(location)}
                    onMouseLeave={() => setHoveredLocation(null)}
                    onClick={() => onLocationSelect?.(location)}
                  >
                    <div
                      className={`
                    w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center text-white text-xs font-bold
                    ${
                      isAccidentSite
                        ? "bg-red-600 border-red-700 animate-pulse shadow-red-500/50"
                        : getRiskColor(location.riskLevel)
                    }
                  `}
                    >
                      {isAccidentSite ? <AlertTriangle className="h-4 w-4" /> : <span>{location.locationNumber}</span>}
                    </div>

                    {/* 호버 툴팁 */}
                    {hoveredLocation?.id === location.id && (
                      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-48 z-30">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            {["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"][location.locationNumber! - 1]}
                          </Badge>
                          <Badge className={getTypeColor(location.type)}>
                            {location.type === "chemical" && "화학"}
                            {location.type === "fire" && "화재"}
                            {location.type === "electrical" && "전기"}
                            {location.type === "mechanical" && "기계"}
                          </Badge>
                          <Badge
                            variant={
                              location.riskLevel === "high"
                                ? "destructive"
                                : location.riskLevel === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {location.riskLevel === "high" && "고위험"}
                            {location.riskLevel === "medium" && "중위험"}
                            {location.riskLevel === "low" && "저위험"}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{location.name}</h4>
                        <p className="text-sm text-gray-600">{location.description}</p>
                        {isAccidentSite && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700 font-medium">
                            🚨 사고 발생 지점
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

            {/* 사고 위치 특별 표시 (기존 방식과 호환) */}
            {showAccidentMarker && accidentLocation && !accidentFacility && (
              <div
                className="absolute w-8 h-8 bg-red-500 border-4 border-white rounded-full shadow-lg animate-pulse z-20"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  사고 발생 지점
                </div>
              </div>
            )}

            {/* 대피 방향 표시 */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg max-w-xs">
              <div className="flex items-center text-sm font-medium text-gray-900 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                대피 안내
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                {accidentLocation && <div>• 사고 지점: {accidentLocation}</div>}
                <div>• 1차 대피: 구사옥 (황색경보)</div>
                <div>• 2차 대피: 동해시청 별관 (적색경보)</div>
                <div>• 대피 시 바람 방향 확인 필수</div>
              </div>
            </div>

            {/* 시설 분류 범례 */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg">
              <div className="text-sm font-medium text-gray-900 mb-2">위치 번호</div>
              <div className="space-y-1 text-xs">
                {LOCATION_MAP.map((location) => (
                  <div key={location.id} className="flex items-center gap-2">
                    <span className="font-mono w-6 text-center">
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

      {/* 선택된 위치 정보 */}
      {hoveredLocation && (
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getTypeColor(hoveredLocation.type)}`}>
                {getLocationIcon(hoveredLocation.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{hoveredLocation.name}</h3>
                  <Badge
                    variant={
                      hoveredLocation.riskLevel === "high"
                        ? "destructive"
                        : hoveredLocation.riskLevel === "medium"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {hoveredLocation.riskLevel === "high" && "고위험"}
                    {hoveredLocation.riskLevel === "medium" && "중위험"}
                    {hoveredLocation.riskLevel === "low" && "저위험"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{hoveredLocation.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Info className="h-3 w-3" />
                  <span>클릭하여 상세 정보 확인</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
