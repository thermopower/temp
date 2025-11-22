import { type NextRequest, NextResponse } from "next/server";
import { incidentService } from "@/lib/container";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { endedBy } = await request.json();

    if (!endedBy) {
      return NextResponse.json({ success: false, error: "종료자 정보 누락" }, { status: 400 });
    }

    const incident = await incidentService.endTraining(params.id, endedBy);

    return NextResponse.json({
      success: true,
      incident,
      message: "훈련이 종료되었습니다."
    });
  } catch (error) {
    console.error("[v0] 훈련 종료 처리 오류:", error);
    return NextResponse.json({ success: false, error: "훈련 종료 처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
