# Motion recipes (motion v12 — `import … from 'motion/react'`)

Every recipe checks `useReducedMotion()`. Reduced motion = opacity only, ≤ 200 ms, no movement.

```tsx
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring,
         useScroll, useTransform, animate } from 'motion/react';

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const SPRING_UI = { type: 'spring', stiffness: 380, damping: 30 } as const;
```

## 1. Mount reveal
```tsx
const reduce = useReducedMotion();
<motion.div
  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: 'blur(6px)' }}
  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
  transition={{ duration: reduce ? 0.2 : 0.42, ease: EASE_OUT }}
/>
```

## 2. Stagger a list
```tsx
const list = { show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { ease: EASE_OUT } } };
<motion.ul variants={list} initial="hidden" animate="show">
  {items.slice(0, 12).map(i => <motion.li key={i.id} variants={item}>{i.name}</motion.li>)}
</motion.ul>
```

## 3. Module switch
```tsx
<AnimatePresence mode="wait">
  <motion.section
    key={activeModule}
    initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    exit={{ opacity: 0, y: -4, filter: 'blur(4px)' }}
    transition={{ duration: 0.28, ease: EASE_OUT }}
  >
    {renderModule(activeModule)}
  </motion.section>
</AnimatePresence>
```

## 4. Sliding active indicator (nav, tabs)
```tsx
{modules.map(m => (
  <button key={m.id} onClick={() => setActive(m.id)} className="relative px-3 py-2">
    {active === m.id && (
      <motion.span layoutId="nav-active" transition={SPRING_UI}
        className="absolute inset-0 rounded-[10px] bg-accent-soft ring-1 ring-accent/40" />
    )}
    <span className="relative">{m.label}</span>
  </button>
))}
```

## 5. Hover lift (cards)
```tsx
<motion.article whileHover={reduce ? undefined : { y: -2, scale: 1.01 }} transition={SPRING_UI} />
```

## 6. Magnetic button
```tsx
const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
const onMove = (e: React.PointerEvent<HTMLElement>) => {
  if (reduce || e.pointerType !== 'mouse') return;
  const r = e.currentTarget.getBoundingClientRect();
  x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
  y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
};
<motion.button style={{ x, y }} onPointerMove={onMove} onPointerLeave={() => { x.set(0); y.set(0); }} />
```

## 7. Scroll-linked progress (timeline line, HUD bar)
```tsx
const ref = useRef<HTMLDivElement>(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 20%'] });
const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
<motion.div style={{ scaleY, transformOrigin: 'top' }} className="w-px bg-accent" />
```
Inside a scrollable panel, pass `container: panelRef` to `useScroll`.

## 8. Dynamic-island morph
```tsx
<motion.div layout transition={SPRING_UI} className="rounded-full bg-glass backdrop-blur-[14px] border border-line">
  <AnimatePresence mode="popLayout" initial={false}>
    <motion.div key={state} initial={{ opacity: 0, filter: 'blur(4px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(4px)' }}>
      {content[state]}
    </motion.div>
  </AnimatePresence>
</motion.div>
```

## 9. Count-up (REAL values only, e.g. load %)
```tsx
const [v, setV] = useState(0);
useEffect(() => { const c = animate(0, target, { duration: reduce ? 0 : 0.8, onUpdate: n => setV(Math.round(n)) }); return () => c.stop(); }, [target]);
```

## Don'ts
- No infinite looping animations on content (only on cosmetic status dots / screen flicker).
- No motion longer than 800 ms except the camera zoom.
- Never animate `width/height/top/left` — use transforms, opacity, filter, or `layout`.
