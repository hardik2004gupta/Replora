import { useState, useRef, type ReactNode } from "react";

interface TooltipProps {
  text: string;
  children: ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), 300);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <span
      className="tooltip-trigger"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <span
        className="tooltip"
        role="tooltip"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {text}
      </span>
    </span>
  );
}
