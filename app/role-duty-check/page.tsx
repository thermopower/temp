"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface EmployeeRoleData {
  name: string
  phone: string
  department: string
  position: string
  hasRole: boolean
  hasDuty: boolean
  role: string
  duty: string
}

interface ValidationResult {
  success: boolean
  summary: {
    totalEmployees: number
    withRoles: number
    withDuties: number
    withBoth: number
    withNeither: number
    completionRate: string
  }
  employeesWithoutRoleDuty: Array<{
    name: string
    department: string
    position: string
  }>
  detailedReport: EmployeeRoleData[]
  message: string
}

export default function RoleDutyCheckPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkRoleDutyData = async () => {
    setLoading(true)
    setError(null)
    console.log("[v0] 역할/임무 데이터 검증 시작")

    try {
      const response = await fetch("/api/contacts/validate-roles")
      const data = await response.json()

      if (data.success) {
        setResult(data)
        console.log("[v0] 역할/임무 검증 완료:", data.summary)
      } else {
        setError(data.error || "검증 실패")
      }
    } catch (err) {
      console.error("[v0] 역할/임무 검증 오류:", err)
      setError("데이터를 불러오는 중 오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">역할/임무 데이터 검증</h1>
        <p className="text-muted-foreground">Google Sheets D열(역할)과 E열(임무) 데이터를 검증합니다</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>데이터 검증 실행</CardTitle>
          <CardDescription>현재 Google Sheets에서 임직원의 역할과 임무 정보를 확인합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={checkRoleDutyData} disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                검증 중...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                역할/임무 데이터 검증
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              오류 발생
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">전체 임직원</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.summary.totalEmployees}명</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">역할+임무 완료</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{result.summary.withBoth}명</div>
                <p className="text-xs text-muted-foreground mt-1">완료율: {result.summary.completionRate}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">역할만 있음</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {result.summary.withRoles - result.summary.withBoth}명
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">역할/임무 없음</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{result.summary.withNeither}명</div>
              </CardContent>
            </Card>
          </div>

          {result.employeesWithoutRoleDuty.length > 0 && (
            <Card className="mb-6 border-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  역할/임무 정보가 없는 임직원
                </CardTitle>
                <CardDescription>다음 임직원은 Google Sheets D열과 E열에 역할/임무 정보가 없습니다</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.employeesWithoutRoleDuty.map((emp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {emp.department} - {emp.position}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        정보 없음
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>전체 임직원 역할/임무 현황</CardTitle>
              <CardDescription>각 임직원의 역할과 임무 정보 상세 내역</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.detailedReport.map((emp, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{emp.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {emp.department} - {emp.position}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{emp.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        {emp.hasRole ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            역할
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            <XCircle className="h-3 w-3 mr-1" />
                            역할
                          </Badge>
                        )}
                        {emp.hasDuty ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            임무
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            <XCircle className="h-3 w-3 mr-1" />
                            임무
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">역할 (D열)</p>
                        <p className="text-sm">{emp.role}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">임무 (E열)</p>
                        <p className="text-sm">{emp.duty}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
