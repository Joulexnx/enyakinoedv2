export function SkeletonLoader() {
  return (
    <div className="w-full h-full bg-[var(--border-subtle)] rounded-2xl shimmer flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--text-muted)] border-t-transparent animate-spin" />
        <span className="text-sm text-[var(--text-muted)]">Konum yükleniyor...</span>
      </div>
    </div>
  );
}
