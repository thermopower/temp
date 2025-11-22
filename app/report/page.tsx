import { Suspense } from "react"
import ReportForm from "@/components/report-form"
import { Skeleton } from "@/components/ui/skeleton"

function ReportPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-32 mr-4" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<ReportPageSkeleton />}>
      <ReportForm />
    </Suspense>
  )
}
