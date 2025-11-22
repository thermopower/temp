"use client"

export default function ApiSetupGuide({ projectId }: { projectId: string }) {
  const activationUrl = `https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=${projectId}`

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">Google Sheets API 활성화 필요</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-3">구글시트 연동을 위해 API를 활성화해야 합니다.</p>

            <div className="space-y-2 mb-4">
              <p className="font-medium">단계별 설정 방법:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>아래 "API 활성화" 버튼을 클릭합니다</li>
                <li>구글 계정으로 로그인합니다</li>
                <li>"사용 설정" 버튼을 클릭합니다</li>
                <li>활성화가 완료되면 이 페이지로 돌아와서 "연동 확인"을 다시 시도합니다</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={activationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                API 활성화 페이지 열기
              </a>

              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                페이지 새로고침
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
