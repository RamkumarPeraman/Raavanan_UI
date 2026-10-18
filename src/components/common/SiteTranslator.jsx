import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { pageNameForPath, translate } from '../../i18n/translate';

const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const translatedAttributes = ['placeholder', 'title', 'aria-label', 'alt'];
const skippedTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA']);

const translateTextNode = (node, page, language) => {
  const current = node.nodeValue;
  let record = originalText.get(node);
  if (!record || current !== record.last) {
    record = { original: current, last: current };
    originalText.set(node, record);
  }
  const match = record.original.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match || !match[2]) return;
  const normalized = match[2].replace(/\s+/g, ' ');
  const result = language === 'ta'
    ? `${match[1]}${translate(page, normalized, language)}${match[3]}`
    : record.original;
  if (current !== result) node.nodeValue = result;
  record.last = result;
};

const translateElementAttributes = (element, page, language) => {
  let records = originalAttributes.get(element);
  if (!records) {
    records = new Map();
    originalAttributes.set(element, records);
  }
  for (const name of translatedAttributes) {
    if (!element.hasAttribute(name)) continue;
    const current = element.getAttribute(name);
    let record = records.get(name);
    if (!record || current !== record.last) {
      record = { original: current, last: current };
      records.set(name, record);
    }
    const result = language === 'ta' ? translate(page, record.original, language) : record.original;
    if (current !== result) element.setAttribute(name, result);
    record.last = result;
  }
};

const translateSubtree = (root, page, language) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node = walker.currentNode;
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const parent = node.parentElement;
      if (parent && !skippedTags.has(parent.tagName) && !parent.closest('[contenteditable="true"], [data-no-translate]')) {
        translateTextNode(node, page, language);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && !skippedTags.has(node.tagName) && !node.closest('[data-no-translate]')) {
      translateElementAttributes(node, page, language);
    }
    node = walker.nextNode();
  }
};

const SiteTranslator = () => {
  const { pathname } = useLocation();
  const [language] = useSiteLanguage();

  useLayoutEffect(() => {
    const page = pageNameForPath(pathname);
    let frame = null;
    const update = () => translateSubtree(document.body, page, language);
    const schedule = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => { frame = null; update(); });
    };
    update();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, characterData: true, attributes: true, attributeFilter: translatedAttributes, subtree: true });
    return () => {
      observer.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [pathname, language]);

  return null;
};

export default SiteTranslator;
