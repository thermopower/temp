import { type NextRequest, NextResponse } from "next/server";
import { incidentService } from "@/lib/container";
import { Incident } from "@/core/domain/incident";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] ===== 승인 API 호출 시작 =====");
    const body = await request.json();

    const {
      approverName,
      approverPosition,
      modifiedIncident,
    } = body;

    // Prepare update data
    const updateData: Partial<Incident> = {};

    if (modifiedIncident) {
      if (modifiedIncident.location) updateData.location = modifiedIncident.location;
      if (modifiedIncident.type) updateData.type = modifiedIncident.type;
      if (modifiedIncident.description) updateData.description = modifiedIncident.description;
      if (modifiedIncident.alarmCriteria) updateData.alarmCriteria = modifiedIncident.alarmCriteria;
      if (modifiedIncident.alertLevel) updateData.alertLevel = modifiedIncident.alertLevel;
      if (modifiedIncident.chemicalType) updateData.selectedChemical = modifiedIncident.chemicalType; // Mapping check needed
      if (modifiedIncident.otherChemicalName) updateData.customChemicalName = modifiedIncident.otherChemicalName;
    }

    if (body.customAlertMessage) updateData.customAlertMessage = body.customAlertMessage;
    if (body.isMessageModified !== undefined) updateData.isMessageModified = body.isMessageModified;
    if (body.isLimitedTest !== undefined) updateData.isLimitedTest = body.isLimitedTest;
    if (body.isTraining !== undefined) updateData.isTraining = body.isTraining;

    const updatedIncident = await incidentService.approveIncident(params.id, approverName, updateData);

    let successMessage = `${approverName} ${approverPosition}님이 승인하였습니다.`;
    if (updatedIncident.isTraining) successMessage += " (훈련 상황)";

    if (updatedIncident.notificationsSent > 0) {
      successMessage += ` ${updatedIncident.notificationsSent}명에게 SMS가 발송되었습니다.`;
    } else {
      successMessage += ` SMS 발송이 생략되었습니다.`;
    }

    return NextResponse.json({
      success: true,
      incident: updatedIncident,
      smsSent: updatedIncident.notificationsSent > 0,
      message: successMessage,
    });

  } catch (error) {
    console.error("[v0] 승인 및 SMS 발송 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "승인 및 SMS 발송에 실패했습니다",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}
