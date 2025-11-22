import { z } from "zod";

// -----------------------------------------------------------------------------
// Enums & Basic Types
// -----------------------------------------------------------------------------

export const AlertLevelSchema = z.enum(["white", "blue", "yellow", "red"]);
export type AlertLevel = z.infer<typeof AlertLevelSchema>;

export const HazardousMaterialSchema = z.enum([
    "ammonia",
    "hydrochloric_acid",
    "byproduct_fuel_oil",
    "hydrogen",
]);
export type HazardousMaterial = z.infer<typeof HazardousMaterialSchema>;

export const IncidentStatusSchema = z.enum(["pending_approval", "active", "resolved"]);
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

export const SeveritySchema = z.enum(["minor", "moderate", "major", "critical"]);
export type Severity = z.infer<typeof SeveritySchema>;

// -----------------------------------------------------------------------------
// Sub-schemas
// -----------------------------------------------------------------------------

export const ReportDetailsSchema = z.object({
    reporterName: z.string(),
    reporterPhone: z.string(),
    reporterCompany: z.string().optional(),
    severity: SeveritySchema,
    timestamp: z.string(), // 기존 데이터 유지 (ISO String)
});

export const AlarmCriteriaSchema = z.object({
    scope: z.string(),
    selfResponse: z.string(),
    casualties: z.string(),
    evacuation: z.string(),
});

export const EmergencyResponseSchema = z.object({
    commandCenter: z.string(),
    evacuationRoute: z.string(),
    affectedRadius: z.string(),
    equipmentUsed: z.array(z.string()),
    externalAgencies: z.array(z.string()),
    responseTeams: z.array(z.string()).optional(),
    currentActions: z.array(z.string()).optional(),
    nextSteps: z.array(z.string()).optional(),
    estimatedResolutionTime: z.string().optional(),
});

// -----------------------------------------------------------------------------
// Main Incident Schema
// -----------------------------------------------------------------------------

export const IncidentSchema = z.object({
    id: z.string(),
    location: z.string(),
    type: z.string(),
    hazardousMaterial: HazardousMaterialSchema.optional(),
    description: z.string(),
    // 도메인 내부에서는 Date 객체로 관리하는 것이 원칙이나,
    // 기존 데이터와의 호환성을 위해 string(ISO) 또는 Date 모두 허용하고
    // 변환 로직을 두는 것이 안전함. 여기서는 우선 Date로 정의하되,
    // 입력 시 string도 받을 수 있도록 z.coerce.date() 사용 고려.
    // 하지만 기존 store가 string을 저장하고 있었으므로,
    // 리팩토링 과정에서 Date 객체로 변환하여 저장하도록 함.
    reportedAt: z.coerce.date(),
    reportedBy: z.string(),
    status: IncidentStatusSchema,
    alertLevel: AlertLevelSchema,
    notificationsSent: z.number().default(0),
    contactsNotified: z.array(z.string()).default([]),
    evacuationRequired: z.boolean(),

    // Optional Fields
    affectedArea: z.string().optional(),
    estimatedDamage: z.string().optional(),
    recoveryTime: z.string().optional(),
    emergencyResponse: EmergencyResponseSchema.optional(),

    approvedBy: z.string().optional(),
    approvedAt: z.coerce.date().optional(),

    reportDetails: ReportDetailsSchema.optional(),

    isLimitedTest: z.boolean().optional(),
    alarmCriteria: AlarmCriteriaSchema.optional(),

    customAlertMessage: z.string().optional(),
    isMessageModified: z.boolean().optional(),

    reviewedBy: z.string().optional(),
    reviewedAt: z.coerce.date().optional(),

    actionCompleted: z.boolean().optional(),
    actionDetails: z.string().optional(),
    actionCompletedBy: z.string().optional(),
    actionCompletedAt: z.coerce.date().optional(),

    selectedChemical: z.string().optional(),
    customChemicalName: z.string().optional(),

    isTraining: z.boolean().optional(),
    trainingEndedBy: z.string().optional(),
    trainingEndedAt: z.coerce.date().optional(),
});

export type Incident = z.infer<typeof IncidentSchema>;

// -----------------------------------------------------------------------------
// DTOs
// -----------------------------------------------------------------------------

export const CreateIncidentDTOSchema = IncidentSchema.omit({
    id: true,
    reportedAt: true,
    status: true,
    notificationsSent: true,
    contactsNotified: true,
}).extend({
    // 생성 시 필요한 추가 필드나 오버라이드
    reportedAt: z.string().optional(), // 클라이언트에서 보낼 때 string일 수 있음
});

export type CreateIncidentDTO = z.infer<typeof CreateIncidentDTOSchema>;
