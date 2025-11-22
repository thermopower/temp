"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageIcon, Send, Loader2, CheckCircle, XCircle } from "lucide-react"
import { sendSMS } from "@/lib/sms"
import { getAccidentImagePath } from "@/lib/image-utils"
import Image from "next/image"

export default function MMSTestPanel() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [location, setLocation] = useState("")
  const [accidentType, setAccidentType] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const locations = [
    "석탄 저장소",
    "보일러 설비",
    "터빈 발전기",
    "냉각탑",
    "암모니아 저장 탱크",
    "변전소",
    "연료 공급 라인",
    "폐수 처리장",
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

  const selectedImagePath = location && accidentType ? getAccidentImagePath(location, accidentType) : null

  const handleSendMMS = async () => {
    if (!phoneNumber || !message) {
      setResult({
        success: false,
        error: "전화번호와 메시지를 입력해주세요.",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await sendSMS({
        to: phoneNumber,
        message,
      })

      setResult(response)
    } catch (error) {
      setResult({
        success: false,
        error: "MMS 발송 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fillSampleData = () => {
    setPhoneNumber("01012345678")
    setLocation("암모니아 저장 탱크")
    setAccidentType("화학물질 누출")
    setMessage(`[GS동해전력 비상상황]
🚨 적색경보 발령

📍 사고위치: 암모니아 저장 탱크
🔥 사고종류: 화학물질 누출
📝 상황: 암모니아 가스 누출로 인한 대피 필요
⏰ 발생시간: ${new Date().toLocaleString("ko-KR")}

📸 사고장소 사진이 첨부되었습니다.`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            MMS 발송 테스트
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">전화번호</label>
              <Input placeholder="01012345678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
            <div>
              <Button variant="outline" onClick={fillSampleData} className="mt-6 bg-transparent">
                샘플 데이터 입력
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">사고 위치</label>
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
              <label className="text-sm font-medium mb-2 block">사고 유형</label>
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

          {selectedImagePath && (
            <div>
              <label className="text-sm font-medium mb-2 block">첨부될 이미지</label>
              <div className="relative aspect-video max-w-md rounded-lg overflow-hidden border">
                <Image
                  src={selectedImagePath || "/placeholder.svg"}
                  alt="첨부될 이미지"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">자동 압축 (200KB 이하)</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                이미지는 MMS 전송을 위해 자동으로 200KB 이하로 압축됩니다.
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">메시지 내용</label>
            <Textarea
              placeholder="MMS로 전송할 메시지를 입력하세요..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length} 글자 | {location && accidentType ? "MMS" : message.length <= 90 ? "SMS" : "LMS"}로
              전송됩니다.
            </p>
          </div>

          <Button onClick={handleSendMMS} disabled={isLoading || !phoneNumber || !message} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                MMS 발송 중...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                MMS 발송
              </>
            )}
          </Button>

          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                  {result.success ? (
                    <div>
                      <div className="font-medium">MMS 발송 성공!</div>
                      <div className="text-sm mt-1">
                        메시지 ID: {result.data?.messageId}
                        <br />
                        타입: {result.data?.type}
                        <br />
                        {result.data?.imageId && `이미지 ID: ${result.data.imageId}`}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium">MMS 발송 실패</div>
                      <div className="text-sm mt-1">{result.error}</div>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>MMS 발송 시스템 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">이미지 처리</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 솔라피 스토리지 API 사용</li>
                <li>• 자동 이미지 압축 (200KB 이하)</li>
                <li>• 최적 해상도 조정 (640x480)</li>
                <li>• JPEG 품질 자동 조정</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">메시지 타입</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• SMS: 90바이트 이하</li>
                <li>• LMS: 90바이트 초과, 이미지 없음</li>
                <li>• MMS: 이미지 첨부 시 자동 선택</li>
                <li>• 사고 위치별 이미지 자동 매핑</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
