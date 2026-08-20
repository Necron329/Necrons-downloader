import { Menu } from "lucide-react";
import { styles } from "./Header.styles";

type HeaderProps = {
  onToggleSidebar: () => void;
};

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className={styles.container}>
      <div className={styles.left}>
        <button onClick={onToggleSidebar} className={styles.burger}>
          <Menu size={20} />
        </button>
        <h1 className={styles.title}>Necron's Downloader</h1>
      </div>
    </header>
  );
}

