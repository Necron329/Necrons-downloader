import { Download, Settings, FileEdit } from "lucide-react";
import clsx from "clsx";
import { styles } from "./Sidebar.styles";

type SidebarProps = {
  collapsed: boolean;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
};

const menuItems = [
  { icon: Download, label: "Downloads" },
  { icon: FileEdit, label: "Metadata" },
  { icon: Settings, label: "Settings" },
];

export default function Sidebar({ collapsed, setCurrentPage }: SidebarProps) {
  return (
    <aside
      className={clsx(styles.container, collapsed ? styles.collapsed : styles.expanded)}
    >
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
              <span className={clsx(styles.label, collapsed ? styles.labelHidden : styles.labelVisible)}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

