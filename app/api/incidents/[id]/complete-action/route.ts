import { type NextRequest, NextResponse } from "next/server";
import { incidentService } from "@/lib/container";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { actionDetails, completedBy } = await request.json();

        if (!actionDetails || !completedBy) {
            return NextResponse.json({ success: false, error: "필수 정보 누락" }, { status: 400 });
        }

        const incident = await incidentService.completeAction(params.id, actionDetails, completedBy);

        return NextResponse.json({
            success: true,
            incident,
            message: "조치가 완료되었습니다."
        });
    } catch (error) {
        console.error("[v0] 조치 완료 처리 오류:", error);
        return NextResponse.json({ success: false, error: "조치 완료 처리 중 오류가 발생했습니다" }, { status: 500 });
    }
}
