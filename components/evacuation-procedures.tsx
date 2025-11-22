"use client"
import { useState } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, MapPin, Users, Building, Flame, Droplets, ChevronDown, ChevronUp } from "lucide-react"
import type { AlertLevel } from "@/lib/types"

interface EvacuationProceduresProps {
  alertLevel?: AlertLevel
  incidentType?: "leak" | "fire_explosion"
}

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

function CollapsibleSection({ title, icon, children, defaultOpen = false, className = "" }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className={className}>
      <CardHeader
        className="cursor-pointer select-none hover:bg-gray-50 transition-colors py-3 px-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between text-base md:text-lg">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm md:text-base font-semibold">{title}</span>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4 md:h-5 md:w-5" /> : <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />}
        </CardTitle>
      </CardHeader>
      {isOpen && <CardContent className="px-4 pb-4">{children}</CardContent>}
    </Card>
  )
}

// 비상시 대피장소 대상설비
const targetFacilities = ["복수탈염설비", "약품주입설비", "탈질설비", "보조연료유 계통 설비", "수소계통설비"]

// 화재 및 폭발 위험 지역
const fireExplosionRisks = ["부생연료유 탱크", "#1,2 수소룸", "암모니아 저장탱크", "#1,2 보일러 SCR"]

// 누출 위험 지역
const leakageRisks = [
  "암모니아저장탱크",
  "염산저장탱크",
  "#1,2 보일러SCR",
  "암모니아 저장탱크(M-TK-01A, M-TK-01B)",
  "복수탈염 염산 저장탱크(M-TK-11A)",
]

// 황색경보 대피 절차
const yellowAlertProcedures = {
  leak: {
    title: "황색경보 - 누출 사고",
    procedures: [
      "비상운전원 및 구호반 제외한 인원 발전소 외부(구사옥) 대피",
      "경계유도반은 직원 및 인근 사업장 주민 대피 안내",
    ],
    evacuationSite: "구사옥",
  },
  fire_explosion: {
    title: "황색경보 - 화재 및 폭발",
    procedures: ["외부로 우회하여 종합사무동으로 대피"],
    evacuationSite: "종합사무동",
  },
}

// 적색경보 대피 절차
const redAlertProcedures = {
  leak: {
    title: "적색경보 - 누출 사고",
    procedures: [
      "비상운전원 및 구호반 제외한 인원 발전소 외부 대피",
      "경계유도반은 직원 및 인근 사업장 주민 대피 안내",
    ],
    evacuationSites: [
      "동해웰빙타운",
      "동해시청 별관 (비상상황본부 설치, 전직원 대피장소)",
      "삼일고등학교 (삼척)",
      "정라동 주민센터 (삼척)",
      "삼화초등학교",
      "미로초등학교",
      "기타 삼척시 및 동해시 재난안전대책본부에서 정한 대피장소",
    ],
  },
  fire_explosion: {
    title: "적색경보 - 화재 및 폭발",
    procedures: ["전체 인원 즉시 대피"],
    evacuationSites: [
      "동해웰빙타운",
      "동해시청 별관 (비상상황본부 설치, 전직원 대피장소)",
      "삼일고등학교 (삼척)",
      "정라동 주민센터 (삼척)",
      "삼화초등학교",
      "미로초등학교",
      "기타 삼척시 및 동해시 재난안전대책본부에서 정한 대피장소",
    ],
  },
}

export default function EvacuationProcedures({ alertLevel, incidentType }: EvacuationProceduresProps) {
  const getAlertBadgeStyle = (level: AlertLevel) => {
    switch (level) {
      case "white":
        return "bg-gray-100 text-gray-800"
      case "blue":
        return "bg-blue-100 text-blue-800"
      case "yellow":
        return "bg-yellow-100 text-yellow-800"
      case "red":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAlertName = (level: AlertLevel) => {
    switch (level) {
      case "white":
        return "백색경보"
      case "blue":
        return "청색경보"
      case "yellow":
        return "황색경보"
      case "red":
        return "적색경보"
      default:
        return "경보"
    }
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <CollapsibleSection
        title="비상시 대피장소 대상설비"
        icon={<Building className="h-4 w-4 md:h-5 md:w-5" />}
        defaultOpen={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {targetFacilities.map((facility, index) => (
            <Badge key={index} variant="outline" className="justify-start p-2 text-xs md:text-sm">
              {facility}
            </Badge>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="위험 지역"
        icon={<AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />}
        className="border-orange-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-2 md:space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-red-700 text-sm md:text-base">
              <Flame className="h-3 w-3 md:h-4 md:w-4" />
              화재 및 폭발 위험 지역
            </h4>
            <div className="space-y-1 md:space-y-2">
              {fireExplosionRisks.map((risk, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                  <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-500 flex-shrink-0" />
                  <span className="text-xs md:text-sm leading-relaxed">{risk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 md:space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-orange-700 text-sm md:text-base">
              <Droplets className="h-3 w-3 md:h-4 md:w-4" />
              누출 위험 지역
            </h4>
            <div className="space-y-1 md:space-y-2">
              {leakageRisks.map((risk, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                  <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-orange-500 flex-shrink-0" />
                  <span className="text-xs md:text-sm leading-relaxed">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="대피절차"
        icon={<Users className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />}
        className="border-blue-200"
      >
        {alertLevel && (
          <div
            className={`p-3 md:p-4 rounded-lg ${alertLevel === "yellow" ? "bg-yellow-50 border border-yellow-200" : alertLevel === "red" ? "bg-red-50 border border-red-200" : "bg-gray-50 border border-gray-200"}`}
          >
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Badge className={`${getAlertBadgeStyle(alertLevel)} text-xs md:text-sm`}>
                {getAlertName(alertLevel)}
              </Badge>
              <span className="font-semibold text-sm md:text-base">현재 경보 단계 대피 절차</span>
            </div>

            {alertLevel === "yellow" && incidentType && (
              <div className="space-y-3 md:space-y-4">
                <h3 className="font-semibold text-base md:text-lg">{yellowAlertProcedures[incidentType].title}</h3>
                <div className="space-y-2">
                  {yellowAlertProcedures[incidentType].procedures.map((procedure, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 md:p-3 bg-white rounded border">
                      <span className="bg-yellow-500 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-xs md:text-sm leading-relaxed">{procedure}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 md:mt-4 p-3 md:p-4 bg-yellow-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-yellow-700" />
                    <span className="font-semibold text-yellow-700 text-sm md:text-base">지정 대피장소</span>
                  </div>
                  <span className="text-yellow-800 text-base md:text-lg font-semibold">
                    {yellowAlertProcedures[incidentType].evacuationSite}
                  </span>
                </div>
              </div>
            )}

            {alertLevel === "red" && incidentType && (
              <div className="space-y-3 md:space-y-4">
                <h3 className="font-semibold text-base md:text-lg text-red-700">
                  {redAlertProcedures[incidentType].title}
                </h3>
                <div className="space-y-2">
                  {redAlertProcedures[incidentType].procedures.map((procedure, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 md:p-3 bg-white rounded border">
                      <span className="bg-red-500 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-xs md:text-sm leading-relaxed">{procedure}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 md:mt-4 p-3 md:p-4 bg-red-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2 md:mb-3">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-red-700" />
                    <span className="font-semibold text-red-700 text-sm md:text-base">지정 대피장소</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {redAlertProcedures[incidentType].evacuationSites.map((site, index) => (
                      <div key={index} className="p-2 bg-white rounded border text-xs md:text-sm leading-relaxed">
                        <Users className="h-3 w-3 md:h-4 md:w-4 inline mr-2 text-red-500" />
                        {site}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(alertLevel === "white" || alertLevel === "blue") && (
              <div className="text-center py-6 md:py-8 text-gray-500">
                <AlertTriangle className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 opacity-50" />
                <p className="text-sm md:text-base">해당 경보 단계에서는 별도의 대피 절차가 없습니다.</p>
                <p className="text-xs md:text-sm mt-2">현장 대응팀의 지시에 따라 행동하세요.</p>
              </div>
            )}
          </div>
        )}

        {!alertLevel && (
          <div className="space-y-3 md:space-y-4">
            <div className="p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <Badge className="bg-yellow-100 text-yellow-800 text-xs md:text-sm">황색경보</Badge>
                <span className="font-semibold text-sm md:text-base">대피 절차</span>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
                    <Droplets className="h-3 w-3 md:h-4 md:w-4" />
                    누출 사고 시
                  </h4>
                  <ul className="text-xs md:text-sm space-y-1 ml-4 md:ml-6 leading-relaxed">
                    <li>• 비상운전원 및 구호반 제외 인원 → 구사옥 대피</li>
                    <li>• 경계유도반 → 직원 및 인근 사업장 주민 대피 안내</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
                    <Flame className="h-3 w-3 md:h-4 md:w-4" />
                    화재 및 폭발 시
                  </h4>
                  <ul className="text-xs md:text-sm space-y-1 ml-4 md:ml-6 leading-relaxed">
                    <li>• 외부로 우회하여 종합사무동으로 대피</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <Badge className="bg-red-100 text-red-800 text-xs md:text-sm">적색경보</Badge>
                <span className="font-semibold text-sm md:text-base">대피 절차</span>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
                    <Droplets className="h-3 w-3 md:h-4 md:w-4" />
                    누출 사고 시
                  </h4>
                  <ul className="text-xs md:text-sm space-y-1 ml-4 md:ml-6 leading-relaxed">
                    <li>• 비상운전원 및 구호반 제외 인원 → 발전소 외부 대피</li>
                    <li>• 경계유도반 → 직원 및 인근 사업장 주민 대피 안내</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
                    <Flame className="h-3 w-3 md:h-4 md:w-4" />
                    화재 및 폭발 시
                  </h4>
                  <ul className="text-xs md:text-sm space-y-1 ml-4 md:ml-6 leading-relaxed">
                    <li>• 전체 인원 즉시 대피</li>
                  </ul>
                </div>
                <div className="mt-3 md:mt-4 p-2 md:p-3 bg-red-100 rounded">
                  <h5 className="font-semibold text-red-700 mb-2 text-sm md:text-base">주요 대피장소</h5>
                  <div className="text-xs md:text-sm space-y-1 leading-relaxed">
                    <div>• 동해웰빙타운</div>
                    <div>• 동해시청 별관 (비상상황본부)</div>
                    <div>• 삼일고등학교, 삼화초등학교, 미로초등학교</div>
                    <div>• 정라동 주민센터</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="주요 비상연락망"
        icon={<AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />}
        className="border-green-200"
        defaultOpen={true}
      >
        <div className="space-y-2">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-800 text-sm md:text-base">긴급 구조</span>
            </div>
            <div className="text-sm md:text-base text-red-700 space-y-1">
              <div className="flex justify-between items-center">
                <span>소방서 (최우선 신고)</span>
                <span className="font-bold">119</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800 text-sm md:text-base">유관기관</span>
            </div>
            <div className="text-sm md:text-base text-green-700 space-y-1">
              <div className="flex justify-between items-center">
                <span>동해소방서</span>
                <span className="font-mono">033-530-843</span>
              </div>
              <div className="flex justify-between items-center">
                <span>북평119안전센터</span>
                <span className="font-mono">033-521-5119</span>
              </div>
              <div className="flex justify-between items-center">
                <span>산업단지공단 동해지사</span>
                <span className="font-mono">070-8895-7663</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800 text-sm md:text-base">사내 비상연락</span>
            </div>
            <div className="text-sm md:text-base text-blue-700 space-y-1">
              <div className="flex justify-between items-center">
                <span>비상상황실</span>
                <span className="font-mono font-bold">033-820-1411</span>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}
