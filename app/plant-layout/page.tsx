"use client"

import { useState } from "react"
import { PlantLayoutViewer } from "@/components/plant-layout-viewer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLocationById } from "@/lib/location-mapping"

export default function PlantLayoutPage() {
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>()
  const [showAccidentMode, setShowAccidentMode] = useState(false)

  const selectedLocation = selectedLocationId ? getLocationById(selectedLocationId) : undefined

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">발전소 배치도</h1>
          <p className="text-gray-600 mt-2">시설 위치를 확인하고 선택할 수 있습니다</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showAccidentMode ? "destructive" : "outline"}
            onClick={() => setShowAccidentMode(!showAccidentMode)}
          >
            {showAccidentMode ? "일반 모드" : "사고 모드"}
          </Button>
          {selectedLocationId && (
            <Button variant="outline" onClick={() => setSelectedLocationId(undefined)}>
              선택 해제
            </Button>
          )}
        </div>
      </div>

      {selectedLocation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">선택된 시설</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-blue-600">
                {["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"][selectedLocation.id - 1]}
              </div>
              <div>
                <div className="font-semibold text-lg">{selectedLocation.name}</div>
                <div className="text-gray-600">{selectedLocation.description}</div>
                <div className="text-sm text-gray-500 mt-1">
                  좌표: ({selectedLocation.coordinates.x}%, {selectedLocation.coordinates.y}%)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <PlantLayoutViewer
        selectedLocationId={selectedLocationId}
        onLocationSelect={setSelectedLocationId}
        showAccidentMarker={showAccidentMode}
      />
    </div>
  )
}
