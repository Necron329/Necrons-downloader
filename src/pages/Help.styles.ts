export const styles = {
  container: "relative overflow-hidden w-full p-6 max-w-2xl mx-auto mt-10 bg-zinc-900 text-zinc-100 font-sans rounded-2xl border border-zinc-800 shadow-2xl",
  header: "text-xl font-semibold tracking-tight mb-6 text-white flex items-center gap-2",

  section: "mt-6 pt-4 border-t border-zinc-800 first:border-t-0 first:mt-0 first:pt-0",
  sectionTitle: "text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3",
  intro: "text-sm text-zinc-300 leading-relaxed",
  bodyText: "text-sm text-zinc-400 leading-relaxed",
  list: "list-decimal list-inside space-y-1",
  listItem: "text-sm text-zinc-400",

  accordion: "mt-3 space-y-2",
  accordionItem: "border border-zinc-800 rounded-lg bg-zinc-950/40 overflow-hidden",
  accordionHeader: "flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium text-zinc-200 hover:bg-zinc-900/60 transition-colors cursor-pointer select-none",
  accordionTitle: "flex items-center gap-2",
  accordionContent: "px-4 text-sm text-zinc-400 leading-relaxed transition-all duration-200 ease-in-out overflow-hidden",
  accordionContentOpen: "pb-3 max-h-96 opacity-100",
  accordionContentClosed: "pb-0 max-h-0 opacity-0 pointer-events-none",
  accordionChevron: "w-4 h-4 text-zinc-500 transition-transform duration-200",

  primaryBtn: "flex items-center justify-center gap-2 px-6 py-2 my-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded shadow-lg shadow-indigo-500/10 transition-all active:scale-95 cursor-pointer",
  secondaryBtn: "flex items-center justify-center gap-2 px-4 py-2 my-3 rounded-lg text-sm font-medium transition-all active:scale-[0.97] bg-zinc-100 text-zinc-900 hover:bg-white cursor-pointer",

  githubCard: "mt-4 p-5 rounded-xl border border-zinc-800 bg-zinc-950/30",
  githubTitle: "text-sm font-medium text-zinc-200 mb-1",
  githubHint: "text-xs text-zinc-500",
};
