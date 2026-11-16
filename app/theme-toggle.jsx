'use client';

import { useEffect, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';

const storageKey = 'unisanda-theme';

export default function ThemeToggle() {
  const buttonRef = useRef(null);

  useEffect(() => {
    buttonRef.current?.setAttribute('aria-pressed', String(document.documentElement.dataset.theme === 'dark'));
  }, []);

  const toggleTheme = (event) => {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    const applyTheme = () => {
      root.dataset.theme = nextTheme;
      buttonRef.current?.setAttribute('aria-pressed', String(nextTheme === 'dark'));
      try { localStorage.setItem(storageKey, nextTheme); } catch {}
    };

    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyTheme();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.max(
      Math.hypot(x, y),
      Math.hypot(window.innerWidth - x, y),
      Math.hypot(x, window.innerHeight - y),
      Math.hypot(window.innerWidth - x, window.innerHeight - y),
    );
    root.style.setProperty('--theme-x', `${x}px`);
    root.style.setProperty('--theme-y', `${y}px`);
    root.style.setProperty('--theme-radius', `${radius}px`);
    document.startViewTransition(applyTheme);
  };

  return <button ref={buttonRef} className="theme-button" type="button" onClick={toggleTheme} aria-label="Toggle color theme" aria-pressed="false"><Moon className="icon-moon" size={17} aria-hidden="true" /><Sun className="icon-sun" size={17} aria-hidden="true" /></button>;
}
