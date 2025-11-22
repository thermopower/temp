import { type NextRequest, NextResponse } from "next/server";
import { incidentService } from "@/lib/container";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const incident = await incidentService.getIncidentById(params.id);

    if (!incident) {
      return NextResponse.json({ success: false, error: "사고를 찾을 수 없습니다" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      incident,
    });
  } catch (error) {
    console.error("[v0] 사고 조회 오류:", error);
    return NextResponse.json({ success: false, error: "사고 조회 중 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { approverName, approverPosition } = await request.json();

    if (!approverName || !approverPosition) {
      return NextResponse.json({ success: false, error: "승인 권한자 정보가 필요합니다" }, { status: 400 });
    }

    const incident = await incidentService.getIncidentById(params.id);

    if (!incident) {
      return NextResponse.json({ success: false, error: "사고를 찾을 수 없습니다" }, { status: 404 });
    }

    await incidentService.deleteIncident(params.id);

    console.log(`[v0] 사고 삭제: ${params.id}`);
    console.log(`[v0] 삭제자: ${approverName} (${approverPosition})`);

    return NextResponse.json({
      success: true,
      message: `${approverName} ${approverPosition}님이 사고를 삭제했습니다.`,
      deletedIncident: incident,
    });
  } catch (error) {
    console.error("[v0] 사고 삭제 오류:", error);
    return NextResponse.json({ success: false, error: "사고 삭제 중 오류가 발생했습니다" }, { status: 500 });
  }
}
