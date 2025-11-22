"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LOCATION_MAP } from "@/lib/location-mapping"

interface PlantLayoutViewerProps {
  selectedLocationId?: number
  onLocationSelect?: (locationId: number) => void
  showAccidentMarker?: boolean
}

export function PlantLayoutViewer({
  selectedLocationId,
  onLocationSelect,
  showAccidentMarker = false,
}: PlantLayoutViewerProps) {
  const [hoveredLocation, setHoveredLocation] = useState<number | null>(null)

  const handleLocationClick = (locationId: number) => {
    onLocationSelect?.(locationId)
  }

  return (
    <div className="space-y-6">
      {/* 배치도 캔버스 */}
      <Card>
        <CardHeader>
          <CardTitle>GS동해전력 발전소 배치도</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-[16/9] bg-gray-50 rounded-lg overflow-hidden border">
            {/* 배치도 이미지 */}
            <img
              src="/images/design-mode/image%281%29%281%29(1).png"
              alt="발전소 배치도"
              className="w-full h-full object-cover"
            />

            {/* 위치 핀들 */}
            {LOCATION_MAP.map((location) => (
              <div
                key={location.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${location.coordinates.x}%`,
                  top: `${location.coordinates.y}%`,
                }}
                onClick={() => handleLocationClick(location.id)}
                onMouseEnter={() => setHoveredLocation(location.id)}
                onMouseLeave={() => setHoveredLocation(null)}
              >
                {/* 핀 마커 */}
                <div
                  className={`
                  relative flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-sm
                  transition-all duration-200 transform hover:scale-110
                  ${
                    selectedLocationId === location.id
                      ? "bg-red-500 border-red-600 text-white shadow-lg"
                      : showAccidentMarker && selectedLocationId === location.id
                        ? "bg-red-500 border-red-600 text-white shadow-lg animate-pulse"
                        : "bg-blue-500 border-blue-600 text-white shadow-md hover:bg-blue-600"
                  }
                `}
                >
                  {["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"][location.id - 1]}
                </div>

                {/* 툴팁 */}
                {hoveredLocation === location.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg whitespace-nowrap z-10">
                    <div className="font-semibold">{location.name}</div>
                    <div className="text-xs opacity-80">{location.description}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 상세 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>시설 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {LOCATION_MAP.map((location) => (
              <div
                key={location.id}
                className={`
                  flex items-center justify-between p-4 rounded-lg border cursor-pointer
                  transition-all duration-200 hover:shadow-md
                  ${
                    selectedLocationId === location.id
                      ? "bg-red-50 border-red-200 shadow-sm"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }
                `}
                onClick={() => handleLocationClick(location.id)}
              >
                <div className="flex items-center gap-4">
                  <Badge
                    variant={selectedLocationId === location.id ? "destructive" : "secondary"}
                    className="text-lg font-bold min-w-[2rem] h-8 flex items-center justify-center"
                  >
                    {["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"][location.id - 1]}
                  </Badge>
                  <div>
                    <div className="font-semibold text-gray-900">{location.name}</div>
                    <div className="text-sm text-gray-600">{location.description}</div>
                  </div>
                </div>
                {selectedLocationId === location.id && showAccidentMarker && (
                  <Badge variant="destructive" className="animate-pulse">
                    사고 발생
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
