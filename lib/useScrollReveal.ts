"use client";
import { useEffect, useRef, useCallback } from "react";

/** Attach to any element: adds `.is-visible` when it enters the viewport */
export function useScrollReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("is-visible"); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

/** Observe all children of a container and stagger their reveal */
export function useStaggerReveal<T extends HTMLElement>(threshold = 0.1) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((c, i) => c.style.setProperty("--sr-i", String(i)));
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          children.forEach(c => c.classList.add("is-visible"));
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

/** Animated counter: returns a ref callback that counts from 0 to target */
export function useCounter(target: number, duration = 1800) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  const animate = useCallback(() => {
    if (started.current || !ref.current) return;
    started.current = true;
    const start = performance.now();
    const el = ref.current;
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { animate(); obs.unobserve(el); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [animate]);

  return ref;
}
