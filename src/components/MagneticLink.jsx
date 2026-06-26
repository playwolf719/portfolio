import { useRef } from "react";

export function MagneticLink({ children, className = "", as = "a", ...props }) {
  const ref = useRef(null);
  const Tag = as;

  const handleMove = (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate3d(${x * 0.12}px, ${y * 0.12}px, 0)`;
  };

  const handleLeave = () => {
    ref.current.style.transform = "translate3d(0, 0, 0)";
  };

  return (
    <Tag
      ref={ref}
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...props}
    >
      {children}
    </Tag>
  );
}
