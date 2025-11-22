import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone } from "lucide-react"
import Link from "next/link"

export default function EmergencyContactsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              메인으로
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Phone className="h-8 w-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">유관기관 비상연락망 및 긴급연락 담당자</h1>
              <p className="text-gray-600">개정일자: 2025.05.26.</p>
            </div>
          </div>
        </div>

        {/* 비상연락망 테이블 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="border border-gray-300 px-3 py-3 text-center font-semibold">구분</th>
                  <th className="border border-gray-300 px-3 py-3 text-center font-semibold">내용</th>
                  <th className="border border-gray-300 px-3 py-3 text-center font-semibold">대외기관</th>
                  <th className="border border-gray-300 px-3 py-3 text-center font-semibold" colSpan={2}>
                    전화번호
                    <div className="text-xs font-normal mt-1 flex justify-around">
                      <span>주간/평일</span>
                      <span>야간/휴일</span>
                    </div>
                  </th>
                  <th className="border border-gray-300 px-3 py-3 text-center font-semibold">
                    담당
                    <br />
                    (경/부)
                  </th>
                  <th className="border border-gray-300 px-3 py-3 text-center font-semibold">비고</th>
                </tr>
              </thead>
              <tbody>
                {/* 지역주민 */}
                <tr>
                  <td className="border border-gray-300 px-3 py-3 text-center font-medium align-top" rowSpan={4}>
                    지역
                    <br />
                    주민
                  </td>
                  <td className="border border-gray-300 px-3 py-3 align-top" rowSpan={4}>
                    사고로 인해
                    <br />
                    인적, 물적
                    <br />
                    피해를 입게
                    <br />된 사고현장
                    <br />
                    인근 지역주민
                  </td>
                  <td className="border border-gray-300 px-3 py-3">북평동주민센터</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 033-539-8443</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 033-539-8443</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    송기태
                    <br />
                    전상훈
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-yellow-100">황색경보</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-3">동해시청</td>
                  <td className="border border-gray-300 px-3 py-3">
                    (정) 033-530-2119
                    <br />
                    (부) 033-530-2541
                  </td>
                  <td className="border border-gray-300 px-3 py-3">(정) 033-530-2119</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    송기태
                    <br />
                    전상훈
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-red-100">적색경보</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-3">삼척시청</td>
                  <td className="border border-gray-300 px-3 py-3">
                    (정) 033-570-3179
                    <br />
                    (부) 033-570-3178
                  </td>
                  <td className="border border-gray-300 px-3 py-3">(정) 033-570-3179</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    송기태
                    <br />
                    전상훈
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-red-100">적색경보</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-3">한국산업단지공단</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 070-8895-7662</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 070-8895-7662</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    전상훈
                    <br />
                    송기태
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-yellow-100">황색경보</td>
                </tr>

                {/* 정부기관 */}
                <tr>
                  <td className="border border-gray-300 px-3 py-3 text-center font-medium align-top" rowSpan={8}>
                    정부
                    <br />
                    기관
                  </td>
                  <td className="border border-gray-300 px-3 py-3 align-top" rowSpan={8}>
                    사고처리에
                    <br />직 간접적으로
                    <br />
                    도움이 되거나
                    <br />
                    발생 조치를
                    <br />
                    취할 수 있는
                    <br />
                    정부유관기관
                  </td>
                  <td className="border border-gray-300 px-3 py-3">화학물질안전원</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 043-830-4120~4</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 043-830-4120~4</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    홍용준
                    <br />
                    김정욱
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-yellow-100">황색경보</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-3">원주지방환경청</td>
                  <td className="border border-gray-300 px-3 py-3">
                    (정) 033-760-6446
                    <br />
                    (부) 033-760-6441
                  </td>
                  <td className="border border-gray-300 px-3 py-3">
                    (정) 033-760-6446
                    <br />
                    (부) 033-760-6441
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    홍용준
                    <br />
                    김정욱
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-yellow-100">황색경보</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-3">동해소방서</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 033-533-5119</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 119</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    주용준
                    <br />
                    윤주은
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-red-100">적색경보</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-3">삼척소방서</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 033-572-9119</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 119</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    주용준
                    <br />
                    윤주은
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-red-100">적색경보</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-3">북평119안전센터</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 033-521-5119</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 119</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    주용준
                    <br />
                    윤주은
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-yellow-100">황색경보</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-3">동해경찰서</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 033-539-3257</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 112</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    윤주은
                    <br />
                    주용준
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-red-100">적색경보</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-3">삼척경찰서</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 033-571-2257</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 112</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    윤주은
                    <br />
                    주용준
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-red-100">적색경보</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-3">북평파출소</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 033-539-3345</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 112</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    윤주은
                    <br />
                    주용준
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-yellow-100">황색경보</td>
                </tr>

                {/* 피해가족 */}
                <tr>
                  <td className="border border-gray-300 px-3 py-3 text-center font-medium">
                    피해
                    <br />
                    가족
                  </td>
                  <td className="border border-gray-300 px-3 py-3">
                    사고 직접
                    <br />
                    피해자
                  </td>
                  <td className="border border-gray-300 px-3 py-3">피해자</td>
                  <td className="border border-gray-300 px-3 py-3" colSpan={2}>
                    119로부터 피해자 연락처 수집
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center text-black">
                    공영호
                    <br />
                    이관일
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-red-100">적색경보</td>
                </tr>

                {/* 시민단체 */}
                <tr>
                  <td className="border border-gray-300 px-3 py-3 text-center font-medium align-top" rowSpan={2}>
                    시민
                    <br />
                    단체
                  </td>
                  <td className="border border-gray-300 px-3 py-3 align-top" rowSpan={2}>
                    비영리
                    <br />
                    시민단체
                  </td>
                  <td className="border border-gray-300 px-3 py-3">
                    전국자연보호
                    <br />
                    강원본부
                  </td>
                  <td className="border border-gray-300 px-3 py-3">(정) 010-8003-1983</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 010-8003-1983</td>
                  <td className="border border-gray-300 px-3 py-3 text-center text-black">
                    공영호
                    <br />
                    이관일
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-red-100">적색경보</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-3">
                    동해시
                    <br />
                    환경단체연합회
                  </td>
                  <td className="border border-gray-300 px-3 py-3">(정) 010-6328-0349</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 010-6328-0349</td>
                  <td className="border border-gray-300 px-3 py-3 text-center text-black">
                    공영호
                    <br />
                    이관일
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-red-100">적색경보</td>
                </tr>

                {/* 언론 */}
                <tr>
                  <td className="border border-gray-300 px-3 py-3 text-center font-medium align-top" rowSpan={2}>
                    언론
                  </td>
                  <td className="border border-gray-300 px-3 py-3 align-top" rowSpan={2}>
                    신문, 방송,
                    <br />
                    인터넷
                  </td>
                  <td className="border border-gray-300 px-3 py-3">강원일보</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 010-3845-7850</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 010-3845-7850</td>
                  <td className="border border-gray-300 px-3 py-3 text-center text-black">
                    공영호
                    <br />
                    이관일
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-red-100">적색경보</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-3">강원도민일보</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 010-8365-1385</td>
                  <td className="border border-gray-300 px-3 py-3">(정) 010-8365-1385</td>
                  <td className="border border-gray-300 px-3 py-3 text-center text-black">
                    공영호
                    <br />
                    이관일
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center bg-red-100">적색경보</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-sm text-yellow-800">
            ※ 화재·폭발·누출사고와 같은 이유가 발생 될 경우, 사고의 경중 및 보고 의무와 관계없이 해당사설을 유선으로
            고용노동부, 소방서 및 환경청에 즉시 보고
          </p>
        </div>
      </div>
    </div>
  )
}
