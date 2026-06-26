import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";

export function PageProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 28,
    mass: 0.25,
  });

  return (
    <div className="page-progress" aria-hidden="true">
      <motion.span style={{ scaleX }} />
    </div>
  );
}

export function KineticHeading({ children, className = "" }) {
  const reduceMotion = useReducedMotion();
  const characters = Array.from(children);

  if (reduceMotion) return <h2 className={className}>{children}</h2>;

  return (
    <motion.h2
      className={`kinetic-heading ${className}`}
      aria-label={children}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.65 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.026, delayChildren: 0.05 },
        },
      }}
    >
      {characters.map((character, index) => (
        <motion.span
          aria-hidden="true"
          className={character === " " ? "is-space" : ""}
          key={`${character}-${index}`}
          variants={{
            hidden: { opacity: 0, y: "0.9em", rotateX: -72, filter: "blur(7px)" },
            visible: {
              opacity: 1,
              y: 0,
              rotateX: 0,
              filter: "blur(0px)",
              transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {character === " " ? "\u00A0" : character}
        </motion.span>
      ))}
    </motion.h2>
  );
}

function useHoverCapable() {
  const [hoverCapable, setHoverCapable] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHoverCapable(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return hoverCapable;
}

export function TiltSurface({ children, className = "" }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const hoverCapable = useHoverCapable();
  const enableTilt = !reduceMotion && hoverCapable;
  const rotateXValue = useMotionValue(0);
  const rotateYValue = useMotionValue(0);
  const rotateX = useSpring(rotateXValue, { stiffness: 180, damping: 20, mass: 0.45 });
  const rotateY = useSpring(rotateYValue, { stiffness: 180, damping: 20, mass: 0.45 });

  const handleMove = (event) => {
    if (!enableTilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    rotateXValue.set(y * -7);
    rotateYValue.set(x * 7);
  };

  const reset = () => {
    rotateXValue.set(0);
    rotateYValue.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`tilt-surface ${className}`}
      style={enableTilt ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      onPointerMove={enableTilt ? handleMove : undefined}
      onPointerLeave={enableTilt ? reset : undefined}
      whileHover={enableTilt ? { y: -8, scale: 1.012 } : undefined}
      transition={{ duration: 0.24 }}
    >
      {children}
    </motion.div>
  );
}
