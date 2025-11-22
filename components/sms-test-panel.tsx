"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Send, Users, CheckCircle, XCircle, Clock, ImageIcon } from "lucide-react"
import Image from "next/image"

export function SMSTestPanel() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const [location, setLocation] = useState("석탄 저장소")
  const [accidentType, setAccidentType] = useState("화학물질 누출")
  const [customMessage, setCustomMessage] = useState("")
  const [useCustomMessage, setUseCustomMessage] = useState(false)
  const [manualImagePath, setManualImagePath] = useState("") // Added manual image path selection
  const [chemicalType, setChemicalType] = useState<string>("")
  const [otherChemicalName, setOtherChemicalName] = useState("")

  const locations = [
    "석탄 저장소",
    "보일러 설비",
    "터빈 발전기",
    "냉각탑",
    "암모니아 저장 탱크",
    "변전소",
    "연료 공급 라인",
    "폐수 처리장",
    "수처리 및 폐수처리 건물",
    "복수탈염 약품저장 탱크",
    "탈황폐수처리 건물",
  ]

  const accidentTypes = [
    "화학물질 누출",
    "화재 발생",
    "폭발 사고",
    "전기 사고",
    "기계 고장",
    "환경 오염",
    "인명 사고",
    "기타 사고",
  ]

  const availableImages = [
    { path: "/images/plant-layout.png", name: "전체 배치도" },
    { path: "/images/ammonia-tank-layout.jpg", name: "암모니아 탱크" },
    { path: "/images/locations/location-1.jpg", name: "위치 1" },
    { path: "/images/locations/location-2.jpg", name: "위치 2" },
    { path: "/images/locations/location-3.jpg", name: "위치 3" },
    { path: "/images/locations/location-4.jpg", name: "위치 4" },
    { path: "/images/locations/location-5.jpg", name: "위치 5" },
  ]

  const requiresChemicalSelection =
    location === "수처리 및 폐수처리 건물" || location === "복수탈염 약품저장 탱크" || location === "탈황폐수처리 건물"

  const handleTestSMS = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] 테스트 문자 발송 요청 시작")

      const testData = {
        location: location || "터빈건물 1층",
        type: accidentType || "화학물질 누출",
        severity: "major",
        description: useCustomMessage
          ? customMessage
          : "M-TK-01B 암모니아 저장탱크 상부 배관 연결부 플랜지에서 누출 감지. 현장 작업자가 자극성 냄새 감지 후 즉시 신고. 누출량 약 5kg/hr 추정. 현재 탱크 압력 8.5 bar, 온도 -33°C 정상 범위 내 유지 중.",
        timestamp: new Date().toLocaleString("ko-KR"),
        includeImage: !!(manualImagePath && manualImagePath !== "none"),
        imagePath: manualImagePath !== "none" ? manualImagePath : undefined,
        chemicalType: chemicalType || undefined,
        otherChemicalName: chemicalType === "그 외 화학물질" ? otherChemicalName : undefined,
      }

      console.log("[v0] ===== 클라이언트에서 전송하는 데이터 =====")
      console.log("[v0] 전체 testData:", JSON.stringify(testData, null, 2))
      console.log("[v0] location:", testData.location)
      console.log("[v0] type:", testData.type)
      console.log("[v0] chemicalType:", testData.chemicalType)
      console.log("[v0] chemicalType 타입:", typeof testData.chemicalType)
      console.log("[v0] chemicalType 값:", chemicalType)
      console.log("[v0] chemicalType 원본 state:", chemicalType)
      console.log("[v0] requiresChemicalSelection:", requiresChemicalSelection)
      console.log("[v0] ==========================================")

      const response = await fetch("/api/send-sms-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      console.log("[v0] 테스트 문자 API 응답 상태:", response.status)

      const result = await response.json()
      setLastResult(result)

      console.log("[v0] 테스트 문자 API 응답:", result)
    } catch (error) {
      console.error("[v0] 테스트 SMS 오류:", error)
      setLastResult({
        success: false,
        error: "테스트 SMS 발송 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fillSampleData = () => {
    setLocation("암모니아 저장 탱크")
    setAccidentType("화학물질 누출")
    setManualImagePath("/images/ammonia-tank-layout.jpg") // Set manual image instead of automatic
    setUseCustomMessage(true)
    setCustomMessage(`[GS동해전력 비상상황 테스트]
🚨 적색경보 발령 (테스트)

📍 사고위치: 암모니아 저장 탱크
🔥 사고종류: 화학물질 누출
📝 상황: 암모니아 가스 누출로 인한 대피 필요 (테스트)
⏰ 발생시간: ${new Date().toLocaleString("ko-KR")}

📞 비상상황실: 033-820-1411
※ 이것은 시스템 테스트입니다.`)
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          환경화학팀 SMS/MMS 테스트
        </CardTitle>
        <CardDescription>
          지정된 2명의 환경화학팀 직원에게 실제 테스트 SMS/MMS를 발송합니다. 이미지 선택 시 MMS로 전송됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          대상: 환경화학팀 6명 + GS동해전력 14명 (총 20명)
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-2 block">사고 위치 (선택사항)</label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="사고 위치 선택" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">사고 유형 (선택사항)</label>
            <Select value={accidentType} onValueChange={setAccidentType}>
              <SelectTrigger>
                <SelectValue placeholder="사고 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                {accidentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {requiresChemicalSelection && (
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
            <h4 className="font-medium text-sm">관련 화학물질 선택</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="chemicalType"
                  value="염산(염화수소)"
                  checked={chemicalType === "염산(염화수소)"}
                  onChange={(e) => setChemicalType(e.target.value)}
                  className="rounded"
                />
                <span className="text-sm">염산(염화수소)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="chemicalType"
                  value="가성소다(수산화나트륨)"
                  checked={chemicalType === "가성소다(수산화나트륨)"}
                  onChange={(e) => setChemicalType(e.target.value)}
                  className="rounded"
                />
                <span className="text-sm">가성소다(수산화나트륨)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="chemicalType"
                  value="그 외 화학물질"
                  checked={chemicalType === "그 외 화학물질"}
                  onChange={(e) => setChemicalType(e.target.value)}
                  className="rounded"
                />
                <span className="text-sm">그 외 화학물질</span>
              </label>
              {chemicalType === "그 외 화학물질" && (
                <div className="ml-6 mt-2">
                  <input
                    type="text"
                    placeholder="화학물질명을 입력하세요"
                    value={otherChemicalName}
                    onChange={(e) => setOtherChemicalName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-2 block">첨부할 이미지 (선택사항)</label>
          <Select value={manualImagePath || "none"} onValueChange={setManualImagePath}>
            <SelectTrigger>
              <SelectValue placeholder="첨부할 이미지 선택 (MMS로 전송)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">이미지 없음 (SMS로 전송)</SelectItem>
              {availableImages.map((img) => (
                <SelectItem key={img.path} value={img.path}>
                  {img.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {manualImagePath && manualImagePath !== "none" && (
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              첨부될 이미지 (MMS로 전송)
            </label>
            <div className="relative aspect-video max-w-md rounded-lg overflow-hidden border">
              <Image src={manualImagePath || "/placeholder.svg"} alt="첨부될 이미지" fill className="object-cover" />
              <div className="absolute top-2 left-2">
                <Badge variant="secondary">자동 압축 (200KB 이하)</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              이미지는 MMS 전송을 위해 자동으로 200KB 이하로 압축됩니다.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useCustomMessage"
              checked={useCustomMessage}
              onChange={(e) => setUseCustomMessage(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="useCustomMessage" className="text-sm font-medium">
              사용자 정의 메시지 사용
            </label>
          </div>

          {useCustomMessage && (
            <div>
              <label className="text-sm font-medium mb-2 block">테스트 메시지 내용</label>
              <Textarea
                placeholder="테스트용 메시지를 입력하세요..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {customMessage.length} 글자 |{" "}
                {manualImagePath && manualImagePath !== "none" ? "MMS" : customMessage.length <= 90 ? "SMS" : "LMS"}로
                전송됩니다.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={fillSampleData} variant="outline" className="bg-transparent">
            샘플 데이터 입력
          </Button>
          <Button onClick={handleTestSMS} disabled={isLoading} className="flex-1 bg-transparent" variant="outline">
            {isLoading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                실제 {manualImagePath && manualImagePath !== "none" ? "MMS" : "SMS"} 발송 중...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                테스트 {manualImagePath && manualImagePath !== "none" ? "MMS" : "SMS"} 발송 (실제 발송)
              </>
            )}
          </Button>
        </div>

        {lastResult && (
          <div className="mt-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {lastResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">{lastResult.success ? "발송 완료" : "발송 실패"}</span>
            </div>

            {lastResult.success && lastResult.results && (
              <div className="space-y-2 text-sm">
                <div className="flex gap-4">
                  <Badge variant="outline" className="text-green-600">
                    성공: {lastResult.results.sent}건
                  </Badge>
                  {lastResult.results.failed > 0 && (
                    <Badge variant="outline" className="text-red-600">
                      실패: {lastResult.results.failed}건
                    </Badge>
                  )}
                  {lastResult.results.imageAttached && (
                    <Badge variant="outline" className="text-blue-600">
                      이미지 첨부됨
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  총 {lastResult.results.total}명 중 {lastResult.results.sent}명에게 실제{" "}
                  {manualImagePath && manualImagePath !== "none" ? "MMS" : "SMS"}가 발송되었습니다.
                </p>
              </div>
            )}

            {lastResult.error && <p className="text-sm text-red-600 mt-2">오류: {lastResult.error}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
