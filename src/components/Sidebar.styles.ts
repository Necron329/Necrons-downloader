export const styles = {
  container: "h-full bg-zinc-900 text-white border-r border-zinc-800 transition-[width] duration-300 flex flex-col overflow-hidden",
  expanded: "w-56",
  collapsed: "w-16",
  content: "flex-1 pt-4",
  item: "w-full flex items-center px-5 py-3 hover:bg-zinc-800 transition-colors cursor-pointer overflow-hidden",
  icon: "shrink-0",
  label: "ml-3 text-sm transition-opacity duration-300 whitespace-nowrap",
  labelHidden: "opacity-0 pointer-events-none",
  labelVisible: "opacity-100",
};
