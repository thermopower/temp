import { IncidentRepository } from "../repositories/incident.repository";
import { NotificationService } from "./notification.service";
import { CreateIncidentDTO, Incident, AlertLevel, AlarmCriteriaSchema } from "../domain/incident";
import { z } from "zod";

type AlarmCriteria = z.infer<typeof AlarmCriteriaSchema>;
type ScoreRule<T> = (criteria: T) => number;

export class IncidentService {
    constructor(
        private repo: IncidentRepository,
        private notificationService: NotificationService
    ) { }

    async getAllIncidents(): Promise<Incident[]> {
        return this.repo.findAll();
    }

    async getIncidentById(id: string): Promise<Incident | null> {
        return this.repo.findById(id);
    }

    async reportIncident(dto: CreateIncidentDTO): Promise<Incident> {
        // 1. 경보 단계 판정
        const alertLevel = this.determineAlertLevel(dto.reportDetails?.severity || "minor", dto.alarmCriteria);

        // 2. 엔티티 생성
        const newIncident: Incident = {
            id: `INC-${Date.now()}`,
            location: dto.location,
            type: dto.type,
            hazardousMaterial: dto.hazardousMaterial,
            description: dto.description,
            reportedAt: dto.reportedAt ? new Date(dto.reportedAt) : new Date(),
            reportedBy: dto.reportedBy,
            status: "pending_approval",
            alertLevel: alertLevel,
            notificationsSent: 0,
            contactsNotified: [],
            evacuationRequired: dto.evacuationRequired,
            affectedArea: dto.affectedArea,
            estimatedDamage: dto.estimatedDamage,
            recoveryTime: dto.recoveryTime,
            emergencyResponse: dto.emergencyResponse,
            reportDetails: dto.reportDetails,
            alarmCriteria: dto.alarmCriteria,
            isLimitedTest: dto.isLimitedTest,
            customAlertMessage: dto.customAlertMessage,
            isMessageModified: dto.isMessageModified,
            selectedChemical: dto.selectedChemical,
            customChemicalName: dto.customChemicalName,
            isTraining: dto.isTraining,
        };

        // 3. 저장
        return await this.repo.create(newIncident);
    }

    async approveIncident(id: string, approverName: string, updateData?: Partial<Incident>): Promise<Incident> {
        return this.updateIncident(id, async (incident) => {
            // 1. 새로운 상태 객체 생성 (불변성 유지)
            const updatedState: Incident = {
                ...incident,
                ...(updateData || {}),
                status: "active",
                approvedBy: approverName,
                approvedAt: new Date(),
            };

            // 2. SMS 발송 (황색/적색 경보일 경우에만)
            if (updatedState.alertLevel === "yellow" || updatedState.alertLevel === "red") {
                const result = await this.notificationService.sendIncidentAlert(updatedState);
                // SMS 결과도 불변성 유지하며 병합
                return {
                    ...updatedState,
                    notificationsSent: result.sentCount,
                    contactsNotified: result.recipients
                };
            }

            return updatedState;
        });
    }

    async deleteIncident(id: string): Promise<boolean> {
        return this.repo.delete(id);
    }

    async completeAction(id: string, details: string, completedBy: string): Promise<Incident> {
        return this.updateIncident(id, (incident) => ({
            ...incident,
            actionCompleted: true,
            actionDetails: details,
            actionCompletedBy: completedBy,
            actionCompletedAt: new Date(),
            status: "resolved"
        }));
    }

    async endTraining(id: string, endedBy: string): Promise<Incident> {
        return this.updateIncident(id, (incident) => ({
            ...incident,
            trainingEndedBy: endedBy,
            trainingEndedAt: new Date(),
            status: "resolved"
        }));
    }

    // Generic Helper for State Updates
    private async updateIncident(
        id: string,
        updateFn: (incident: Incident) => Promise<Incident> | Incident
    ): Promise<Incident> {
        const incident = await this.repo.findById(id);
        if (!incident) throw new Error("사고를 찾을 수 없습니다.");

        const updated = await updateFn(incident);
        await this.repo.update(id, updated);
        return updated;
    }

    // Alert Level Determination Logic
    private readonly alertScoreRules: ScoreRule<AlarmCriteria>[] = [
        // 사고 범위
        c => c.scope === "사업장 외부" ? 2 : (c.scope === "사업장 내부" ? 1 : 0),
        // 자체조치 가능 여부 (DTO 필드명 확인 필요, 여기서는 camelCase 가정)
        c => {
            const val = c.selfResponse || (c as any)["self-response"];
            return val === "불가능" ? 2 : (val === "가능(밸브 등)" ? 1 : 0);
        },
        // 인명 피해
        c => c.casualties === "있음" ? 2 : 0,
        // 주민 대피
        c => c.evacuation === "필요" ? 2 : 0
    ];

    private calculateScore<T>(criteria: T, rules: ScoreRule<T>[]): number {
        return rules.reduce((total, rule) => total + rule(criteria), 0);
    }

    private determineAlertLevel(severity: string, alarmCriteria?: AlarmCriteria): AlertLevel {
        if (alarmCriteria) {
            const totalScore = this.calculateScore(alarmCriteria, this.alertScoreRules);

            if (totalScore >= 6) return "red";
            if (totalScore >= 4) return "yellow";
            if (totalScore >= 2) return "blue";
        }

        switch (severity) {
            case "critical": return "red";
            case "major": return "yellow";
            case "moderate": return "blue";
            default: return "white";
        }
    }
}
