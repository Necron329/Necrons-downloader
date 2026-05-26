import { Menu } from "lucide-react";

type HeaderProps = {
  onToggleSidebar: () => void;
};

const styles = {
  container: "w-full h-14 bg-zinc-900 text-white flex items-center justify-between px-4 border-b border-zinc-800",
  left: "flex items-center gap-3",
  burger: "p-2 rounded-lg hover:bg-zinc-800 transition cursor-pointer",
  title: "text-lg font-semibold",
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