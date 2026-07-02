export default function SkeletonCard() {
  return (
    <div className="bg-[#141414] rounded-xl p-5 border border-[#1E1E1E] space-y-3">
      <div className="flex items-center justify-between">
        <div className="skeleton-shimmer h-5 w-20 rounded-full" />
        <div className="skeleton-shimmer h-4 w-16 rounded" />
      </div>
      <div className="skeleton-shimmer h-5 w-full rounded" />
      <div className="skeleton-shimmer h-4 w-3/4 rounded" />
      <div className="skeleton-shimmer h-4 w-1/3 rounded" />
    </div>
  );
}
