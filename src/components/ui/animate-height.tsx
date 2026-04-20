"use client";

import { useRef, useState, useEffect } from "react";

export function AnimateHeight({
  expanded,
  children,
  duration = 200,
}: {
  expanded: boolean;
  children: React.ReactNode;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(expanded ? undefined : 0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- initial mount height sync before animation
      setHeight(expanded ? undefined : 0);
      return;
    }
    if (expanded) {
      const h = ref.current?.scrollHeight || 0;
      setHeight(h);
      const timer = setTimeout(() => setHeight(undefined), duration);
      return () => clearTimeout(timer);
    } else {
      const h = ref.current?.scrollHeight || 0;
      setHeight(h);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [expanded, duration]);

  return (
    <div
      ref={ref}
      className="overflow-hidden transition-[height,opacity] ease-out"
      style={{
        height: height !== undefined ? height : "auto",
        opacity: expanded ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}
