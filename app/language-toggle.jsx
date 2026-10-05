'use client';

import { useEffect, useRef } from 'react';

export default function LanguageToggle() {
  const buttonRef = useRef(null);

  useEffect(() => {
    buttonRef.current?.setAttribute('aria-label', document.documentElement.lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
  }, []);

  const toggleLanguage = () => {
    const root = document.documentElement;
    const next = root.lang === 'ar' ? 'en' : 'ar';
    root.lang = next;
    root.dir = next === 'ar' ? 'rtl' : 'ltr';
    root.dataset.lang = next;
    buttonRef.current?.setAttribute('aria-label', next === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    try { localStorage.setItem('unisanda-language', next); } catch {}
  };

  return <button ref={buttonRef} className="language-button" type="button" onClick={toggleLanguage} aria-label="التبديل إلى العربية"><span className="language-en">EN</span><span className="language-separator">/</span><span className="language-ar">عربي</span></button>;
}
