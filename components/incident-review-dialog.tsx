"use client"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Edit, RotateCcw, Send } from "lucide-react"
import type { Incident } from "@/lib/types"
import type { AuthorizedApprover } from "@/lib/authorized-approvers"

interface IncidentReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incident: Incident | null
  approver: AuthorizedApprover | null
  onApprove: (customMessage: string | null, isModified: boolean) => void
  isProcessing: boolean
}

export function IncidentReviewDialog({
  open,
  onOpenChange,
  incident,
  approver,
  onApprove,
  isProcessing,
}: IncidentReviewDialogProps) {
  const [alertMessage, setAlertMessage] = useState("")
  const [originalMessage, setOriginalMessage] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (incident && open) {
      const message = generateAlertMessage(incident)
      setOriginalMessage(message)
      setAlertMessage(message)
      setIsEditing(false)
    }
  }, [incident, open])

  const generateAlertMessage = (inc: Incident): string => {
    const now = new Date()
    const timestamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

    return `[GS동해전력 화학사고 경보]

▶ 경보단계: ${inc.alertLevel}
▶ 발령시각: ${timestamp}
▶ 사고위치: ${inc.location}
▶ 사고유형: ${inc.type}

[상황 요약]
${inc.description}

${
  inc.alarmCriteria
    ? `[경보 판정 기준]
• 사고범위: ${inc.alarmCriteria.scope}
• 자체조치: ${inc.alarmCriteria.selfResponse}
• 인명피해: ${inc.alarmCriteria.casualties}
• 주민대피: ${inc.alarmCriteria.evacuation}

`
    : ""
}※ 즉시 비상대응절차를 시행하시기 바랍니다.

문의: 안전팀장 033-820-1370
     주제어실 033-820-1141`
  }

  const handleReset = () => {
    setAlertMessage(originalMessage)
    setIsEditing(false)
  }

  const handleApprove = () => {
    const isModified = alertMessage !== originalMessage
    onApprove(isModified ? alertMessage : null, isModified)
  }

  const isModified = alertMessage !== originalMessage

  if (!incident || !approver) return null

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case "백색경보":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "청색경보":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "황색경보":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "적색경보":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            사고 내용 및 경보 메시지 검토
          </DialogTitle>
          <DialogDescription>
            사고 내용을 확인하고 경보 메시지를 검토하세요. 필요시 메시지를 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 승인자 정보 */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>승인자:</strong> {approver.name} ({approver.position})
            </p>
          </div>

          {/* 사고 정보 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              사고 정보
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">경보 단계</span>
                <Badge className={`${getAlertLevelColor(incident.alertLevel)} border-2`}>{incident.alertLevel}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">사고 위치</span>
                <span className="text-sm font-medium">{incident.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">사고 유형</span>
                <span className="text-sm font-medium">{incident.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">신고자</span>
                <span className="text-sm font-medium">{incident.reportedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">신고 시각</span>
                <span className="text-sm font-medium">{new Date(incident.reportedAt).toLocaleString("ko-KR")}</span>
              </div>
            </div>

            {incident.description && (
              <div>
                <Label className="text-sm font-medium text-gray-700">사고 상황</Label>
                <div className="mt-1 bg-gray-50 p-3 rounded border border-gray-200 text-sm">{incident.description}</div>
              </div>
            )}

            {incident.alarmCriteria && (
              <div>
                <Label className="text-sm font-medium text-gray-700">경보 판정 기준</Label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <div className="bg-amber-50 p-2 rounded border border-amber-200">
                    <p className="text-xs text-amber-700">사고 범위</p>
                    <p className="text-sm font-medium text-amber-900">{incident.alarmCriteria.scope}</p>
                  </div>
                  <div className="bg-amber-50 p-2 rounded border border-amber-200">
                    <p className="text-xs text-amber-700">자체조치 가능여부</p>
                    <p className="text-sm font-medium text-amber-900">{incident.alarmCriteria.selfResponse}</p>
                  </div>
                  <div className="bg-amber-50 p-2 rounded border border-amber-200">
                    <p className="text-xs text-amber-700">인명 피해여부</p>
                    <p className="text-sm font-medium text-amber-900">{incident.alarmCriteria.casualties}</p>
                  </div>
                  <div className="bg-amber-50 p-2 rounded border border-amber-200">
                    <p className="text-xs text-amber-700">주민 대피여부</p>
                    <p className="text-sm font-medium text-amber-900">{incident.alarmCriteria.evacuation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 경보 메시지 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Send className="h-4 w-4" />
                발송될 경보 메시지
              </h3>
              <div className="flex gap-2">
                {isModified && (
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                    <Edit className="h-3 w-3 mr-1" />
                    수정됨
                  </Badge>
                )}
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="bg-transparent">
                    <Edit className="h-4 w-4 mr-1" />
                    메시지 수정
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleReset} className="bg-transparent">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    원본으로 복원
                  </Button>
                )}
              </div>
            </div>

            {isEditing ? (
              <div>
                <Textarea
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                  placeholder="경보 메시지를 입력하세요..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  메시지를 수정하면 수정된 내용이 발송됩니다. 원본으로 복원하려면 '원본으로 복원' 버튼을 클릭하세요.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                <pre className="text-sm whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  {alertMessage}
                </pre>
              </div>
            )}
          </div>

          {/* 발송 대상 안내 */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>발송 대상:</strong> {incident.isLimitedTest ? "GS동해전력 5명 (제한 테스트)" : "전체 비상연락망"}
            </p>
            {incident.isLimitedTest && (
              <p className="text-xs text-yellow-700 mt-1">🧪 이 사고는 제한 테스트 모드로 설정되어 있습니다.</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="bg-transparent"
          >
            취소
          </Button>
          <Button onClick={handleApprove} disabled={isProcessing} className="bg-orange-600 hover:bg-orange-700">
            {isProcessing ? (
              "처리 중..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                승인 및 문자 발송
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
