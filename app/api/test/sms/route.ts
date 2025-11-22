import { NextResponse } from "next/server";
import type { Incident } from "@/core/domain/incident";

/**
 * SMS 테스트 API
 * 
 * 실제 SMS를 발송하지 않고 메시지 생성 로직만 테스트합니다.
 * 
 * Query Parameters:
 * - mode: "preview" | "test" | "validate"
 *   - preview: 메시지 미리보기만 (발송 X)
 *   - test: 지정된 테스트 번호로만 발송
 *   - validate: 연락처 조회 및 메시지 생성 검증
 */
export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get("mode") || "preview";
        const body = await request.json();

        console.log(`[SMS Test API] 모드: ${mode}`);

        // 테스트용 사고 데이터 생성
        const testIncident: Incident = {
            id: `TEST-${Date.now()}`,
            location: body.location || "암모니아 저장탱크",
            type: body.type || "화학물질 누출 (테스트)",
            description: body.description || "테스트용 사고 시나리오입니다. 실제 상황이 아닙니다.",
            reportedAt: new Date(),
            reportedBy: body.reportedBy || "테스트 관리자",
            status: "pending_approval",
            alertLevel: body.alertLevel || "yellow",
            notificationsSent: 0,
            contactsNotified: [],
            evacuationRequired: body.evacuationRequired ?? true,
            isTraining: true, // 테스트는 항상 훈련 모드
            alarmCriteria: body.alarmCriteria || {
                scope: "사업장 외부",
                selfResponse: "불가능",
                casualties: "없음",
                evacuation: "필요"
            }
        };

        switch (mode) {
            case "preview": {
                // 메시지 미리보기 모드
                const { fetchEmployeeContactsFromSheet } = await import("@/lib/google-sheets");
                const { getDongHaeWeather, getSmartEvacuationRecommendation } = await import("@/lib/weather-service");
                const { getLocationLayoutImageUrl } = await import("@/lib/location-mapping");

                // 연락처 조회
                const allContacts = await fetchEmployeeContactsFromSheet();
                const activeContacts = allContacts.filter((c: any) => c.isActive);

                // 기상 정보 조회
                const weatherData = await getDongHaeWeather().catch(() => null);
                const evacuation = weatherData ? getSmartEvacuationRecommendation(
                    testIncident.alertLevel as any,
                    testIncident.type.includes("누출") ? "leak" : "fire_explosion",
                    testIncident.location,
                    weatherData
                ) : null;

                // 위치 배치도 이미지 URL
                const layoutImageUrl = getLocationLayoutImageUrl(testIncident.location);

                // 메시지 생성
                const message = `[훈련 상황] [GS동해전력 비상상황]
🚨 ${testIncident.alertLevel === "yellow" ? "황색경보" : "적색경보"} 발령

📍 사고위치: ${testIncident.location}
🔥 사고종류: ${testIncident.type}
📝 상황: ${testIncident.description}
⏰ 발생시간: ${testIncident.reportedAt.toLocaleString('ko-KR')}
👤 신고자: ${testIncident.reportedBy}

${weatherData ? `🌤️ 현재 기상: ${weatherData.windDirection}풍 ${weatherData.windSpeed}m/s, ${weatherData.temperature}°C` : ''}

${evacuation ? `📍 추천 대피장소: ${evacuation.primarySite}
${evacuation.alternativeSites.length > 0 ? `🔄 대안: ${evacuation.alternativeSites.join(", ")}` : ''}` : ''}

📞 비상상황실: 033-820-1411

${layoutImageUrl ? `📋 위치 배치도: 이미지 첨부됨 (MMS)` : '📋 위치 배치도: 해당 위치 없음'}`;

                return NextResponse.json({
                    success: true,
                    mode: "preview",
                    message: "메시지 미리보기 생성 완료",
                    data: {
                        incident: testIncident,
                        recipientCount: activeContacts.length,
                        sampleRecipients: activeContacts.slice(0, 5).map((c: any) => ({
                            name: c.name,
                            phone: c.phone,
                            role: c.role
                        })),
                        messagePreview: message,
                        layoutImageUrl: layoutImageUrl,
                        weather: weatherData,
                        evacuation: evacuation
                    }
                });
            }

            case "test": {
                // 제한된 테스트 발송 모드
                const testPhones = body.testPhones || [];

                if (testPhones.length === 0) {
                    return NextResponse.json({
                        success: false,
                        error: "테스트 전화번호를 지정해주세요. (testPhones 배열)"
                    }, { status: 400 });
                }

                // 실제 SMS 발송 로직 (테스트 번호로만)
                const { sendSMS } = await import("@/lib/sms");
                const { getLocationLayoutImageUrl } = await import("@/lib/location-mapping");

                const layoutImageUrl = getLocationLayoutImageUrl(testIncident.location);
                const results = [];

                for (const phone of testPhones) {
                    try {
                        const result = await sendSMS({
                            to: phone,
                            message: `[테스트] GS동해전력 비상대응 시스템 SMS 테스트입니다.\n\n테스트 시각: ${new Date().toLocaleString('ko-KR')}\n\n위치 배치도 이미지가 첨부되었습니다.`,
                            imageUrl: layoutImageUrl || undefined
                        });
                        results.push({ phone, success: result.success });
                    } catch (error) {
                        results.push({ phone, success: false, error: String(error) });
                    }
                }

                return NextResponse.json({
                    success: true,
                    mode: "test",
                    message: `${testPhones.length}명에게 테스트 SMS 발송 완료 (이미지 첨부: ${layoutImageUrl ? 'O' : 'X'})`,
                    results,
                    layoutImageUrl
                });
            }

            case "validate": {
                // 검증 모드 - 연락처 조회 및 메시지 생성만
                const { fetchEmployeeContactsFromSheet } = await import("@/lib/google-sheets");
                const { getDongHaeWeather } = await import("@/lib/weather-service");
                const { getLocationLayoutImageUrl } = await import("@/lib/location-mapping");

                const [contacts, weather] = await Promise.all([
                    fetchEmployeeContactsFromSheet().catch(e => ({ error: String(e) })),
                    getDongHaeWeather().catch(e => ({ error: String(e) }))
                ]);

                const contactsValid = Array.isArray(contacts);
                const weatherValid = weather && !('error' in weather);
                const layoutImageUrl = getLocationLayoutImageUrl(testIncident.location);

                return NextResponse.json({
                    success: true,
                    mode: "validate",
                    message: "시스템 검증 완료",
                    validation: {
                        contacts: {
                            valid: contactsValid,
                            count: contactsValid ? contacts.length : 0,
                            error: contactsValid ? null : (contacts as any).error
                        },
                        weather: {
                            valid: weatherValid,
                            data: weatherValid ? weather : null,
                            error: weatherValid ? null : (weather as any).error
                        },
                        incident: {
                            valid: true,
                            alertLevel: testIncident.alertLevel,
                            isTraining: testIncident.isTraining
                        },
                        layoutImage: {
                            valid: !!layoutImageUrl,
                            url: layoutImageUrl
                        }
                    }
                });
            }

            default:
                return NextResponse.json({
                    success: false,
                    error: "유효하지 않은 모드입니다. (preview, test, validate 중 선택)"
                }, { status: 400 });
        }

    } catch (error) {
        console.error("[SMS Test API] 오류:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "알 수 없는 오류"
        }, { status: 500 });
    }
}
