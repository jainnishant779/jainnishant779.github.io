import { useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger once globally
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Lightweight GSAP context hook that runs animations scoped to a DOM container.
 * Automatically reverts animations and ScrollTriggers on cleanup.
 * Passes the prefers-reduced-motion flag to the callback.
 */
export function useGsap(
  scopeRef: React.RefObject<HTMLElement | null>,
  fn: (ctx: gsap.Context, reduced: boolean) => void | (() => void),
  deps: React.DependencyList = []
) {
  useIsomorphicLayoutEffect(() => {
    if (!scopeRef.current) return;
    const reduced = typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    const ctx = gsap.context((self) => {
      fn(self, reduced);
    }, scopeRef);

    return () => {
      ctx.revert();
    };
  }, deps);
}

export { gsap, ScrollTrigger };
