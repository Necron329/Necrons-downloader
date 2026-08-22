import { HelpCircle } from "lucide-react";
import { ReactNode, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { styles } from "./SettingInfo.styles";

interface SettingInfoProps {
  title: string;
  description: ReactNode;
}

export default function SettingInfo({ title, description }: SettingInfoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      const updatePosition = () => {
        if (!wrapperRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();
        setCoords({
          top: rect.top - 8,
          left: rect.left + rect.width / 2,
        });
      };
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible]);

  const tooltipClasses = [
    styles.tooltip,
    isVisible ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
  ].join(' ');

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} cursor-help`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className={styles.icon}>
        <HelpCircle className="w-3.5 h-3.5" />
      </span>

      {isVisible &&
        createPortal(
          <div
            className={tooltipClasses}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <span className={styles.tooltipTitle}>{title}</span>
            <span className={styles.tooltipText}>{description}</span>
          </div>,
          document.body
        )}
    </div>
  );
}
