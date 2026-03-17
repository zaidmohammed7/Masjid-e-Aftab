export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-50 dark:bg-gray-950">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 text-emerald-600 dark:text-emerald-400">🕌</div>
          </div>
        </div>
        <p className="mt-6 text-sm font-black text-emerald-600/50 dark:text-emerald-400/50 uppercase tracking-[0.3em] animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
