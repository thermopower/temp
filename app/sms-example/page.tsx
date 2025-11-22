"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, MapPin, Phone } from "lucide-react"
import Image from "next/image"

export default function SMSExamplePage() {
  const [showExample, setShowExample] = useState(false)

  const exampleSMSData = {
    location: "⑤ 암모니아 저장 탱크",
    accidentType: "화학물질 누출",
    severity: "심각",
    time: "2024-01-15 14:30",
    reporter: "김철수 (환경화학팀)",
    contact: "010-1234-5678",
    photoPath: "/images/locations/location-5.jpg",
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">SMS 전송 예시</h1>
        <p className="text-muted-foreground">
          암모니아 저장 탱크에서 사고 발생 시 전송되는 SMS 내용과 첨부 사진을 확인할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* SMS 미리보기 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              SMS 메시지 내용
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
              <div className="font-semibold text-blue-900 mb-2">🚨 GS동해전력 비상상황 발생</div>
              <div className="text-sm space-y-1 text-blue-800">
                <div>
                  <strong>위치:</strong> {exampleSMSData.location}
                </div>
                <div>
                  <strong>사고유형:</strong> {exampleSMSData.accidentType}
                </div>
                <div>
                  <strong>심각도:</strong>
                  <Badge variant="destructive" className="ml-2">
                    {exampleSMSData.severity}
                  </Badge>
                </div>
                <div>
                  <strong>발생시간:</strong> {exampleSMSData.time}
                </div>
                <div>
                  <strong>신고자:</strong> {exampleSMSData.reporter}
                </div>
                <div>
                  <strong>연락처:</strong> {exampleSMSData.contact}
                </div>
              </div>
              <div className="mt-3 text-xs text-blue-700">즉시 비상대응 절차에 따라 행동하시기 바랍니다.</div>
            </div>

            <Button onClick={() => setShowExample(!showExample)} className="w-full">
              {showExample ? "예시 숨기기" : "실제 SMS 예시 보기"}
            </Button>
          </CardContent>
        </Card>

        {/* 첨부 사진 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              첨부 사진 (MMS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden border">
                <Image
                  src={exampleSMSData.photoPath || "/placeholder.svg"}
                  alt="암모니아 저장 탱크 위치"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="destructive" className="bg-red-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    사고 위치
                  </Badge>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">위치 정보</span>
                </div>
                <ul className="space-y-1 ml-6">
                  <li>• 시설명: 암모니아 저장 탱크</li>
                  <li>• 위치번호: ⑤</li>
                  <li>• 용도: 탈질설비용 암모니아 저장시설</li>
                  <li>• 위험도: 높음 (화학물질)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 실제 SMS 예시 */}
      {showExample && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              실제 휴대폰 SMS 화면 예시
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm mx-auto">
              {/* 휴대폰 프레임 */}
              <div className="bg-black rounded-3xl p-2">
                <div className="bg-white rounded-2xl p-4 min-h-96">
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
                    <div className="text-xs text-gray-500">{exampleSMSData.time}</div>
                  </div>

                  {/* 메시지 내용 */}
                  <div className="bg-gray-100 rounded-2xl p-3 mb-3">
                    <div className="text-sm leading-relaxed">
                      🚨 <strong>비상상황 발생</strong>
                      <br />
                      위치: {exampleSMSData.location}
                      <br />
                      유형: {exampleSMSData.accidentType}
                      <br />
                      심각도: {exampleSMSData.severity}
                      <br />
                      시간: {exampleSMSData.time}
                      <br />
                      신고자: {exampleSMSData.reporter}
                      <br />
                      연락처: {exampleSMSData.contact}
                      <br />
                      <br />
                      즉시 비상대응 절차에 따라 행동하시기 바랍니다.
                    </div>
                  </div>

                  {/* 첨부 이미지 */}
                  <div className="bg-gray-100 rounded-2xl p-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={exampleSMSData.photoPath || "/placeholder.svg"}
                        alt="사고 위치 사진"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-1 left-1">
                        <div className="bg-red-600 text-white text-xs px-2 py-1 rounded">사고위치</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 px-1">📍 암모니아 저장 탱크 위치 사진</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 추가 정보 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            SMS 전송 시스템 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">전송 방식</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 초기 비상알림: SMS/LMS (텍스트)</li>
                <li>• 위치 사진: MMS (이미지 첨부)</li>
                <li>• 개별 임무: SMS (역할별 맞춤)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">전송 순서</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. 비상상황 알림 (즉시)</li>
                <li>2. 위치 사진 첨부 (3초 후)</li>
                <li>3. 개별 역할/임무 (5초 후)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
