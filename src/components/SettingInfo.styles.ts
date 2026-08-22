export const styles = {
  wrapper: "relative inline-flex items-center",
  icon: "text-zinc-600 cursor-help hover:text-zinc-400 transition-colors",
  tooltip: [
    "w-96 p-3 rounded-lg bg-zinc-800 border border-zinc-700 shadow-xl",
    "text-xs text-zinc-300 leading-relaxed",
    "transition-all duration-200 z-50",
    "opacity-0 invisible pointer-events-none"
  ].join(" "),
  tooltipTitle: "block text-[11px] font-semibold text-zinc-100 mb-1 uppercase tracking-wide",
  tooltipText: "block text-zinc-400"
};
