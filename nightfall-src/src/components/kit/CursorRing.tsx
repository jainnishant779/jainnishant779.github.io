import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

const INTERACTIVE = 'a,button,[role="button"],input,textarea,select,summary,[data-cursor="hover"]';

/**
 * Dot + lagging ring that grows over interactive elements. Mouse only: it renders nothing on touch
 * devices or under reduced motion, and it never hides the native cursor.
 */
export function CursorRing() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 300, damping: 28, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 300, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (reduce || !window.matchMedia('(pointer: fine)').matches) return;
    setEnabled(true);
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setActive(!!(e.target as HTMLElement | null)?.closest?.(INTERACTIVE));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      setEnabled(false);
    };
  }, [reduce, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 size-1.5 rounded-full bg-accent"
        style={{ x, y, translateX: '-50%', translateY: '-50%', zIndex: 'var(--z-cursor)' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 rounded-full border border-accent/60"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%', zIndex: 'var(--z-cursor)' }}
        animate={{ width: active ? 44 : 28, height: active ? 44 : 28, opacity: active ? 1 : 0.6 }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
