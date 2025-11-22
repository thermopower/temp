export type AlertLevel = "white" | "blue" | "yellow" | "red"

// 유해물질 타입 (실제 대상물질)
export type HazardousMaterial = "ammonia" | "hydrochloric_acid" | "byproduct_fuel_oil" | "hydrogen"

// 비상조직 역할 타입 (실제 조직 구조)
export type EmergencyRole =
  | "commander" // 총괄지휘대장
  | "emergency_operation_manager" // 비상운전실장
  | "control_manager" // 통제실장
  | "support_manager" // 지원실장
  | "pr_manager" // 홍보실장
  | "recovery_manager" // 복구실장
  | "field_response_leader" // 현장대응반장
  | "emergency_contact_leader" // 긴급연락반장
  | "security_guide_leader" // 경계유도반장
  | "rescue_leader" // 구호반장
  | "initial_response_leader" // 초동조치반장
  | "support_leader" // 지원반장
  | "recovery_leader" // 복구반장
  | "pr_leader" // 홍보반장

// 사용자/연락처 타입 (실제 조직 반영)
export type Role = "employee" | "partner" | "visitor";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  role: Role;
  department?: string;
  company?: string;
  emergencyRole?: EmergencyRole;
  isActive: boolean;
  building?: string; // 상주 건물
  shift?: string; // 교대 근무
  emergencyRoleDescription?: string; // D열: 역할 (비상 대응 역할)
  emergencyDuty?: string; // E열: 임무 (비상 대응 임무)
}


// 사고 정보 타입 (실제 매뉴얼 반영)
export interface Incident {
  id: string
  location: string
  type: string
  hazardousMaterial?: HazardousMaterial
  description: string
  reportedAt: Date
  reportedBy: string
  status: "pending_approval" | "active" | "resolved"
  alertLevel: AlertLevel
  notificationsSent: number
  contactsNotified: string[]
  evacuationRequired: boolean
  affectedArea?: string // 피해 영향 범위
  estimatedDamage?: string // 예상 손실
  recoveryTime?: string // 예상 복구 시간
  emergencyResponse?: EmergencyResponse // 비상대응 정보
  approvedBy?: string
  approvedAt?: Date
  reportDetails?: {
    reporterName: string
    reporterPhone: string
    reporterCompany?: string
    severity: "minor" | "moderate" | "major" | "critical"
    timestamp: string
  }
  isLimitedTest?: boolean
  alarmCriteria?: {
    scope: string // 사고 범위
    selfResponse: string // 자체조치 가능여부
    casualties: string // 인명 피해여부
    evacuation: string // 주민 대피여부
  }
  customAlertMessage?: string // 파트장이 수정한 경보 메시지
  isMessageModified?: boolean // 메시지 수정 여부
  reviewedBy?: string // 검토자 이름
  reviewedAt?: Date // 검토 시각
  actionCompleted?: boolean // 조치 완료 여부
  actionDetails?: string // 조치 사항 상세
  actionCompletedBy?: string // 조치 완료 처리자
  actionCompletedAt?: Date // 조치 완료 시각
  selectedChemical?: string // 선택된 화학물질
  customChemicalName?: string // 그 외 화학물질 선택 시 물질명
  isTraining?: boolean // 훈련 상황인지 여부
  trainingEndedBy?: string // 훈련 종료 처리자
  trainingEndedAt?: Date // 훈련 종료 시각
}

// 알림 상태 타입
export interface NotificationStatus {
  contactId: string
  incidentId: string
  sentAt: Date
  deliveredAt?: Date
  readAt?: Date
  status: "sent" | "delivered" | "read" | "failed"
  alertLevel: AlertLevel
  customMessage?: string // 역할별 맞춤 메시지
}

// 사고 신고 폼 데이터 (실제 매뉴얼 반영)
export interface IncidentReportForm {
  // Personal Information (새로 추가)
  reporterName: string
  reporterPhone: string
  reporterCompany?: string // 자동 감지된 회사명

  location: string
  type: string
  hazardousMaterial?: HazardousMaterial
  description: string
  severity: "minor" | "moderate" | "major" | "critical" // 심각도
  immediateAction?: string // 즉시 조치사항
  customLocation?: string // 기타 위치 상세 입력
  photos?: File[] // 사고 현장 사진
  selectedChemical?: string // 선택된 화학물질 (염산, 가성소다, 그 외)
  customChemicalName?: string // 그 외 화학물질 선택 시 물질명
}

// 대피 정보 타입
export interface EvacuationInfo {
  alertLevel: AlertLevel
  incidentType: "leak" | "fire_explosion"
  evacuationSite: string
  evacuationRoute: string
  specialInstructions?: string
  estimatedTime: number // 예상 대피 시간(분)
  emergencyContacts: string[] // 비상연락처
}

// 유관기관 연락처 타입
export interface ExternalContact {
  id: string
  organization: string
  department?: string
  phone: string
  emergencyPhone?: string
  alertLevels: AlertLevel[] // 어떤 경보 단계에서 연락할지
  contactPerson?: string
}

export interface AlertMessage {
  alertLevel: AlertLevel
  incidentType: string
  location: string
  evacuationInfo?: EvacuationInfo
  customInstructions: string
  timestamp: Date
}

// 비상대응 정보 타입
export interface EmergencyResponse {
  commandCenter: string
  evacuationRoute: string
  affectedRadius: string
  equipmentUsed: string[]
  externalAgencies: string[]
  responseTeams?: string[]
  currentActions?: string[]
  nextSteps?: string[]
  estimatedResolutionTime?: string
}
