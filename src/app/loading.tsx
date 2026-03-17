import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-50 dark:bg-gray-950">
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full scale-110"></div>
          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin scale-110"></div>
          
          <div className="relative w-20 h-20 bg-white dark:bg-gray-900 rounded-[1.5rem] p-0.5 shadow-2xl animate-pulse overflow-hidden">
             <Image src="/icon.png" alt="Loading" width={80} height={80} className="rounded-2xl" />
          </div>
        </div>
        <p className="mt-8 text-[10px] font-black text-emerald-600/40 dark:text-emerald-400/40 uppercase tracking-[0.4em] animate-pulse">
          Initializing App
        </p>
      </div>
    </div>
  );
}
