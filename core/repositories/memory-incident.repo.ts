import { Incident } from "../domain/incident";
import { IncidentRepository } from "./incident.repository";

export class MemoryIncidentRepository implements IncidentRepository {
    // 초기 데이터 (기존 lib/incident-store.ts 데이터 이관 및 타입 수정)
    private static incidents: Incident[] = [
        {
            id: "INC-EXAMPLE-001",
            location: "암모니아 저장 탱크",
            type: "유해물질 누출",
            description:
                "M-TK-01B 암모니아 저장탱크 상부 배관 연결부 플랜지에서 누출 감지. 현장 작업자가 자극성 냄새 감지 후 즉시 신고. 누출량 약 5kg/hr 추정. 현재 탱크 압력 8.5 bar, 온도 -33°C 정상 범위 내 유지 중.",
            reportedAt: new Date(Date.now() - 15 * 60 * 1000),
            reportedBy: "김다혜",
            status: "pending_approval",
            alertLevel: "yellow", // "황색경보" -> "yellow" 수정
            notificationsSent: 0,
            contactsNotified: [],
            evacuationRequired: true,
            reportDetails: {
                reporterName: "김다혜",
                reporterPhone: "010-1234-5678",
                reporterCompany: "임시출입자",
                severity: "major",
                timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            },
            alarmCriteria: {
                scope: "사업장 외부",
                selfResponse: "불가능",
                casualties: "없음",
                evacuation: "불필요",
            },
            isLimitedTest: false,
        },
        {
            id: "INC-TRAINING-001",
            location: "발전설비동 2호기",
            type: "화재 발생",
            description:
                "[훈련 상황] 2호기 터빈 베어링 과열로 인한 화재 훈련. 초동조치반 소화전 5조 출동, 구호반 2조 대기, 홍보반 언론 대응 준비. 훈련 시나리오에 따라 대응 절차를 점검 중입니다.",
            reportedAt: new Date(Date.now() - 25 * 60 * 1000),
            reportedBy: "박발전",
            status: "active",
            alertLevel: "yellow", // "황색경보" -> "yellow" 수정
            notificationsSent: 15,
            contactsNotified: ["010-1111-2222", "010-3333-4444", "010-5555-6666"],
            evacuationRequired: false,
            reportDetails: {
                reporterName: "박발전",
                reporterPhone: "010-2345-6789",
                reporterCompany: "GS동해전력",
                severity: "major",
                timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            },
            alarmCriteria: {
                scope: "사업장 내부",
                selfResponse: "가능",
                casualties: "없음",
                evacuation: "불필요",
            },
            isLimitedTest: false,
            isTraining: true,
            trainingEndedAt: undefined, // null -> undefined
            approvedBy: "박발전",
            approvedAt: new Date(Date.now() - 24 * 60 * 1000),
        },
    ];

    async findAll(): Promise<Incident[]> {
        // 최신순 정렬 (reportedAt 내림차순)
        return [...MemoryIncidentRepository.incidents].sort(
            (a, b) => b.reportedAt.getTime() - a.reportedAt.getTime()
        );
    }

    async findById(id: string): Promise<Incident | null> {
        const incident = MemoryIncidentRepository.incidents.find((i) => i.id === id);
        // Return a shallow copy to prevent direct mutation from outside
        return incident ? { ...incident } : null;
    }

    async create(incident: Incident): Promise<Incident> {
        MemoryIncidentRepository.incidents.push(incident);
        return { ...incident };
    }

    async update(id: string, updatedData: Partial<Incident>): Promise<Incident | null> {
        const index = MemoryIncidentRepository.incidents.findIndex((i) => i.id === id);
        if (index === -1) return null;

        const current = MemoryIncidentRepository.incidents[index];
        const updated = { ...current, ...updatedData };

        // 배열 교체
        MemoryIncidentRepository.incidents[index] = updated;
        return { ...updated };
    }

    async delete(id: string): Promise<boolean> {
        const index = MemoryIncidentRepository.incidents.findIndex((i) => i.id === id);
        if (index === -1) return false;

        MemoryIncidentRepository.incidents.splice(index, 1);
        return true;
    }
}
