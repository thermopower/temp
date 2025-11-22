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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertTriangle, Edit, RotateCcw, Send, CheckCircle2, CheckCircle } from "lucide-react"
import type { Incident, AlertLevel } from "@/lib/types"
import type { AuthorizedApprover } from "@/lib/authorized-approvers"
import { Input } from "@/components/ui/input"

interface IncidentEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incident: Incident | null
  approver: AuthorizedApprover | null
  onApprove: (modifiedIncident: Partial<Incident>) => void
  isProcessing: boolean
}

const locationOptions = [
  "1호기 터빈건물",
  "2호기 터빈건물",
  "1호기 보일러 건물",
  "2호기 보일러 건물",
  "암모니아 저장 탱크",
  "복수탈염 약품저장 탱크",
  "부생연료유 저장 탱크",
  "탈황폐수처리 건물",
  "수처리 및 발전폐수처리 건물",
  "기타 위치",
]

const incidentTypeOptions = ["화재, 폭발", "유해물질 누출", "설비 고장", "기타"]

interface AlarmCriteria {
  scope: string
  selfResponse: string
  casualties: string
  evacuation: string
}

export function IncidentEditDialog({
  open,
  onOpenChange,
  incident,
  approver,
  onApprove,
  isProcessing,
}: IncidentEditDialogProps) {
  // Original values
  const [originalData, setOriginalData] = useState<{
    location: string
    type: string
    description: string
    alarmCriteria: AlarmCriteria
    selectedChemical?: string
    customChemicalName?: string
  } | null>(null)

  // Editable values
  const [location, setLocation] = useState("")
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [alarmCriteria, setAlarmCriteria] = useState<AlarmCriteria>({
    scope: "",
    selfResponse: "",
    casualties: "",
    evacuation: "",
  })
  const [selectedChemical, setSelectedChemical] = useState("")
  const [customChemicalName, setCustomChemicalName] = useState("")

  const [isSendingTraining, setIsSendingTraining] = useState(false)
  const [trainingSent, setTrainingSent] = useState(false)
  const [isEndingTraining, setIsEndingTraining] = useState(false)

  useEffect(() => {
    if (incident && open) {
      const original = {
        location: incident.location,
        type: incident.type,
        description: incident.description,
        alarmCriteria: incident.alarmCriteria || {
          scope: "",
          selfResponse: "",
          casualties: "",
          evacuation: "",
        },
        selectedChemical: incident.selectedChemical || "",
        customChemicalName: incident.customChemicalName || "",
      }
      setOriginalData(original)
      setLocation(original.location)
      setType(original.type)
      setDescription(original.description)
      setAlarmCriteria(original.alarmCriteria)
      setSelectedChemical(original.selectedChemical || "")
      setCustomChemicalName(original.customChemicalName || "")
      setTrainingSent(false)
    }
  }, [incident, open])

  const handleReset = () => {
    if (originalData) {
      setLocation(originalData.location)
      setType(originalData.type)
      setDescription(originalData.description)
      setAlarmCriteria(originalData.alarmCriteria)
      setSelectedChemical(originalData.selectedChemical || "")
      setCustomChemicalName(originalData.customChemicalName || "")
    }
  }

  const isModified = () => {
    if (!originalData) return false
    return (
      location !== originalData.location ||
      type !== originalData.type ||
      description !== originalData.description ||
      alarmCriteria.scope !== originalData.alarmCriteria.scope ||
      alarmCriteria.selfResponse !== originalData.alarmCriteria.selfResponse ||
      alarmCriteria.casualties !== originalData.alarmCriteria.casualties ||
      alarmCriteria.evacuation !== originalData.alarmCriteria.evacuation ||
      selectedChemical !== (originalData.selectedChemical || "") ||
      customChemicalName !== (originalData.customChemicalName || "")
    )
  }

  const determineAlertLevel = (): AlertLevel => {
    if (alarmCriteria.casualties === "있음" || alarmCriteria.evacuation === "필요") {
      return "red"
    }
    if (alarmCriteria.scope === "사업장 외부" || alarmCriteria.selfResponse === "불가능") {
      return "yellow"
    }
    if (alarmCriteria.scope === "방류벽 외부" || alarmCriteria.selfResponse === "가능(소화수, 소석회 등)") {
      return "blue"
    }
    return "white"
  }

  const handleApprove = () => {
    if (!incident) return

    const modifiedIncident: Partial<Incident> = {
      location,
      type,
      description,
      alarmCriteria,
      alertLevel: determineAlertLevel(),
      isMessageModified: isModified(),
      reviewedBy: approver?.name,
      reviewedAt: new Date(),
      selectedChemical,
      customChemicalName,
    }

    onApprove(modifiedIncident)
  }

  const handleSendTraining = async () => {
    if (!incident) return

    setIsSendingTraining(true)
    try {
      const modifiedIncident = {
        location,
        type,
        description,
        alarmCriteria,
        alertLevel: determineAlertLevel(),
      }

      console.log("[v0] 훈련 상황 경보 발송 시작")
      console.log("[v0] 결정된 경보 단계:", modifiedIncident.alertLevel)
      console.log("[v0] 경보 판정 기준:", modifiedIncident.alarmCriteria)

      const response = await fetch(`/api/incidents/${incident.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incidentDetails: {
            reporterName: incident.reportDetails?.reporterName || incident.reportedBy,
            reporterPhone: incident.reportDetails?.reporterPhone || "",
            reporterCompany: incident.reportDetails?.reporterCompany || "",
            location: incident.location,
            type: incident.type,
            description: incident.description,
            severity: incident.reportDetails?.severity,
            timestamp: incident.reportedAt,
            chemicalType: incident.selectedChemical,
            otherChemicalName: incident.customChemicalName,
          },
          modifiedIncident: {
            location: modifiedIncident.location,
            type: modifiedIncident.type,
            description: modifiedIncident.description,
            alarmCriteria: modifiedIncident.alarmCriteria,
            alertLevel: modifiedIncident.alertLevel,
            isMessageModified: isModified(),
            reviewedBy: approver?.name,
            reviewedAt: new Date(),
            selectedChemical,
            customChemicalName,
            chemicalType: incident.selectedChemical,
            otherChemicalName: incident.customChemicalName,
          },
          approverName: approver?.name,
          approverPhone: approver?.phone,
          approverPosition: approver?.position,
          isTraining: true,
        }),
      })

      console.log("[v0] 훈련 상황 경보 API 응답 상태:", response.status)

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[v0] 훈련 경보 발송 오류: 응답이 JSON이 아닙니다:", text.substring(0, 200))
        throw new Error("서버에서 올바른 응답을 받지 못했습니다. 관리자에게 문의하세요.")
      }

      const result = await response.json()
      console.log("[v0] 훈련 상황 경보 API 응답:", result)

      if (result.success) {
        setTrainingSent(true)
        alert(`훈련 상황 경보가 발송되었습니다.`)
        // Close dialog after short delay
        setTimeout(() => {
          onOpenChange(false)
          // Refresh page to show updated incident
          window.location.reload()
        }, 1500)
      } else {
        alert(`훈련 경보 발송 실패: ${result.error}`)
      }
    } catch (error) {
      console.error("[v0] 훈련 경보 발송 오류:", error)
      alert(`훈련 경보 발송 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsSendingTraining(false)
    }
  }

  const handleEndTraining = async () => {
    if (!incident) return

    console.log("[v0] 훈련 종료 버튼 클릭")

    if (!confirm("훈련을 종료하시겠습니까? 모든 참여자에게 훈련 종료 알림이 발송됩니다.")) {
      return
    }

    setIsEndingTraining(true)
    console.log("[v0] 훈련 종료 API 호출 시작")

    try {
      const url = `/api/incidents/${incident.id}/end-training`
      console.log("[v0] API URL:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approverName: approver?.name,
          approverPosition: approver?.position,
        }),
      })

      console.log("[v0] API 응답 상태:", response.status)
      const result = await response.json()
      console.log("[v0] API 응답 데이터:", result)

      if (result.success) {
        alert(`훈련 종료 알림이 발송되었습니다.`)
        setTimeout(() => {
          onOpenChange(false)
          window.location.reload()
        }, 1500)
      } else {
        alert(`훈련 종료 알림 발송 실패: ${result.error}`)
      }
    } catch (error) {
      console.error("[v0] 훈련 종료 알림 발송 오류:", error)
      alert(`훈련 종료 알림 발송 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsEndingTraining(false)
    }
  }

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

  const requiresChemicalSelection = (loc: string): boolean => {
    return loc.includes("수처리") || loc.includes("폐수처리") || loc.includes("복수탈염") || loc.includes("탈황폐수")
  }

  if (!incident || !approver) return null

  const currentAlertLevel = determineAlertLevel()
  const modified = isModified()

  const shouldSendSms = currentAlertLevel === "yellow" || currentAlertLevel === "red"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            사고 내용 검토 및 수정
          </DialogTitle>
          <DialogDescription>
            최초 신고자가 접수한 사고 내용을 검토하고 필요시 수정하세요.
            {shouldSendSms ? " 수정된 내용으로 경보가 발송됩니다." : " 승인 후 사고가 기록됩니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 승인자 정보 */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>검토자:</strong> {approver.name} ({approver.position})
            </p>
          </div>

          {/* 수정 상태 표시 */}
          {modified && (
            <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-orange-800">사고 내용이 수정되었습니다</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset} className="bg-white">
                <RotateCcw className="h-4 w-4 mr-1" />
                원본으로 복원
              </Button>
            </div>
          )}

          {/* 신고자 정보 */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">최초 신고자 정보</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">신고자:</span>
                <span className="ml-2 font-medium">{incident.reportedBy}</span>
              </div>
              <div>
                <span className="text-gray-600">신고 시각:</span>
                <span className="ml-2 font-medium">{new Date(incident.reportedAt).toLocaleString("ko-KR")}</span>
              </div>
              {incident.reportDetails && (
                <>
                  <div>
                    <span className="text-gray-600">연락처:</span>
                    <span className="ml-2 font-medium">{incident.reportDetails.reporterPhone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">소속:</span>
                    <span className="ml-2 font-medium">{incident.reportDetails.reporterCompany || "미확인"}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 사고 정보 수정 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Edit className="h-4 w-4" />
              사고 정보 (수정 가능)
            </h3>

            {/* 사고 위치 */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                사고 위치 *
              </Label>
              <Select
                value={location}
                onValueChange={(value) => {
                  setLocation(value)
                  if (!requiresChemicalSelection(value)) {
                    setSelectedChemical("")
                    setCustomChemicalName("")
                  }
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="사고 위치 선택" />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {originalData && location !== originalData.location && (
                <p className="text-xs text-orange-600">
                  원본: <span className="line-through">{originalData.location}</span>
                </p>
              )}
            </div>

            {/* 관련 화학물질 선택 */}
            {location && requiresChemicalSelection(location) && (
              <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                <Label className="font-semibold text-gray-900 mb-3 block flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  관련 화학물질 선택
                </Label>
                <RadioGroup
                  value={selectedChemical}
                  onValueChange={(value) => {
                    setSelectedChemical(value)
                    if (value !== "그 외 화학물질") {
                      setCustomChemicalName("")
                    }
                  }}
                >
                  <div className="space-y-2">
                    <div
                      className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer ${
                        selectedChemical === "염산(염화수소)"
                          ? "border-blue-500 bg-blue-100"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value="염산(염화수소)" id="edit-chemical-hcl" />
                      <Label htmlFor="edit-chemical-hcl" className="cursor-pointer flex-1 text-sm font-medium">
                        염산(염화수소)
                      </Label>
                    </div>
                    <div
                      className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer ${
                        selectedChemical === "가성소다(수산화나트륨)"
                          ? "border-blue-500 bg-blue-100"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value="가성소다(수산화나트륨)" id="edit-chemical-naoh" />
                      <Label htmlFor="edit-chemical-naoh" className="cursor-pointer flex-1 text-sm font-medium">
                        가성소다(수산화나트륨)
                      </Label>
                    </div>
                    <div
                      className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer ${
                        selectedChemical === "그 외 화학물질"
                          ? "border-blue-500 bg-blue-100"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value="그 외 화학물질" id="edit-chemical-other" />
                      <Label htmlFor="edit-chemical-other" className="cursor-pointer flex-1 text-sm font-medium">
                        그 외 화학물질
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {selectedChemical === "그 외 화학물질" && (
                  <div className="mt-3 space-y-2">
                    <Label htmlFor="edit-customChemicalName" className="text-sm font-medium">
                      화학물질명 입력 *
                    </Label>
                    <Input
                      id="edit-customChemicalName"
                      type="text"
                      value={customChemicalName}
                      onChange={(e) => setCustomChemicalName(e.target.value)}
                      placeholder="화학물질명을 입력하세요"
                      className="h-10 text-sm"
                    />
                  </div>
                )}

                {originalData &&
                  (selectedChemical !== (originalData.selectedChemical || "") ||
                    customChemicalName !== (originalData.customChemicalName || "")) && (
                    <p className="text-xs text-orange-600 mt-2">
                      원본:{" "}
                      <span className="line-through">
                        {originalData.selectedChemical || "선택 안 함"}
                        {originalData.customChemicalName ? ` (${originalData.customChemicalName})` : ""}
                      </span>
                    </p>
                  )}
              </div>
            )}

            {/* 사고 종류 */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                사고 종류 *
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="사고 종류 선택" />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypeOptions.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {originalData && type !== originalData.type && (
                <p className="text-xs text-orange-600">
                  원본: <span className="line-through">{originalData.type}</span>
                </p>
              )}
            </div>

            {/* 사고 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                상황 설명 *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="text-sm"
                placeholder="사고 상황을 구체적으로 설명하세요"
              />
              {originalData && description !== originalData.description && (
                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                  <p className="font-medium mb-1">원본 설명:</p>
                  <p className="line-through">{originalData.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* 경보 판정 기준 수정 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              경보 판정 기준 (수정 가능)
            </h3>

            <div className="space-y-4">
              {/* 사고 범위 */}
              <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                <Label className="font-semibold text-gray-900 mb-3 block">1. 사고 범위</Label>
                <RadioGroup
                  value={alarmCriteria.scope}
                  onValueChange={(value) => setAlarmCriteria({ ...alarmCriteria, scope: value })}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {["방류벽 내부", "방류벽 외부", "사업장 외부"].map((option) => (
                      <div
                        key={option}
                        className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer ${
                          alarmCriteria.scope === option
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <RadioGroupItem value={option} id={`scope-${option}`} />
                        <Label htmlFor={`scope-${option}`} className="cursor-pointer flex-1 text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                {originalData && alarmCriteria.scope !== originalData.alarmCriteria.scope && (
                  <p className="text-xs text-orange-600 mt-2">
                    원본: <span className="line-through">{originalData.alarmCriteria.scope}</span>
                  </p>
                )}
              </div>

              {/* 자체조치 가능여부 */}
              <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                <Label className="font-semibold text-gray-900 mb-3 block">2. 자체조치 가능여부</Label>
                <RadioGroup
                  value={alarmCriteria.selfResponse}
                  onValueChange={(value) => setAlarmCriteria({ ...alarmCriteria, selfResponse: value })}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {["가능(밸브 등)", "가능(소화수, 소석회 등)", "불가능"].map((option) => (
                      <div
                        key={option}
                        className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer ${
                          alarmCriteria.selfResponse === option
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <RadioGroupItem value={option} id={`self-${option}`} />
                        <Label htmlFor={`self-${option}`} className="cursor-pointer flex-1 text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                {originalData && alarmCriteria.selfResponse !== originalData.alarmCriteria.selfResponse && (
                  <p className="text-xs text-orange-600 mt-2">
                    원본: <span className="line-through">{originalData.alarmCriteria.selfResponse}</span>
                  </p>
                )}
              </div>

              {/* 인명 피해여부 */}
              <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                <Label className="font-semibold text-gray-900 mb-3 block">3. 인명 피해여부</Label>
                <RadioGroup
                  value={alarmCriteria.casualties}
                  onValueChange={(value) => setAlarmCriteria({ ...alarmCriteria, casualties: value })}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {["있음", "없음"].map((option) => (
                      <div
                        key={option}
                        className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer ${
                          alarmCriteria.casualties === option
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <RadioGroupItem value={option} id={`casualties-${option}`} />
                        <Label htmlFor={`casualties-${option}`} className="cursor-pointer flex-1 text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                {originalData && alarmCriteria.casualties !== originalData.alarmCriteria.casualties && (
                  <p className="text-xs text-orange-600 mt-2">
                    원본: <span className="line-through">{originalData.alarmCriteria.casualties}</span>
                  </p>
                )}
              </div>

              {/* 주민 대피여부 */}
              <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                <Label className="font-semibold text-gray-900 mb-3 block">4. 주민 대피여부</Label>
                <RadioGroup
                  value={alarmCriteria.evacuation}
                  onValueChange={(value) => setAlarmCriteria({ ...alarmCriteria, evacuation: value })}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {["필요", "불필요"].map((option) => (
                      <div
                        key={option}
                        className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer ${
                          alarmCriteria.evacuation === option
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <RadioGroupItem value={option} id={`evacuation-${option}`} />
                        <Label htmlFor={`evacuation-${option}`} className="cursor-pointer flex-1 text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                {originalData && alarmCriteria.evacuation !== originalData.alarmCriteria.evacuation && (
                  <p className="text-xs text-orange-600 mt-2">
                    원본: <span className="line-through">{originalData.alarmCriteria.evacuation}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 자동 결정된 경보 단계 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                자동 결정된 경보 단계
              </h3>
              <Badge className={`${getAlertLevelColor(currentAlertLevel)} border-2 text-lg px-4 py-1`}>
                {currentAlertLevel}
              </Badge>
            </div>
            <div className="text-sm text-gray-700 bg-white p-4 rounded border border-blue-200">
              <p className="font-medium mb-2">선택된 기준:</p>
              <ul className="space-y-1">
                <li>
                  • 사고 범위: <span className="font-semibold">{alarmCriteria.scope}</span>
                </li>
                <li>
                  • 자체조치: <span className="font-semibold">{alarmCriteria.selfResponse}</span>
                </li>
                <li>
                  • 인명 피해: <span className="font-semibold">{alarmCriteria.casualties}</span>
                </li>
                <li>
                  • 주민 대피: <span className="font-semibold">{alarmCriteria.evacuation}</span>
                </li>
              </ul>
            </div>
          </div>

          {trainingSent && (
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">훈련 상황 경보가 발송되었습니다!</span>
              </div>
              <p className="text-sm text-green-700 mt-2">문자 내용 앞에 '훈련 상황'이 표시되어 발송되었습니다.</p>
            </div>
          )}

          {shouldSendSms ? (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>📱 문자 발송 대상:</strong>{" "}
                {incident.isLimitedTest ? "GS동해전력 5명 (제한 테스트)" : "전체 비상연락망"}
              </p>
              {incident.isLimitedTest && (
                <p className="text-xs text-yellow-700 mt-1">🧪 이 사고는 제한 테스트 모드로 설정되어 있습니다.</p>
              )}
              <p className="text-xs text-yellow-700 mt-2">⚠️ {currentAlertLevel}는 비상연락망에 문자가 발송됩니다.</p>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ 승인 처리:</strong> {currentAlertLevel}는 문자 발송 없이 승인만 진행됩니다.
              </p>
              <p className="text-xs text-blue-700 mt-1">
                백색경보 또는 청색경보는 사고 기록만 저장되며, 비상연락망에 문자가 발송되지 않습니다.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing || isSendingTraining}
            className="bg-transparent"
          >
            취소
          </Button>
          {shouldSendSms && (
            <Button
              variant="outline"
              onClick={handleSendTraining}
              disabled={isProcessing || isSendingTraining}
              className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              {isSendingTraining ? (
                "발송 중..."
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  훈련 상황
                </>
              )}
            </Button>
          )}
          {incident.isTraining && !incident.trainingEndedAt && (
            <Button
              variant="outline"
              onClick={handleEndTraining}
              disabled={isProcessing || isEndingTraining}
              className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
            >
              {isEndingTraining ? (
                "발송 중..."
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  훈련 종료
                </>
              )}
            </Button>
          )}
          <Button
            onClick={handleApprove}
            disabled={isProcessing || isSendingTraining}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isProcessing ? (
              "처리 중..."
            ) : (
              <>
                {shouldSendSms ? (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    경보 발령
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    승인 (문자 발송 없음)
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
