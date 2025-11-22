"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, Clock, CheckCircle, AlertCircle, Phone, RefreshCw } from "lucide-react"

interface Contact {
  name: string
  phone: string
  department: string
}

interface SMSStatus {
  contact: string
  name: string
  department: string
  status: "sent" | "pending" | "failed"
  timestamp: string
}

export default function SMSStatusPage() {
  const [environmentalChemTeam, setEnvironmentalChemTeam] = useState<Contact[]>([])
  const [smsHistory, setSmsHistory] = useState<SMSStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>("")

  const fetchEnvironmentalChemTeam = async () => {
    try {
      setLoading(true)
      console.log("[v0] 환경화학팀 연락처 조회 시작")
      const response = await fetch("/api/contacts")
      const data = await response.json()

      console.log("[v0] API 응답 데이터:", data)

      if (data.success && data.breakdown && data.breakdown.employees) {
        const envChemTeam = data.breakdown.employees.filter(
          (contact: any) =>
            contact.department &&
            (contact.department.includes("환경화학") ||
              contact.department.includes("환경") ||
              contact.department.includes("화학")),
        )

        console.log("[v0] 필터링된 환경화학팀:", envChemTeam)
        setEnvironmentalChemTeam(envChemTeam)
        setLastUpdate(new Date().toLocaleString("ko-KR"))
      } else {
        console.log("[v0] API 응답에 직원 데이터가 없음, 빈 배열로 설정")
        setEnvironmentalChemTeam([])
      }
    } catch (error) {
      console.error("[v0] 환경화학팀 연락처 조회 실패:", error)
      setEnvironmentalChemTeam([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnvironmentalChemTeam()
  }, [])

  const handleRefresh = () => {
    fetchEnvironmentalChemTeam()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "failed":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">환경화학팀 문자 발송 현황</h1>
          <p className="text-gray-600 mt-2">GS동해전력 환경화학팀 비상연락망 및 SMS 발송 상태</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {/* 환경화학팀 현황 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">환경화학팀 인원</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{environmentalChemTeam.length}명</div>
            <p className="text-xs text-muted-foreground">비상연락망 등록 인원</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최근 발송</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smsHistory.length}건</div>
            <p className="text-xs text-muted-foreground">{smsHistory.length > 0 ? "발송 완료" : "발송 기록 없음"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">마지막 업데이트</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{lastUpdate || "업데이트 중..."}</div>
            <p className="text-xs text-muted-foreground">연락처 정보 갱신 시간</p>
          </CardContent>
        </Card>
      </div>

      {/* 환경화학팀 연락처 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            환경화학팀 연락처
          </CardTitle>
          <CardDescription>비상상황 시 문자 발송 대상자 목록</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">연락처 정보를 불러오는 중...</span>
            </div>
          ) : environmentalChemTeam.length > 0 ? (
            <div className="space-y-3">
              {environmentalChemTeam.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.department}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-gray-900">{contact.phone}</div>
                    <Badge variant="outline" className="text-xs">
                      SMS 발송 대상
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">환경화학팀 연락처 없음</h3>
              <p className="text-gray-600">
                현재 등록된 환경화학팀 연락처가 없습니다.
                <br />
                명단 관리에서 연락처를 확인해주세요.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMS 발송 기록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS 발송 기록
          </CardTitle>
          <CardDescription>환경화학팀 대상 문자 발송 이력</CardDescription>
        </CardHeader>
        <CardContent>
          {smsHistory.length > 0 ? (
            <div className="space-y-3">
              {smsHistory.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{record.name}</div>
                      <div className="text-sm text-gray-600">{record.department}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-gray-900">{record.contact}</div>
                    <div className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleString("ko-KR")}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">발송 기록 없음</h3>
              <p className="text-gray-600">
                아직 환경화학팀으로 발송된 SMS 기록이 없습니다.
                <br />
                테스트 발송을 통해 시스템을 확인해보세요.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
