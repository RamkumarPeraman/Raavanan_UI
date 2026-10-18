import { useEffect, useState } from 'react';

const storageKey = 'siteLanguage';
const changeEvent = 'site-language-change';

const readLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  try { return window.localStorage.getItem(storageKey) === 'ta' ? 'ta' : 'en'; }
  catch { return 'en'; }
};

export const setSiteLanguage = (language) => {
  if (typeof window === 'undefined') return;
  const nextLanguage = language === 'ta' ? 'ta' : 'en';
  try { window.localStorage.setItem(storageKey, nextLanguage); }
  catch { /* Keep the in-page language choice when storage is unavailable. */ }
  document.documentElement.lang = nextLanguage;
  window.dispatchEvent(new CustomEvent(changeEvent, { detail: nextLanguage }));
};

export const useSiteLanguage = () => {
  const [language, setLanguage] = useState(readLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    const onChange = (event) => setLanguage(event.detail);
    const onStorage = (event) => {
      if (event.key === storageKey) setLanguage(readLanguage());
    };
    window.addEventListener(changeEvent, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(changeEvent, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [language]);

  return [language, setSiteLanguage];
};
