import { NextResponse } from "next/server";
import { incidentService } from "@/lib/container";

export async function GET() {
  try {
    const incidents = await incidentService.getAllIncidents();
    console.log("[v0] 사고 데이터 조회 - 현재 저장된 사고:", incidents.length);

    return NextResponse.json({
      success: true,
      incidents: incidents,
      message: incidents.length === 0 ? "저장된 사고가 없습니다." : `${incidents.length}건의 사고가 조회되었습니다.`,
    });
  } catch (error) {
    console.error("사고 데이터 조회 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: "사고 데이터를 불러올 수 없습니다",
        incidents: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[v0] =====사고 신고 처리 시작=====");

    // 1. 사고 생성
    const incident = await incidentService.reportIncident(body);
    console.log("[v0] 사고 저장 완료 ID:", incident.id);

    // 2. (기존 로직 유지) 즉시 승인 및 SMS 발송
    // 원래 코드는 POST에서 바로 SMS를 보냈으므로, 여기서 approveIncident를 호출하여 처리합니다.
    console.log("[v0] =====SMS 발송 프로세스 시작 (자동 승인)=====");
    const approvedIncident = await incidentService.approveIncident(incident.id, incident.reportedBy);

    console.log("[v0] =====사고 신고 처리 완료=====");
    return NextResponse.json({
      success: true,
      incident: approvedIncident,
      message: `사고가 성공적으로 접수되었습니다. ${approvedIncident.notificationsSent || 0}명에게 문자가 발송되었습니다.`,
    });
  } catch (error) {
    console.error("[v0] =====사고 신고 처리 실패=====", error);
    return NextResponse.json(
      {
        success: false,
        error: "사고 신고를 처리할 수 없습니다",
      },
      { status: 500 }
    );
  }
}
