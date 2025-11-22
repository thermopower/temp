"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, MapPin, Phone, Send, CheckCircle } from "lucide-react"
import Link from "next/link"

type SMSType = "initial" | "role" | "update"

export default function SMSExamplePage() {
  const [selectedType, setSelectedType] = useState<SMSType>("initial")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const smsTemplates = {
    initial: {
      title: "초기 비상 알림",
      description: "사고 발생 즉시 전체 직원에게 발송",
      message: `[GS동해전력 비상상황]
🚨 황색경보 발령

📍 사고위치: 암모니아 저장탱크
🔥 사고종류: 화학물질 누출
📝 상황: 암모니아 저장탱크에서 누출 감지
⏰ 발생시간: 2024-11-22 18:00
👤 신고자: 김철수 (환경화학팀)

🌤️ 현재 기상: 남동풍 3m/s, 18°C

📍 추천 대피장소: 구사옥
🔄 대안: 종합사무동, 동해시청 별관

📞 비상상황실: 033-820-1411

📋 위치 배치도:
https://drive.google.com/file/d/11BKSbdRwUKNicRkIbvS0y6veMzgjYbU4/view

🔗 상세 대응 매뉴얼:
https://drive.google.com/file/d/1zISJlUUAkRfLjQpeOXDTBh_IYybu8XwG/view`
    },
    role: {
      title: "개인 역할/임무 SMS",
      description: "황색/적색 경보 시 3초 후 발송",
      message: `[GS동해전력 비상상황 - 개인 임무]
👤 홍길동님

🎯 귀하의 역할: 비상대응팀 현장지휘
📋 임무사항: 
- 현장 상황 파악 및 보고
- 대피 인원 확인
- 비상연락망 가동

🌤️ 기상정보: 남동풍 3m/s
📍 대피장소: 구사옥

📞 비상상황실: 033-820-1411`
    },
    update: {
      title: "상황 업데이트",
      description: "사고 진행 상황 업데이트",
      message: `[GS동해전력 비상상황 업데이트]
📢 상황 변경 알림

현재 상황이 안정화되었습니다.
- 누출 차단 완료
- 대피 인원 전원 안전 확인
- 현장 정리 진행 중

귀사 위치에서 대기하시기 바랍니다.

📞 비상상황실: 033-820-1411`
    }
  }

  const currentTemplate = smsTemplates[selectedType]

  const handleSendTest = async () => {
    setSending(true)
    setSent(false)

    try {
      // 직접 SMS API 호출
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '01072267170',
          message: currentTemplate.message
        })
      })

      const data = await response.json()

      if (data.success) {
        setSent(true)
        setTimeout(() => setSent(false), 5000)
      } else {
        alert('SMS 발송 실패: ' + (data.error || '알 수 없는 오류'))
      }
    } catch (error) {
      console.error('SMS 발송 오류:', error)
      alert('SMS 발송 중 오류가 발생했습니다.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📱 SMS 테스트</h1>
        <p className="text-muted-foreground">
          SMS 종류를 선택하고 메시지 내용을 확인한 후 테스트 발송할 수 있습니다.
        </p>
      </div>

      {/* SMS 종류 선택 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            SMS 종류 선택
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedType} onValueChange={(value) => setSelectedType(value as SMSType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="initial">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">긴급</Badge>
                  초기 비상 알림
                </div>
              </SelectItem>
              <SelectItem value="role">
                <div className="flex items-center gap-2">
                  <Badge variant="default">개인</Badge>
                  역할/임무 SMS
                </div>
              </SelectItem>
              <SelectItem value="update">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">업데이트</Badge>
                  상황 업데이트
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-2">
            {currentTemplate.description}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 메시지 미리보기 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {currentTemplate.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <pre className="text-sm whitespace-pre-wrap font-sans text-green-900">
                {currentTemplate.message}
              </pre>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleSendTest}
                disabled={sending || sent}
                className="w-full"
                variant={sent ? "outline" : "default"}
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    발송 중...
                  </>
                ) : sent ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    발송 완료!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    010-7226-7170으로 테스트 발송
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                테스트 번호로만 발송됩니다
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 휴대폰 미리보기 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              휴대폰 화면 미리보기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm mx-auto">
              {/* 휴대폰 프레임 */}
              <div className="bg-gray-900 rounded-3xl p-3 shadow-2xl">
                <div className="bg-white rounded-2xl p-4 min-h-[500px]">
                  {/* 상단바 */}
                  <div className="flex justify-between items-center mb-4 text-xs">
                    <span className="font-medium">메시지</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* 발신자 */}
                  <div className="mb-3">
                    <div className="font-medium text-sm">GS동해전력 비상알림</div>
                    <div className="text-xs text-gray-500">방금 전</div>
                  </div>

                  {/* 메시지 내용 */}
                  <div className="bg-green-50 rounded-2xl p-3">
                    <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                      {currentTemplate.message}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 추가 정보 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            SMS 발송 시스템 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">전송 방식</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 초기 비상알림: LMS (장문 SMS)</li>
                <li>• 위치 배치도: 링크 포함</li>
                <li>• 개별 임무: SMS (역할별 맞춤)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">전송 순서</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. 비상상황 알림 (즉시)</li>
                <li>2. 개별 역할/임무 (3초 후)</li>
                <li>3. 상황 업데이트 (필요 시)</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <Link href="/report">
              <Button variant="outline" className="w-full">
                <AlertTriangle className="h-4 w-4 mr-2" />
                실제 사고 신고하기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
