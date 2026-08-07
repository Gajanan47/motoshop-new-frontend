import Skeleton from "./Skeleton"

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <Skeleton className="w-full h-56 sm:w-72 sm:h-auto sm:min-h-72 lg:w-96 lg:min-h-80 shrink-0 rounded-none" />

      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-3 w-20" />
            <div className="flex gap-1.5">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-5 pt-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  )
}