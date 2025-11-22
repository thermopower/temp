"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Cloud, CloudRain, Wind, Droplets } from "lucide-react"
import { getDongHaeForecast, type ForecastData } from "@/lib/weather-service"

export function ForecastWidget() {
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const loadForecast = async () => {
    setLoading(true)
    const data = await getDongHaeForecast()
    if (data) {
      setForecast(data)
      setLastUpdate(new Date())
    }
    setLoading(false)
  }

  useEffect(() => {
    loadForecast()
    // 10분마다 자동 갱신
    const interval = setInterval(loadForecast, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !forecast) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            동해시 초단기예보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">로딩 중...</div>
        </CardContent>
      </Card>
    )
  }

  if (!forecast) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            동해시 초단기예보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            예보 데이터를 불러올 수 없습니다
            <Button onClick={loadForecast} size="sm" className="ml-2">
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            동해시 초단기예보
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={loadForecast} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 주요 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">기온</div>
            <div className="text-3xl font-bold">
              {forecast.temperature !== null ? `${forecast.temperature}°C` : "N/A"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">하늘상태</div>
            <div className="text-lg font-semibold flex items-center gap-2">
              {forecast.sky === "맑음" && <Cloud className="h-5 w-5 text-yellow-500" />}
              {forecast.sky === "흐림" && <Cloud className="h-5 w-5 text-gray-500" />}
              {forecast.sky === "구름많음" && <Cloud className="h-5 w-5 text-gray-400" />}
              {forecast.sky}
            </div>
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div className="text-sm">
              <span className="text-muted-foreground">습도</span>
              <span className="ml-2 font-semibold">{forecast.humidity !== null ? `${forecast.humidity}%` : "N/A"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-cyan-500" />
            <div className="text-sm">
              <span className="text-muted-foreground">풍속</span>
              <span className="ml-2 font-semibold">
                {forecast.windSpeed !== null ? `${forecast.windSpeed}m/s` : "N/A"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-blue-600" />
            <div className="text-sm">
              <span className="text-muted-foreground">강수</span>
              <span className="ml-2 font-semibold">{forecast.precipitationType}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-blue-600" />
            <div className="text-sm">
              <span className="text-muted-foreground">강수량</span>
              <span className="ml-2 font-semibold">{forecast.precipitation}mm</span>
            </div>
          </div>
        </div>

        {/* 업데이트 시간 */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          예보시각: {forecast.forecastTime} • 마지막 업데이트: {lastUpdate.toLocaleTimeString("ko-KR")}
        </div>
      </CardContent>
    </Card>
  )
}
