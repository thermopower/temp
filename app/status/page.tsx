"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Clock,
  MapPin,
  AlertTriangle,
  Shield,
  CheckCircle,
  CheckCircle2,
  Send,
  Edit,
  ImageIcon,
  Trash2,
} from "lucide-react"
import Image from "next/image"
import type { Incident } from "@/lib/types"
import { getLocationByName } from "@/lib/location-mapping"
import { ApproverAuthDialog } from "@/components/approver-auth-dialog"
import { IncidentEditDialog } from "@/components/incident-edit-dialog"
import { AlertCriteriaDialog } from "@/components/alert-criteria-dialog"
import type { AuthorizedApprover } from "@/lib/authorized-approvers"
import { AUTHORIZED_APPROVERS } from "@/lib/authorized-approvers"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type AlertLevel = "white" | "blue" | "yellow" | "red"

interface CriteriaItem {
  id: string
  category: string
  white: string
  blue: string
  yellow: string
  red: string
}

const criteriaData: CriteriaItem[] = [
  {
    id: "scope",
    category: "사고 범위",
    white: "방류벽 내부",
    blue: "방류벽 외부",
    yellow: "사업장 외부",
    red: "사업장 외부",
  },
  {
    id: "self-response",
    category: "자체조치",
    white: "가능(밸브 등)",
    blue: "가능(소화수, 소석회 등)",
    yellow: "불가능",
    red: "불가능",
  },
  {
    id: "casualties",
    category: "인명 피해",
    white: "없음",
    blue: "없음",
    yellow: "없음",
    red: "있음",
  },
  {
    id: "evacuation",
    category: "주민 대피",
    white: "X",
    blue: "X",
    yellow: "X",
    red: "O(암모니아)",
  },
]

const alertLevelConfig = {
  white: { label: "백색", color: "bg-gray-100 text-gray-800 border-gray-300" },
  blue: { label: "청색", color: "bg-blue-100 text-blue-800 border-blue-300" },
  yellow: { label: "황색", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  red: { label: "적색", color: "bg-red-100 text-red-800 border-red-300" },
}

interface ChecklistItem {
  id: string
  label: string
  options: string[]
}

const checklistItems: ChecklistItem[] = [
  {
    id: "scope",
    label: "사고 범위",
    options: ["방류벽 내부", "방류벽 외부", "사업장 외부"],
  },
  {
    id: "self-response",
    label: "자체조치 가능여부",
    options: ["가능(밸브 등)", "가능(소화수, 소석회 등)", "불가능"],
  },
  {
    id: "casualties",
    label: "인명 피해 여부",
    options: ["있음", "없음"],
  },
  {
    id: "evacuation",
    label: "주민 대피여부",
    options: ["필요", "불필요"],
  },
]

export default function StatusPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [pendingIncident, setPendingIncident] = useState<Incident | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [authenticatedApprover, setAuthenticatedApprover] = useState<AuthorizedApprover | null>(null)

  const [completingActionId, setCompletingActionId] = useState<string | null>(null)
  const [actionDetails, setActionDetails] = useState<Record<string, string>>({})
  const [showActionAuthDialog, setShowActionAuthDialog] = useState(false)
  const [pendingActionIncident, setPendingActionIncident] = useState<Incident | null>(null)
  const [actionAuthenticatedApprover, setActionAuthenticatedApprover] = useState<AuthorizedApprover | null>(null)

  const [deletingIncidentId, setDeletingIncidentId] = useState<string | null>(null)

  const [showAlertCriteriaDialog, setShowAlertCriteriaDialog] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null) // 훈련 종료를 위한 상태
  const [authenticatingForAction, setAuthenticatingForAction] = useState<string | null>(null) // Track which incident is being authenticated for

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/incidents")
      if (!response.ok) {
        throw new Error("사고 데이터를 불러올 수 없습니다")
      }
      const data = await response.json()
      setIncidents(data.incidents || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다")
      setIncidents([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveClick = (incident: Incident) => {
    setPendingIncident(incident)
    setShowAuthDialog(true)
  }

  const handleAuthenticated = async (approver: AuthorizedApprover) => {
    setAuthenticatedApprover(approver)
    setShowAuthDialog(false)
    setShowEditDialog(true)
  }

  const handleEditApprove = async (modifiedIncident: Partial<Incident>) => {
    if (!pendingIncident || !authenticatedApprover) return

    setApprovingId(pendingIncident.id)

    try {
      const response = await fetch(`/api/incidents/${pendingIncident.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approverName: authenticatedApprover.name,
          approverPhone: authenticatedApprover.phone,
          approverPosition: authenticatedApprover.position,
          isLimitedTest: pendingIncident.isLimitedTest,
          modifiedIncident: modifiedIncident,
          incidentDetails: {
            reporterName: pendingIncident.reportedBy,
            reporterPhone: pendingIncident.reportDetails?.reporterPhone || "01012345678",
            reporterCompany: pendingIncident.reportDetails?.reporterCompany || "GS동해전력",
            location: modifiedIncident.location || pendingIncident.location,
            type: modifiedIncident.type || pendingIncident.type,
            severity: "major",
            description: modifiedIncident.description || pendingIncident.description,
            timestamp: pendingIncident.reportedAt,
            // chemicalType: pendingIncident.chemicalType, // Removed legacy field
            // otherChemicalName: pendingIncident.otherChemicalName, // Removed legacy field
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        const modifiedText = modifiedIncident.isMessageModified ? " (내용 수정됨)" : ""
        const successMessage = pendingIncident.isLimitedTest
          ? `승인 완료! GS동해전력 5명에게 제한 테스트 SMS가 발송되었습니다.${modifiedText}`
          : `승인 완료! ${result.smsSent ? "SMS가 발송되었습니다." : "SMS 발송이 생략되었습니다."}${modifiedText}`
        alert(successMessage)
        fetchIncidents()
        setShowEditDialog(false)
      } else {
        alert(`승인 실패: ${result.error}`)
      }
    } catch (error) {
      console.error("[v0] 승인 오류:", error)
      alert("승인 처리 중 오류가 발생했습니다.")
    } finally {
      setApprovingId(null)
      setPendingIncident(null)
      setAuthenticatedApprover(null)
    }
  }

  const handleActionResultClick = (incident: Incident) => {
    setPendingActionIncident(incident)
    setShowActionAuthDialog(true)
  }

  const handleActionAuthenticated = (approver: AuthorizedApprover) => {
    setActionAuthenticatedApprover(approver)
    setShowActionAuthDialog(false)
    if (authenticatingForAction) {
      setSelectedIncident(incidents.find((i) => i.id === authenticatingForAction) || null)
      setAuthenticatingForAction(null)
    }
  }

  const handleDeleteIncident = async (incidentId: string) => {
    if (!confirm("정말로 이 사고 기록을 삭제하시겠습니까?\n\n삭제된 기록은 복구할 수 없습니다.")) {
      return
    }

    // 승인자 인증 확인
    if (!authenticatedApprover && !actionAuthenticatedApprover) {
      alert("사고를 삭제하려면 먼저 파트장 인증이 필요합니다.")
      setShowAuthDialog(true)
      return
    }

    const approver = authenticatedApprover || actionAuthenticatedApprover
    if (!approver) {
      alert("인증된 승인자가 없습니다.")
      return
    }

    setDeletingIncidentId(incidentId)

    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approverName: approver.name,
          approverPosition: approver.position,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(`사고가 삭제되었습니다.\n삭제자: ${approver.name} (${approver.position})`)
        // 목록 새로고침
        await fetchIncidents()
      } else {
        alert(`삭제 실패: ${result.error}`)
      }
    } catch (error) {
      console.error("사고 삭제 오류:", error)
      alert("사고 삭제 중 오류가 발생했습니다.")
    } finally {
      setDeletingIncidentId(null)
    }
  }

  const handleCompleteAction = async (incident: Incident) => {
    const details = actionDetails[incident.id]
    if (!details || details.trim() === "") {
      alert("조치 사항을 입력해주세요.")
      return
    }

    if (!actionAuthenticatedApprover) {
      alert("인증이 필요합니다.")
      return
    }

    setCompletingActionId(incident.id)

    try {
      const response = await fetch(`/api/incidents/${incident.id}/complete-action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionDetails: details,
          completedBy: actionAuthenticatedApprover.position, // Use position instead of name
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert("조치 완료 처리되었습니다.")
        fetchIncidents()
        setActionDetails((prev) => {
          const newDetails = { ...prev }
          delete newDetails[incident.id]
          return newDetails
        })
        setActionAuthenticatedApprover(null)
        setPendingActionIncident(null)
      } else {
        alert(`조치 완료 처리 실패: ${result.error}`)
      }
    } catch (error) {
      console.error("[v0] 조치 완료 처리 오류:", error)
      alert("조치 완료 처리 중 오류가 발생했습니다.")
    } finally {
      setCompletingActionId(null)
    }
  }

  const getAlertLevelStyle = (alertLevel: string) => {
    switch (alertLevel) {
      case "백색경보":
      case "white":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "청색경보":
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "황색경보":
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "적색경보":
      case "red":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const formatLocationDisplay = (location: string) => {
    const locationInfo = getLocationByName(location)
    if (locationInfo) {
      return locationInfo.name
    }
    return location
  }

  const handleEndTraining = async (incident: Incident) => {
    if (!actionAuthenticatedApprover) {
      alert("인증이 필요합니다.")
      return
    }

    if (!confirm("훈련을 종료하시겠습니까? 모든 참여자에게 종료 알림이 발송됩니다.")) {
      return
    }

    setCompletingActionId(incident.id) // Reuse this state for processing indication

    try {
      const response = await fetch(`/api/incidents/${incident.id}/end-training`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endedBy: actionAuthenticatedApprover.position,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert("훈련이 성공적으로 종료되었습니다.")
        fetchIncidents()
        setActionAuthenticatedApprover(null)
        setSelectedIncident(null) // Clear the selected incident for training end
      } else {
        alert(`훈련 종료 처리 실패: ${result.error}`)
      }
    } catch (error) {
      console.error("[v0] 훈련 종료 처리 오류:", error)
      alert("훈련 종료 처리 중 오류가 발생했습니다.")
    } finally {
      setCompletingActionId(null)
    }
  }

  if (isLoading) {
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
            <h1 className="text-2xl font-bold text-gray-900">사고 현황 관리</h1>
          </div>
          <Card className="text-center py-12">
            <CardContent>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">사고 현황을 불러오는 중...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
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
            <h1 className="text-2xl font-bold text-gray-900">사고 현황 관리</h1>
          </div>
          <Card className="text-center py-12">
            <CardContent>
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">데이터를 불러올 수 없습니다</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchIncidents}>다시 시도</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ApproverAuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuthenticated={handleAuthenticated}
      />

      <ApproverAuthDialog
        open={showActionAuthDialog}
        onOpenChange={setShowActionAuthDialog}
        onAuthenticated={handleActionAuthenticated}
        data-auth-dialog="true" // Added for identifying the dialog
      />

      <IncidentEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        incident={pendingIncident}
        approver={authenticatedApprover}
        onApprove={handleEditApprove}
        isProcessing={approvingId === pendingIncident?.id}
      />

      <AlertCriteriaDialog
        open={showAlertCriteriaDialog}
        onOpenChange={setShowAlertCriteriaDialog}
        selectedOptions={{}} // Pass empty or default options if needed, as logic was removed
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로가기
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">사고 현황 관리</h1>
          </div>
          <Button variant="outline" onClick={fetchIncidents}>
            새로고침
          </Button>
        </div>

        {incidents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">현재 접수된 사고가 없습니다</h3>
              <p className="text-gray-600">새로운 사고 신고가 접수되면 이곳에 표시됩니다.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {incidents.map((incident) => (
              <Card key={incident.id} className="overflow-hidden border-l-4 border-l-blue-500">
                <CardHeader className="bg-gray-50 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={`${incident.status === "resolved"
                              ? "bg-gray-500"
                              : incident.status === "active"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            } text-white`}
                        >
                          {incident.status === "resolved"
                            ? "조치 완료"
                            : incident.status === "active"
                              ? "대응 중"
                              : "승인 대기"}
                        </Badge>
                        <Badge variant="outline" className={getAlertLevelStyle(incident.alertLevel)}>
                          {alertLevelConfig[incident.alertLevel as AlertLevel]?.label || incident.alertLevel}
                        </Badge>
                        {incident.isTraining && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                            훈련 상황
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {incident.type}
                        <span className="text-sm font-normal text-gray-500">({incident.id})</span>
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(incident.reportedAt).toLocaleString()}
                        <span className="mx-2">•</span>
                        <MapPin className="h-3 w-3 mr-1" />
                        {formatLocationDisplay(incident.location)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {incident.status === "pending_approval" && (
                        <Button onClick={() => handleApproveClick(incident)} className="bg-blue-600 hover:bg-blue-700">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          승인 및 전파
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteIncident(incident.id)}
                        title="사고 기록 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">상황 설명</h4>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{incident.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">신고자</h4>
                          <p className="text-gray-900 font-medium">{incident.reportedBy}</p>
                          {incident.reportDetails && (
                            <p className="text-xs text-gray-500">
                              {incident.reportDetails.reporterCompany} / {incident.reportDetails.reporterPhone}
                            </p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">유해물질</h4>
                          <p className="text-gray-900 font-medium">
                            {incident.hazardousMaterial === "ammonia"
                              ? "암모니아"
                              : incident.hazardousMaterial === "hydrochloric_acid"
                                ? "염산"
                                : incident.hazardousMaterial === "byproduct_fuel_oil"
                                  ? "부생연료유"
                                  : incident.hazardousMaterial === "hydrogen"
                                    ? "수소"
                                    : incident.selectedChemical || "기타"}
                          </p>
                        </div>
                      </div>

                      {incident.alarmCriteria && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">사고 판단 기준</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-500 block text-xs">사고 범위</span>
                              <span className="font-medium">{incident.alarmCriteria.scope}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-500 block text-xs">자체조치</span>
                              <span className="font-medium">
                                {incident.alarmCriteria.selfResponse || incident.alarmCriteria["self-response"]}
                              </span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-500 block text-xs">인명 피해</span>
                              <span className="font-medium">{incident.alarmCriteria.casualties}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-500 block text-xs">주민 대피</span>
                              <span className="font-medium">{incident.alarmCriteria.evacuation}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {incident.status === "active" && (
                        <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                          <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center">
                            <Shield className="h-4 w-4 mr-2" />
                            대응 현황
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-blue-600">승인자:</span>
                              <span className="font-medium text-blue-900">{incident.approvedBy}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-600">승인 시각:</span>
                              <span className="font-medium text-blue-900">
                                {incident.approvedAt ? new Date(incident.approvedAt).toLocaleString() : "-"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-600">SMS 발송:</span>
                              <span className="font-medium text-blue-900">{incident.notificationsSent}건 발송됨</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-blue-100">
                            <h5 className="text-sm font-medium text-blue-800 mb-2">조치 결과 입력</h5>
                            <Textarea
                              placeholder="조치 완료 내용을 입력하세요..."
                              className="bg-white mb-2 text-sm"
                              value={actionDetails[incident.id] || ""}
                              onChange={(e) =>
                                setActionDetails((prev) => ({ ...prev, [incident.id]: e.target.value }))
                              }
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleActionResultClick(incident)}
                              >
                                조치 완료 처리
                              </Button>
                              {incident.isTraining && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                                  onClick={() => {
                                    setActionAuthenticatedApprover(null) // Reset auth
                                    setAuthenticatingForAction(incident.id) // Set target incident
                                    setShowActionAuthDialog(true) // Show auth dialog
                                  }}
                                >
                                  훈련 종료
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {incident.status === "resolved" && (
                        <div className="bg-gray-100 border border-gray-200 rounded-md p-4">
                          <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            조치 완료
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">조치자:</span>
                              <span className="font-medium text-gray-900">{incident.actionCompletedBy}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">완료 시각:</span>
                              <span className="font-medium text-gray-900">
                                {incident.actionCompletedAt
                                  ? new Date(incident.actionCompletedAt).toLocaleString()
                                  : "-"}
                              </span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <span className="text-gray-600 block mb-1">조치 내용:</span>
                              <p className="text-gray-900 bg-white p-2 rounded border border-gray-200">
                                {incident.actionDetails}
                              </p>
                            </div>
                            {incident.isTraining && incident.trainingEndedBy && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <span className="text-purple-600 font-medium block mb-1">훈련 종료 정보:</span>
                                <div className="text-xs text-gray-600">
                                  종료자: {incident.trainingEndedBy} <br />
                                  종료 시각:{" "}
                                  {incident.trainingEndedAt
                                    ? new Date(incident.trainingEndedAt).toLocaleString()
                                    : "-"}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
