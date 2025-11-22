"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react"

interface Approver {
  name: string
  phone: string
  company: string
  position: string
}

interface VerificationResult {
  success: boolean
  approvers?: Approver[]
  totalEmployees?: number
  message: string
  error?: string
}

export default function VerifyApproversPage() {
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchApprovers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/verify-approvers")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "데이터를 가져오는 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApprovers()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">승인 권한자 검증</h1>
        <p className="text-muted-foreground">
          Google Sheets의 'GS동해전력 임직원 연락처'에서 승인 권한자 정보를 확인합니다.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>검증 결과</span>
            <Button onClick={fetchApprovers} disabled={loading} size="sm" variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              새로고침
            </Button>
          </CardTitle>
          <CardDescription>A열(직급), B열(이름), C열(전화번호) 데이터를 확인합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center py-8 text-muted-foreground">데이터를 불러오는 중...</p>}

          {!loading && result && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={result.success ? "text-green-600" : "text-red-600"}>{result.message}</span>
              </div>

              {result.success && result.approvers && (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    총 {result.totalEmployees}명 중 {result.approvers.length}명의 승인 권한자
                  </p>

                  <div className="space-y-3">
                    {result.approvers.map((approver, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-semibold">직급:</span> {approver.position}
                            </div>
                            <div>
                              <span className="font-semibold">이름:</span> {approver.name}
                            </div>
                            <div>
                              <span className="font-semibold">전화번호:</span> {approver.phone}
                            </div>
                            <div>
                              <span className="font-semibold">회사:</span> {approver.company}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {!result.success && result.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">오류: {result.error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>lib/authorized-approvers.ts 업데이트 방법</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>위의 검증 결과에서 실제 전화번호를 확인합니다.</li>
            <li>lib/authorized-approvers.ts 파일을 엽니다.</li>
            <li>각 승인 권한자의 전화번호를 실제 값으로 업데이트합니다.</li>
            <li>변경사항을 저장하고 시스템을 재시작합니다.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
