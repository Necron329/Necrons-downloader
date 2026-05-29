import { useToast } from '../contexts/toastContext';

export default function Toast() {
  const { toasts, triggerExit } = useToast();

  return (
    <div className="fixed top-5 right-5 z-9999 flex flex-col gap-3 pointer-events-none w-full max-w-87.5">
      {toasts.map((t) => (
        <div 
          key={t.id} 
          onClick={() => triggerExit(t.id)}
          className={`
            pointer-events-auto flex items-start p-4 
            bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl
            cursor-pointer hover:border-zinc-700 transition-colors duration-200
            no-select toast-active-scale
            ${t.isExiting ? 'animate-toast-out' : 'animate-toast-in'}
          `}
        >
          <div className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0 mr-3">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <span className="text-[13px] font-medium text-zinc-200 leading-relaxed break-words whitespace-pre-wrap">
              {t.message}
            </span>
            {!t.duration && (
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                Click to dismiss
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}