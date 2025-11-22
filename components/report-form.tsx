"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { IncidentReportForm, HazardousMaterial } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MapPin,
  AlertTriangle,
  Phone,
  User,
  Building2,
  MapPinned,
  FileText,
  Send,
  ArrowLeft,
  Upload,
  X,
  ImageIcon,
  CheckCircle2,
} from "lucide-react"
import Image from "next/image"
import { getAccidentImagePath } from "@/lib/image-utils"

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

const hazardousMaterialsInfo: Record<HazardousMaterial, any> = {
  ammonia: {
    name: "암모니아 (NH₃)",
    concentration: "99.8%",
    toxicRange: "반경 500m",
    purpose: "탈질설비 환원제",
    evacuationRoute: "풍향 반대방향으로 대피, 집결지: 주차장",
    msds: {
      nfpaRating: "건강3, 화재1, 반응성0",
      allowableConcentration: "25ppm (8시간 TWA)",
      corrosive: true,
    },
  },
  hydrochloric_acid: {
    name: "염산 (HCl)",
    concentration: "9%",
    toxicRange: "반경 300m",
    purpose: "수처리 pH 조정",
    evacuationRoute: "풍향 반대방향으로 대피, 집결지: 관리동",
    msds: {
      nfpaRating: "건강3, 화재0, 반응성1",
      allowableConcentration: "5ppm (천장값)",
      corrosive: true,
    },
  },
  byproduct_fuel_oil: {
    name: "부생연료유",
    concentration: "혼합물",
    toxicRange: "반경 200m",
    purpose: "보조연료",
    evacuationRoute: "화재 시 풍향 고려하여 대피, 집결지: 정문",
    msds: {
      nfpaRating: "건강2, 화재3, 반응성0",
      corrosive: false,
    },
  },
  hydrogen: {
    name: "수소 (H₂)",
    concentration: "99.9%",
    toxicRange: "반경 100m",
    purpose: "발전기 냉각",
    evacuationRoute: "즉시 대피, 집결지: 주차장",
    msds: {
      nfpaRating: "건강1, 화재4, 반응성0",
      allowableConcentration: "단순질식제",
      corrosive: false,
    },
  },
}

const facilityLocationData: Record<string, { x: number; y: number; description: string }> = {
  "1호기 터빈건물": { x: 25, y: 45, description: "1호기 터빈 발전기 설비" },
  "2호기 터빈건물": { x: 45, y: 45, description: "2호기 터빈 발전기 설비" },
  "1호기 보일러 건물": { x: 25, y: 65, description: "1호기 보일러 및 연소설비" },
  "2호기 보일러 건물": { x: 45, y: 65, description: "2호기 보일러 및 연소설비" },
  "암모니아 저장 탱크": { x: 70, y: 55, description: "탈질설비용 암모니아 저장시설" },
  "복수탈염 약품저장 탱크": { x: 15, y: 75, description: "복수탈염용 화학약품 저장시설" },
  "부생연료유 저장 탱크": { x: 10, y: 85, description: "보조연료용 부생연료유 저장시설" },
  "탈황폐수처리 건물": { x: 20, y: 90, description: "탈황설비 폐수처리시설" },
  "수처리 및 발전폐수처리 건물": { x: 35, y: 90, description: "발전소 폐수처리시설" },
}

interface AlarmLevelCriteria {
  id: string
  label: string
  level: "minor" | "moderate" | "major" | "critical"
  options: string[]
}

export default function ReportForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [facilityFromQR, setFacilityFromQR] = useState<string | null>(null)
  const [showLocationModal, setShowLocationModal] = useState(false)

  const [formData, setFormData] = useState<IncidentReportForm>({
    reporterName: "",
    reporterPhone: "",
    reporterCompany: "",
    location: "",
    type: "",
    description: "",
    severity: "minor",
    customLocation: "",
    photos: [],
    selectedChemical: "",
    customChemicalName: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasProcessedUrlFacility = useRef(false)

  useEffect(() => {
    if (hasProcessedUrlFacility.current) return

    const facilityFromUrl = searchParams.get("facility")
    if (facilityFromUrl) {
      const decodedFacility = decodeURIComponent(facilityFromUrl)
      if (locationOptions.includes(decodedFacility)) {
        setFormData((prev) => ({
          ...prev,
          location: decodedFacility,
        }))
        setFacilityFromQR(decodedFacility)
        setShowLocationModal(true)
        hasProcessedUrlFacility.current = true
        console.log(`[v0] URL에서 설비 자동 선택: ${decodedFacility}`)
      }
    }
  }, [searchParams])

  const [alarmChecklist] = useState<AlarmLevelCriteria[]>([
    {
      id: "scope",
      label: "사고 범위",
      level: "minor",
      options: ["방류벽 내부", "방류벽 외부", "사업장 외부"],
    },
    {
      id: "self-response",
      label: "자체조치 가능여부",
      level: "moderate",
      options: ["가능(밸브 등)", "가능(소화수, 소석회 등)", "불가능"],
    },
    {
      id: "casualties",
      label: "인명 피해 여부",
      level: "major",
      options: ["있음", "없음"],
    },
    {
      id: "evacuation",
      label: "주민 대피여부",
      level: "critical",
      options: ["필요", "불필요"],
    },
  ])

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const calculateAlarmLevel = (): { level: string; color: string; description: string } | null => {
    if (Object.keys(selectedOptions).length !== alarmChecklist.length) {
      return null
    }

    const scope = selectedOptions["scope"]
    const selfResponse = selectedOptions["self-response"]
    const casualties = selectedOptions["casualties"]
    const evacuation = selectedOptions["evacuation"]

    if (
      scope === "방류벽 내부" &&
      selfResponse === "가능(밸브 등)" &&
      casualties === "없음" &&
      evacuation === "불필요"
    ) {
      return {
        level: "백색경보",
        color: "bg-gray-100 border-gray-400 text-gray-800",
        description: "사업장 내부에서 자체 조치 가능한 경미한 사고",
      }
    }

    if (
      (scope === "방류벽 외부" || selfResponse === "가능(소화수, 소석회 등)") &&
      casualties === "없음" &&
      evacuation === "불필요"
    ) {
      return {
        level: "청색경보",
        color: "bg-blue-100 border-blue-500 text-blue-800",
        description: "사업장 내부에서 대응 가능하나 주의가 필요한 사고",
      }
    }

    if (casualties === "있음" || evacuation === "필요") {
      return {
        level: "적색경보",
        color: "bg-red-100 border-red-600 text-red-800",
        description: "인명피해가 발생했거나 주민 대피가 필요한 중대 사고",
      }
    }

    return {
      level: "황색경보",
      color: "bg-yellow-100 border-yellow-500 text-yellow-800",
      description: "외부 지원이 필요하거나 사업장 외부로 영향이 있는 사고",
    }
  }

  const expectedAlarm = calculateAlarmLevel()

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    const currentPhotos = formData.photos || []

    if (currentPhotos.length + newFiles.length > 5) {
      alert("최대 5장까지 업로드할 수 있습니다.")
      return
    }

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    setPhotoPreviews([...photoPreviews, ...newPreviews])

    setFormData({
      ...formData,
      photos: [...currentPhotos, ...newFiles],
    })
  }

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...(formData.photos || [])]
    const newPreviews = [...photoPreviews]

    URL.revokeObjectURL(newPreviews[index])

    newPhotos.splice(index, 1)
    newPreviews.splice(index, 1)

    setFormData({ ...formData, photos: newPhotos })
    setPhotoPreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] 사고 신고 폼 제출 시작")

    if (
      !formData.reporterName ||
      !formData.reporterPhone ||
      !formData.location ||
      !formData.type ||
      !formData.description
    ) {
      alert("필수 항목을 모두 입력해주세요.")
      return
    }

    if (Object.keys(selectedOptions).length !== alarmChecklist.length) {
      alert("경보 단계 판정 기준을 모두 선택해주세요.")
      return
    }

    setIsSubmitting(true)
    console.log("[v0] API 호출 준비:", formData)

    try {
      const url = "/api/incidents"
      console.log("[v0] API URL:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          alarmCriteria: selectedOptions,
        }),
      })

      console.log("[v0] API 응답 상태:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] 신고 성공:", data)
        alert("사고가 성공적으로 신고되었습니다.")
        router.push(`/status`)
      } else {
        const errorData = await response.text()
        console.error("[v0] API 오류 응답:", errorData)
        throw new Error("신고 접수 실패")
      }
    } catch (error) {
      console.error("[v0] 신고 오류:", error)
      alert("신고 접수 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">화학사고 신고</h1>
        </div>

        {facilityFromQR && (
          <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white rounded-full p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">QR 코드로 접속됨</p>
                  <p className="text-xl font-bold text-blue-900">{facilityFromQR}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLocationModal(true)}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                설비 위치 보기
              </Button>
            </div>
          </div>
        )}

        <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <MapPin className="h-6 w-6 text-blue-600" />
                {facilityFromQR} - 설비 위치
              </DialogTitle>
              <DialogDescription>
                발전소 배치도에서 해당 설비의 위치를 확인하세요. 신고 시 참고하실 수 있습니다.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {facilityFromQR && facilityLocationData[facilityFromQR] && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-1">{facilityFromQR}</h3>
                  <p className="text-sm text-blue-700">{facilityLocationData[facilityFromQR].description}</p>
                </div>
              )}

              <div className="relative w-full bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={facilityFromQR ? getAccidentImagePath(facilityFromQR, "") : "/images/plant-layout-numbered.png"}
                  alt={`${facilityFromQR} 배치도`}
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  안내: 이 창을 닫아도 신고 페이지는 그대로 유지됩니다. 위치를 참고하여 사고를 신고해주세요.
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowLocationModal(false)}>확인</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                신고자 정보
              </CardTitle>
              <CardDescription>사고를 신고하시는 분의 정보를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reporterName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  신고자 이름 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reporterName"
                  value={formData.reporterName}
                  onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporterPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  연락처 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reporterPhone"
                  type="tel"
                  value={formData.reporterPhone}
                  onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                  placeholder="010-0000-0000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporterCompany" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  소속 (선택사항)
                </Label>
                <Input
                  id="reporterCompany"
                  value={formData.reporterCompany}
                  onChange={(e) => setFormData({ ...formData, reporterCompany: e.target.value })}
                  placeholder="회사명 또는 부서명"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                사고 정보
              </CardTitle>
              <CardDescription>발생한 사고의 상세 정보를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPinned className="h-4 w-4" />
                  사고 발생 위치 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="위치를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.location === "기타 위치" && (
                <div className="space-y-2">
                  <Label htmlFor="customLocation">상세 위치</Label>
                  <Input
                    id="customLocation"
                    value={formData.customLocation}
                    onChange={(e) => setFormData({ ...formData, customLocation: e.target.value })}
                    placeholder="상세 위치를 입력하세요"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="type">
                  사고 유형 <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="사고 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  사고 상세 설명 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="사고 상황을 자세히 설명해주세요"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  사고 현장 사진 (선택사항)
                </Label>
                <p className="text-sm text-gray-500">최대 5장까지 업로드 가능합니다</p>

                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    disabled={(formData.photos?.length || 0) >= 5}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    사진 업로드 ({formData.photos?.length || 0}/5)
                  </Button>

                  {photoPreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {photoPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`사고 현장 사진 ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                경보 단계 판정 기준
              </CardTitle>
              <CardDescription>현재 상황에 해당하는 항목을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {alarmChecklist.map((criteria, index) => (
                <div key={criteria.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-semibold">
                      {index + 1}
                    </div>
                    <Label className="font-semibold text-base">{criteria.label}</Label>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {criteria.options.map((option) => (
                      <div
                        key={option}
                        onClick={() => setSelectedOptions({ ...selectedOptions, [criteria.id]: option })}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedOptions[criteria.id] === option
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedOptions[criteria.id] === option ? "border-blue-500 bg-blue-500" : "border-gray-300"
                          }`}
                        >
                          {selectedOptions[criteria.id] === option && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <Label className="flex-1 cursor-pointer font-medium">{option}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {expectedAlarm && (
                <div className={`mt-6 p-6 rounded-lg border-4 ${expectedAlarm.color} shadow-lg animate-in fade-in`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">예상 경보: {expectedAlarm.level}</h3>
                      <p className="text-base font-medium mb-3">{expectedAlarm.description}</p>
                      <div className="bg-white/50 rounded-lg p-3 text-sm">
                        <p className="font-semibold mb-1">선택된 기준:</p>
                        <ul className="space-y-1">
                          <li>• 사고 범위: {selectedOptions["scope"]}</li>
                          <li>• 자체조치 가능여부: {selectedOptions["self-response"]}</li>
                          <li>• 인명 피해 여부: {selectedOptions["casualties"]}</li>
                          <li>• 주민 대피여부: {selectedOptions["evacuation"]}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg shadow-lg"
          >
            <Send className="h-5 w-5 mr-2" />
            {isSubmitting ? "신고 접수 중..." : "사고 신고 접수"}
          </Button>
        </div>
      </div>
    </div>
  )
}
