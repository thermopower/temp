import { Incident } from "../domain/incident";
import { fetchEmployeeContactsFromSheet, Employee } from "@/lib/google-sheets";
import { getDongHaeWeather, getSmartEvacuationRecommendation } from "@/lib/weather-service";
import { sendSMS } from "@/lib/sms";
import { getLocationLayoutUrl } from "@/lib/location-mapping";

// -----------------------------------------------------------------------------
// Types & Interfaces
// -----------------------------------------------------------------------------

interface WeatherContext {
    windDirection: string;
    windSpeed: number;
    temperature: number;
}

interface EvacuationContext {
    primarySite: string;
    alternativeSites: string[];
}

interface MessageContext {
    weather?: WeatherContext | null;
    evacuation?: EvacuationContext | null;
    isTraining: boolean;
}

type MessageBuilder = (incident: Incident, context: MessageContext) => string;
type MessagePartBuilder = (incident: Incident, context: MessageContext) => string | null;

// -----------------------------------------------------------------------------
// Pure Helper Functions (Message Builders)
// -----------------------------------------------------------------------------

const formatTimestamp = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const getAlertLevelLabel = (level: string): string => {
    switch (level) {
        case "white": return "백색경보";
        case "blue": return "청색경보";
        case "yellow": return "황색경보";
        case "red": return "적색경보";
        default: return level;
    }
};

const getChemicalManualUrl = (chemicalType?: string, location?: string, type?: string): string | null => {
    if (chemicalType === "염산(염화수소)") return "https://drive.google.com/file/d/1KMDIx1gKcgf-T_uiET-BpZv7HcnrJn7R/view?usp=sharing";
    if (chemicalType === "가성소다(수산화나트륨)") return "https://drive.google.com/file/d/1xtN8Kc-Uv0g2d9Etow1NRTMt-77fNXUQ/view?usp=sharing";
    if (location?.includes("암모니아") || type?.includes("암모니아")) return "https://drive.google.com/file/d/1zISJlUUAkRfLjQpeOXDTBh_IYybu8XwG/view?usp=sharing";
    return null;
};

// Message Part Builders
const buildHeader: MessagePartBuilder = (incident, context) => {
    const trainingPrefix = context.isTraining ? "[훈련 상황] " : "";
    const alertLabel = getAlertLevelLabel(incident.alertLevel);
    return `${trainingPrefix}[GS동해전력 비상상황]\n🚨 ${alertLabel} 발령`;
};

const buildBasicInfo: MessagePartBuilder = (incident) => {
    const timestamp = formatTimestamp(incident.reportedAt);
    return `📍 사고위치: ${incident.location}\n🔥 사고종류: ${incident.type}\n📝 상황: ${incident.description}\n⏰ 발생시간: ${timestamp}\n👤 신고자: ${incident.reportedBy}`;
};

const buildWeatherInfo: MessagePartBuilder = (_, context) => {
    if (!context.weather) return null;
    return `🌤️ 현재 기상: ${context.weather.windDirection}풍 ${context.weather.windSpeed}m/s, ${context.weather.temperature}°C`;
};

const buildEvacuationInfo: MessagePartBuilder = (_, context) => {
    if (!context.evacuation) return null;
    let msg = `📍 추천 대피장소: ${context.evacuation.primarySite}`;
    if (context.evacuation.alternativeSites.length > 0) {
        msg += `\n🔄 대안: ${context.evacuation.alternativeSites.join(", ")}`;
    }
    return msg;
};

const buildFooter: MessagePartBuilder = (incident) => {
    let msg = `📞 비상상황실: 033-820-1411`;

    const layoutUrl = getLocationLayoutUrl(incident.location);
    if (layoutUrl) msg += `\n\n📋 위치 배치도:\n${layoutUrl}`;

    const manualUrl = getChemicalManualUrl(incident.selectedChemical, incident.location, incident.type);
    if (manualUrl) msg += `\n\n🔗 상세 대응 매뉴얼:\n${manualUrl}`;

    return msg;
};

// Main Message Composer
const composeMessage = (builders: MessagePartBuilder[]): MessageBuilder => {
    return (incident, context) => {
        return builders
            .map(builder => builder(incident, context))
            .filter((part): part is string => part !== null)
            .join("\n\n");
    };
};

// Pre-configured Builders
const alertMessageBuilder = composeMessage([
    buildHeader,
    buildBasicInfo,
    buildWeatherInfo,
    buildEvacuationInfo,
    buildFooter
]);

// -----------------------------------------------------------------------------
// Service Class
// -----------------------------------------------------------------------------

export class NotificationService {
    async sendIncidentAlert(incident: Incident): Promise<{ sentCount: number; recipients: string[] }> {
        console.log("[NotificationService] SMS 발송 프로세스 시작");

        // 1. Data Fetching (Parallel)
        const [allContacts, weatherData] = await Promise.all([
            fetchEmployeeContactsFromSheet() as Promise<Employee[]>,
            getDongHaeWeather().catch(e => {
                console.error("[NotificationService] Weather fetch failed", e);
                return null;
            })
        ]);

        // 2. Context Preparation
        const activeContacts = this.filterActiveContacts(allContacts);
        const recipients = activeContacts.length > 0 ? activeContacts : this.getFallbackContacts();

        const smartEvacuation = weatherData ? getSmartEvacuationRecommendation(
            incident.alertLevel as any,
            incident.type.includes("누출") ? "leak" : "fire_explosion",
            incident.location,
            weatherData
        ) : null;

        const context: MessageContext = {
            weather: weatherData,
            evacuation: smartEvacuation,
            isTraining: incident.isTraining || false
        };

        // 3. Message Generation (Pure)
        const smsMessage = alertMessageBuilder(incident, context);

        // 4. Execution (Side Effects)
        console.log(`[NotificationService] Sending initial SMS to ${recipients.length} recipients`);
        const results = await this.sendBulkSMS(recipients, smsMessage);

        // 5. Role-based Follow-up (Async Side Effect)
        if (incident.alertLevel === "yellow" || incident.alertLevel === "red") {
            this.scheduleRoleBasedSMS(recipients, incident, context);
        }

        const successResults = results.filter(r => r.success);
        return {
            sentCount: successResults.length,
            recipients: successResults.map(r => r.name)
        };
    }

    // Helper Methods
    private filterActiveContacts(contacts: Employee[]): Employee[] {
        return contacts.filter(c => c.isActive && c.phone && c.phone.trim() !== "");
    }

    private getFallbackContacts(): any[] {
        return [
            { phone: "01012345678", name: "발전파트장", id: "fb1", isActive: true, role: "employee" },
            { phone: "01023456789", name: "대표이사", id: "fb2", isActive: true, role: "employee" },
            { phone: "01034567890", name: "비상대응팀장", id: "fb3", isActive: true, role: "employee" },
        ];
    }

    private async sendBulkSMS(recipients: Employee[], message: string) {
        return Promise.all(recipients.map(async (c) => {
            try {
                const res = await sendSMS({ to: c.phone, message });
                return { success: res.success, name: c.name, phone: c.phone };
            } catch (e) {
                console.error(`[NotificationService] Failed to send to ${c.name}`, e);
                return { success: false, name: c.name, phone: c.phone };
            }
        }));
    }

    private scheduleRoleBasedSMS(recipients: Employee[], incident: Incident, context: MessageContext) {
        const roleContacts = recipients.filter(c => c.emergencyRoleDescription || c.emergencyDuty);
        if (roleContacts.length === 0) return;

        console.log(`[NotificationService] Scheduling Role/Duty SMS for ${roleContacts.length} recipients`);

        setTimeout(async () => {
            const trainingPrefix = context.isTraining ? "[훈련 상황] " : "";

            for (const c of roleContacts) {
                let roleMsg = `${trainingPrefix}[GS동해전력 비상상황 - 개인 임무]\n👤 ${c.name}님\n\n🎯 귀하의 역할: ${c.emergencyRoleDescription || "미지정"}\n📋 임무사항: ${c.emergencyDuty || "미지정"}`;

                if (context.weather && context.evacuation) {
                    roleMsg += `\n\n🌤️ 기상정보: ${context.weather.windDirection}풍 ${context.weather.windSpeed}m/s\n📍 대피장소: ${context.evacuation.primarySite}`;
                }

                roleMsg += `\n\n📞 비상상황실: 033-820-1411`;

                await sendSMS({ to: c.phone, message: roleMsg }).catch(console.error);
            }
        }, 3000);
    }
}
