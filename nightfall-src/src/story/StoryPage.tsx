import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Grain } from './Grain';
import { StoryNav } from './StoryNav';
import { Hero } from './sections/Hero';
import { CaseStudies } from './sections/CaseStudies';
import { About } from './sections/About';
import { Skills } from './sections/Skills';
import { Record } from './sections/Record';
import { HireMe } from './sections/HireMe';
import { StoryFooter } from './sections/StoryFooter';

gsap.registerPlugin(ScrollTrigger);

export function StoryPage() {
  useEffect(() => {
    // Title update
    const prevTitle = document.title;
    document.title = 'Nishant Jain — Editorial Portfolio (Vol. 01)';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lenis: Lenis | null = null;
    let tickerCallback: ((time: number) => void) | null = null;

    if (!reduced) {
      lenis = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
      });

      lenis.on('scroll', ScrollTrigger.update);

      tickerCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    }

    // Refresh ScrollTrigger after content paints
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400);

    return () => {
      clearTimeout(timer);
      document.title = prevTitle;
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      lenis?.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="story min-h-screen bg-[#0b0a09] text-[#ece6d8] antialiased selection:bg-[#f2c230] selection:text-[#0b0a09]">
      <Grain />
      <StoryNav />
      <main>
        <Hero />
        <CaseStudies />
        <About />
        <Skills />
        <Record />
        <HireMe />
      </main>
      <StoryFooter />
    </div>
  );
}

export default StoryPage;
