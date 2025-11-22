"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Users, Phone, Building, RefreshCw, Archive, FileText, Lock } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Contact } from "@/lib/types"

const roleLabels = {
  employee: "GS동해전력", // 임직원을 GS동해전력으로 변경하여 협력사와 명확히 구분
  partner: "협력업체", // Changed from contractor to partner
  visitor: "방문자", // Changed from 임시출입자 to 방문자
}

const companyLabels = {
  오르비스: "오르비스",
  일진파워: "일진파워",
  한전산업개발: "한전산업개발",
  수산인더스트리: "수산인더스트리",
}

const roleColors = {
  employee: "bg-blue-100 text-blue-800",
  partner: "bg-green-100 text-green-800", // Changed from contractor to partner
  visitor: "bg-orange-100 text-orange-800",
}

type TabType = "all" | "employee" | "partner" | "visitor" | "management" // Added management tab type

export default function ContactsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const [contacts, setContacts] = useState<Contact[]>([])
  const [employees, setEmployees] = useState<Contact[]>([])
  const [partners, setPartners] = useState<Contact[]>([])
  const [visitors, setVisitors] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showConfig, setShowConfig] = useState(false)
  const [spreadsheetId, setSpreadsheetId] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)
  const [needsApiActivation, setNeedsApiActivation] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const isMobile = useIsMobile()

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)
    setAuthError(false)

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        setPassword("")
      } else {
        setAuthError(true)
        setPassword("")
      }
    } catch (error) {
      console.error("인증 오류:", error)
      setAuthError(true)
      setPassword("")
    } finally {
      setIsAuthenticating(false)
    }
  }

  useEffect(() => {
    const savedSpreadsheetId = localStorage.getItem("googleSheetId")
    if (savedSpreadsheetId) {
      setSpreadsheetId(savedSpreadsheetId)
    }
    if (isAuthenticated) {
      fetchContacts()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return

    // 10분 = 600,000 밀리초
    const AUTO_REFRESH_INTERVAL = 10 * 60 * 1000

    const intervalId = setInterval(() => {
      console.log("[v0] 명단 자동 업데이트 실행 (10분 주기)")
      fetchContacts()
    }, AUTO_REFRESH_INTERVAL)

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      clearInterval(intervalId)
      console.log("[v0] 명단 자동 업데이트 인터벌 정리됨")
    }
  }, [isAuthenticated])

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Contacts API response:", data.message)

        if (data.success && data.breakdown) {
          setEmployees(data.breakdown.employees || [])
          setPartners(data.breakdown.partners || [])
          setVisitors(data.breakdown.visitors || [])
          setContacts(data.contacts || [])
          setLastUpdated(new Date())
          setError(null)
        } else {
          setError(data.error || "연락처 데이터를 불러올 수 없습니다")
        }
      }
    } catch (error) {
      console.error("연락처 데이터 로드 실패:", error)
      setError("연락처 데이터를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const allContacts = [...employees, ...partners, ...visitors]

  const getFilteredContacts = () => {
    if (activeTab === "all") return allContacts
    if (activeTab === "employee") return employees
    if (activeTab === "partner") return partners
    if (activeTab === "visitor") return visitors
    return allContacts
  }

  const getTabCount = (tab: TabType) => {
    if (tab === "all") return allContacts.length
    if (tab === "employee") return employees.length
    if (tab === "partner") return partners.length
    if (tab === "visitor") return visitors.length
    return 0
  }

  const filteredContacts = getFilteredContacts()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로가기
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">명단 관리(관리자)</h1>
          </div>

          <div className="max-w-md mx-auto mt-12">
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-green-100 p-4 rounded-full mb-4">
                    <Lock className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">관리자 인증</h2>
                  <p className="text-sm text-gray-600 text-center">
                    명단 관리는 관리자만 접근할 수 있습니다.
                    <br />
                    비밀번호를 입력해주세요.
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="password"
                      placeholder="비밀번호 입력"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setAuthError(false)
                      }}
                      className={authError ? "border-red-500" : ""}
                      autoFocus
                      disabled={isAuthenticating}
                    />
                    {authError && <p className="text-sm text-red-600 mt-2">비밀번호가 올바르지 않습니다.</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={isAuthenticating}>
                    {isAuthenticating ? "확인 중..." : "확인"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading && contacts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로가기
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">명단 관리(관리자)</h1>
          </div>
          <Card className="text-center py-12">
            <CardContent>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">연락처 데이터를 불러오는 중...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로가기
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">명단 관리(관리자)</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-sm">
              총 {allContacts.length}명
            </Badge>
            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
              자동 업데이트 (10분)
            </Badge>
            <Button variant="outline" size="sm" onClick={() => fetchContacts()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-orange-800">Google Sheets 연동 상태</p>
                  <p className="text-sm text-orange-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>전체</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTabCount("all")}
              </Badge>
            </Button>

            <Button
              variant={activeTab === "employee" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("employee")}
              className="flex items-center space-x-2"
            >
              <Building className="h-4 w-4" />
              <span>GS동해전력</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTabCount("employee")}
              </Badge>
            </Button>

            <Button
              variant={activeTab === "partner" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("partner")}
              className="flex items-center space-x-2"
            >
              <Building className="h-4 w-4" />
              <span>협력업체</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTabCount("partner")}
              </Badge>
            </Button>

            <Button
              variant={activeTab === "visitor" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("visitor")}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>방문자</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTabCount("visitor")}
              </Badge>
            </Button>

            <Button
              variant={activeTab === "management" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("management")}
              className="flex items-center space-x-2"
            >
              <Archive className="h-4 w-4" />
              <span>명단 관리 방식</span>
            </Button>
          </div>
        </div>

        {activeTab === "management" ? (
          <div className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500 p-2 rounded-lg mr-3">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800">📋 명단 관리 방식</h3>
                </div>
                <div className="text-sm text-blue-700 leading-relaxed">
                  <p className="mb-2">각각 별도의 Google Sheets로 관리되며, 실시간으로 동기화됩니다.</p>
                  <p>사고 발생 시 활성 상태인 모든 인원에게 자동으로 알림이 발송됩니다.</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* GS동해전력 */}
              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Building className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-blue-800">GS동해전력</div>
                  <div className="text-sm text-blue-600">Google Sheets 관리</div>
                  <div className="text-lg font-bold text-blue-900">{employees.length}명</div>
                </div>
              </div>

              {/* 협력업체 */}
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                <Building className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-green-800">협력업체</div>
                  <div className="text-sm text-green-600">Google Sheets 관리</div>
                  <div className="text-lg font-bold text-green-900">{partners.length}명</div>
                </div>
              </div>

              {/* 방문자 */}
              <div className="flex items-center gap-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Users className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-orange-800">방문자</div>
                  <div className="text-sm text-orange-600">Google Sheets 관리</div>
                  <div className="text-lg font-bold text-orange-900">{visitors.length}명</div>
                </div>
              </div>
            </div>

            {/* 관리 상세 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-blue-100 p-1 rounded">
                      <Building className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-800">데이터 소스</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">GS동해전력:</span>
                      <span className="font-medium">Google Sheets A열(소속팀), B열(이름), C열(전화번호)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">협력업체:</span>
                      <span className="font-medium">
                        Google Sheets A열(회사명), B열(소속팀), D열(이름), E열(전화번호)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">방문자:</span>
                      <span className="font-medium">Google Sheets A열(이름), B열(전화번호), C열(소속)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-green-100 p-1 rounded">
                      <RefreshCw className="h-4 w-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-800">동기화 상태</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>실시간 Google Sheets 연동</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>자동 데이터 갱신</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>비상 알림 시스템 연결</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContacts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {activeTab === "all" ? "등록된 연락처가 없습니다." : `${roleLabels[activeTab]} 명단이 없습니다.`}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">Google Sheets에서 명단을 관리해주세요.</p>
                </CardContent>
              </Card>
            ) : (
              filteredContacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {isMobile ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg text-gray-900">{contact.name}</h3>
                          <Badge variant={contact.isActive ? "default" : "secondary"} className="text-xs">
                            {contact.isActive ? "활성" : "비활성"}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {contact.role === "partner" ? (
                            <div className="space-y-1">
                              <div className="text-green-600 text-sm font-medium">{contact.company}</div>
                              {contact.department && (
                                <div className="flex items-center text-gray-600 text-sm">
                                  <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span>{contact.department}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-600 text-sm">
                              <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="font-medium">
                                {contact.role === "employee"
                                  ? contact.department
                                  : contact.company || roleLabels[contact.role]}
                                {contact.role !== "employee" && contact.department && ` · ${contact.department}`}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center text-gray-600 text-sm">
                            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{contact.phone}</span>
                          </div>

                          {contact.role === "employee" && (
                            <div className="space-y-1 pt-2 border-t border-gray-200">
                              {contact.emergencyRoleDescription || contact.emergencyDuty ? (
                                <>
                                  {contact.emergencyRoleDescription && (
                                    <div className="flex items-start text-sm">
                                      <span className="font-medium text-blue-600 mr-2">역할:</span>
                                      <span className="text-gray-700">{contact.emergencyRoleDescription}</span>
                                    </div>
                                  )}
                                  {contact.emergencyDuty && (
                                    <div className="flex items-start text-sm">
                                      <span className="font-medium text-blue-600 mr-2">임무:</span>
                                      <span className="text-gray-700">{contact.emergencyDuty}</span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                  <span>⚠️ 역할/임무 미지정</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <Badge className={roleColors[contact.role]}>
                            {roleLabels[contact.role]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Google Sheets
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-lg">{contact.name}</h3>
                                <Badge className={roleColors[contact.role]}>{roleLabels[contact.role]}</Badge>
                                <Badge variant="outline" className="text-xs">
                                  Google Sheets
                                </Badge>
                              </div>

                              <div className="flex items-center text-gray-600 text-sm space-x-4">
                                {contact.role === "partner" ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="text-green-600 font-medium">{contact.company}</div>
                                    {contact.department && (
                                      <div className="flex items-center">
                                        <Building className="h-4 w-4 mr-1" />
                                        {contact.department}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  (contact.department || contact.company) && (
                                    <div className="flex items-center">
                                      <Building className="h-4 w-4 mr-1" />
                                      {contact.role === "employee"
                                        ? contact.department
                                        : contact.company || roleLabels[contact.role]}
                                      {contact.role !== "employee" && contact.department && ` · ${contact.department}`}
                                    </div>
                                  )
                                )}

                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {contact.phone}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge variant={contact.isActive ? "default" : "secondary"} className="text-xs">
                              {contact.isActive ? "활성" : "비활성"}
                            </Badge>
                          </div>
                        </div>

                        {contact.role === "employee" && (
                          <div className="pl-4 border-l-2 border-blue-200 ml-2">
                            {contact.emergencyRoleDescription || contact.emergencyDuty ? (
                              <div className="flex items-center space-x-6 text-sm">
                                {contact.emergencyRoleDescription && (
                                  <div className="flex items-center">
                                    <span className="font-medium text-blue-600 mr-2">역할:</span>
                                    <span className="text-gray-700">{contact.emergencyRoleDescription}</span>
                                  </div>
                                )}
                                {contact.emergencyDuty && (
                                  <div className="flex items-center">
                                    <span className="font-medium text-blue-600 mr-2">임무:</span>
                                    <span className="text-gray-700">{contact.emergencyDuty}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded inline-flex">
                                <span>⚠️ 역할/임무 미지정 - Google Sheets D열(역할), E열(임무)을 확인해주세요</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab !== "management" && (
          <div className="mt-6 space-y-3">
            {activeTab === "employee" && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>📋 GS동해전력 임직원 역할/임무 관리:</strong> 모든 임직원은 Google Sheets의 D열(역할)과
                  E열(임무)에 비상 대응 역할과 임무가 지정되어야 합니다. 역할/임무가 없는 임직원은 주황색 경고로
                  표시됩니다.
                </p>
              </div>
            )}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>안내:</strong> 모든 명단은 Google Sheets에서 관리됩니다. GS동해전력 {employees.length}명,
                협력업체 {partners.length}명, 방문자 {visitors.length}명이 등록되어 있으며, 사고 발생 시 활성 상태인
                모든 인원에게 자동으로 알림이 발송됩니다.
              </p>
            </div>
          </div>
        )}

        {lastUpdated && (
          <div className="mt-4 text-center text-sm text-gray-500">
            마지막 업데이트: {lastUpdated.toLocaleString()}
            <span className="ml-2 text-green-600">· 10분마다 자동 업데이트</span>
          </div>
        )}
      </div>
    </div>
  )
}
