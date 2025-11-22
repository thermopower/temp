"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wind, Thermometer, Droplets, Eye, RefreshCw, AlertCircle } from "lucide-react"
import { getDongHaeWeather, type WeatherData } from "@/lib/weather-service"

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadWeather = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const weatherData = await getDongHaeWeather()
      setWeather(weatherData)
      setLastUpdated(new Date())
    } catch (err) {
      setError("기상정보를 불러올 수 없습니다")
      console.error("Weather loading error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWeather()
    // 10분마다 자동 업데이트
    const interval = setInterval(loadWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Wind className="h-5 w-5 text-blue-600" />
            기상정보 (동해시)
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadWeather}
            disabled={isLoading}
            className="h-8 w-8 p-0 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-gray-500">마지막 업데이트: {lastUpdated.toLocaleTimeString("ko-KR")}</p>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : weather ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-sm font-medium">{weather.temperature}°C</div>
                <div className="text-xs text-gray-500">기온</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">{weather.windDirection}풍</div>
                <div className="text-xs text-gray-500">{weather.windSpeed}m/s</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              <div>
                <div className="text-sm font-medium">{weather.humidity}%</div>
                <div className="text-xs text-gray-500">습도</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">{weather.visibility}km</div>
                <div className="text-xs text-gray-500">가시거리</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            {isLoading ? "기상정보 로딩 중..." : "기상정보를 불러오는 중입니다"}
          </div>
        )}

        {weather && weather.precipitation > 0 && (
          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800 font-medium">
              ⚠️ 강수량: {weather.precipitation}mm - 대피 시 주의하세요
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
