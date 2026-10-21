import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/lib/motion';

export interface TextRevealProps {
  text: string;
  className?: string;
  /** Seconds before the first word appears. */
  delay?: number;
  /** Seconds between words (only the first 12 words are staggered). */
  stagger?: number;
}

/** Word-by-word blur-fade when scrolled into view. Reduced motion: plain text. */
export function TextReveal({ text, className, delay = 0, stagger = 0.04 }: TextRevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;

  const words = text.split(' ');
  return (
    <span className={cn('inline', className)} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.42, ease: EASE_OUT, delay: delay + Math.min(i, 11) * stagger }}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </span>
  );
}
