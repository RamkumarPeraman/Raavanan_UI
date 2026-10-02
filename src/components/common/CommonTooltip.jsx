import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const CommonTooltip = () => {
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    let activeElement = null;

    const updateTooltip = () => {
      if (!activeElement?.isConnected) {
        activeElement = null;
        setTooltip(null);
        return;
      }
      const text = activeElement.getAttribute('data-tooltip');
      if (!text) {
        setTooltip(null);
        return;
      }
      const rect = activeElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
        setTooltip(null);
        return;
      }
      const above = rect.top >= 48;
      setTooltip({
        text,
        left: Math.min(Math.max(rect.left + rect.width / 2, 112), window.innerWidth - 112),
        top: above ? rect.top - 8 : rect.bottom + 8,
        above,
      });
    };

    const findTarget = (node) => node instanceof Element ? node.closest('[data-tooltip]') : null;
    const show = (event) => {
      const target = findTarget(event.target);
      if (!target || target === activeElement) return;
      activeElement = target;
      updateTooltip();
    };
    const hide = (event) => {
      if (!activeElement) return;
      if (event.relatedTarget instanceof Node && activeElement.contains(event.relatedTarget)) return;
      if (findTarget(event.target) !== activeElement) return;
      activeElement = null;
      setTooltip(null);
    };
    const dismiss = (event) => {
      if (event.key === 'Escape') {
        activeElement = null;
        setTooltip(null);
      }
    };

    document.addEventListener('pointerover', show);
    document.addEventListener('pointerout', hide);
    document.addEventListener('focusin', show);
    document.addEventListener('focusout', hide);
    document.addEventListener('keydown', dismiss);
    document.addEventListener('scroll', updateTooltip, true);
    window.addEventListener('resize', updateTooltip);
    return () => {
      document.removeEventListener('pointerover', show);
      document.removeEventListener('pointerout', hide);
      document.removeEventListener('focusin', show);
      document.removeEventListener('focusout', hide);
      document.removeEventListener('keydown', dismiss);
      document.removeEventListener('scroll', updateTooltip, true);
      window.removeEventListener('resize', updateTooltip);
    };
  }, []);

  if (!tooltip) return null;
  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[100] max-w-[min(20rem,calc(100vw-2rem))] rounded-md bg-gray-900 px-2.5 py-1.5 text-center text-xs leading-4 text-white shadow-lg"
      style={{ left: tooltip.left, top: tooltip.top, transform: tooltip.above ? 'translate(-50%, -100%)' : 'translate(-50%, 0)' }}
    >
      {tooltip.text}
    </div>,
    document.body
  );
};

export default CommonTooltip;
