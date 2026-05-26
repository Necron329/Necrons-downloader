import { Download, Settings } from "lucide-react";
import clsx from "clsx";

const styles = {
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

type SidebarProps = {
  collapsed: boolean;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
};

const menuItems = [
  { icon: Download, label: "Downloads" },
  { icon: Settings, label: "Settings" },
];

export default function Sidebar({ collapsed, setCurrentPage }: SidebarProps) {
  

  return (
    <aside
      className={clsx(styles.container,collapsed ? styles.collapsed : styles.expanded)}>
      <div className={styles.content}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button 
              key={index} 
              className={styles.item}
              onClick={() => setCurrentPage(item.label.toLowerCase())}
            >
              <div className={styles.icon}>
                <Icon size={20} />
              </div>
              <span 
                className={clsx(styles.label, collapsed ? styles.labelHidden : styles.labelVisible)}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}