"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Settings, RefreshCw } from "lucide-react"
import { extractSpreadsheetId, testSheetConnection } from "@/lib/google-sheets"

interface GoogleSheetsConfigProps {
  onConfigUpdate: (spreadsheetId: string) => void
  currentSpreadsheetId?: string
}

export function GoogleSheetsConfig({ onConfigUpdate, currentSpreadsheetId }: GoogleSheetsConfigProps) {
  const [sheetUrl, setSheetUrl] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleConnect = async () => {
    if (!sheetUrl.trim()) {
      setErrorMessage("구글시트 URL을 입력해주세요.")
      setConnectionStatus("error")
      return
    }

    const spreadsheetId = extractSpreadsheetId(sheetUrl)
    if (!spreadsheetId) {
      setErrorMessage("올바른 구글시트 URL이 아닙니다.")
      setConnectionStatus("error")
      return
    }

    setIsConnecting(true)
    setErrorMessage("")

    try {
      console.log("구글시트 연결 테스트 중...", spreadsheetId)

      const isConnected = await testSheetConnection(spreadsheetId)

      if (isConnected) {
        setConnectionStatus("success")
        onConfigUpdate(spreadsheetId)

        // 로컬 스토리지에 저장
        localStorage.setItem("googleSheetId", spreadsheetId)
        localStorage.setItem("googleSheetUrl", sheetUrl)
      } else {
        setConnectionStatus("error")
        setErrorMessage("시트에 연결할 수 없습니다. URL과 권한을 확인해주세요.")
      }
    } catch (error) {
      console.error("연결 테스트 실패:", error)
      setConnectionStatus("error")
      setErrorMessage("연결 중 오류가 발생했습니다.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setSheetUrl("")
    setConnectionStatus("idle")
    setErrorMessage("")
    localStorage.removeItem("googleSheetId")
    localStorage.removeItem("googleSheetUrl")
    onConfigUpdate("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          구글시트 연결 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 연결 상태 */}
        {currentSpreadsheetId && (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm text-green-800">구글시트가 연결되었습니다</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              연결됨
            </Badge>
          </div>
        )}

        {/* URL 입력 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">구글시트 URL</label>
          <Input
            type="url"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            disabled={isConnecting}
          />
          <p className="text-xs text-gray-600">임시출입자 명단이 있는 구글시트의 공유 링���를 입력하세요.</p>
        </div>

        {/* 오류 메시지 */}
        {connectionStatus === "error" && errorMessage && (
          <div className="flex items-center p-3 bg-red-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">{errorMessage}</span>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex space-x-2">
          <Button onClick={handleConnect} disabled={isConnecting || !sheetUrl.trim()} className="flex-1">
            {isConnecting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                연결 중...
              </>
            ) : (
              "연결하기"
            )}
          </Button>

          {currentSpreadsheetId && (
            <Button variant="outline" onClick={handleDisconnect}>
              연결 해제
            </Button>
          )}
        </div>

        {/* 안내 사항 */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>설정 방법:</strong>
            <br />
            1. 구글시트를 '링크가 있는 모든 사용자' 권한으로 공유
            <br />
            2. 첫 번째 행에 헤더(이름, 전화번호, 회사, 방문목적, 상태) 입력
            <br />
            3. 상태 열에 '입장' 또는 '퇴장'으로 현재 상태 표시
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
