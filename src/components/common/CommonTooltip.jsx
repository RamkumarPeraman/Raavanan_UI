import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const CommonTooltip = () => {
  const [tooltip, setTooltip] = useState(null);
  const tooltipRef = useRef(null);

  useLayoutEffect(() => {
    if (!tooltip || !tooltipRef.current) return;
    const element = tooltipRef.current;
    const { width, height } = element.getBoundingClientRect();
    const margin = 8;
    const left = Math.max(margin, Math.min(tooltip.center - width / 2, window.innerWidth - width - margin));
    const above = tooltip.top - height - margin;
    const below = tooltip.bottom + margin;
    const preferredTop = above >= margin ? above : below;
    const top = Math.max(margin, Math.min(preferredTop, window.innerHeight - height - margin));
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
    element.style.visibility = 'visible';
  }, [tooltip]);

  useEffect(() => {
    let activeElement = null;
    let hideTimer;

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
      setTooltip({
        text,
        center: rect.left + rect.width / 2,
        top: rect.top,
        bottom: rect.bottom,
      });
    };

    const findTarget = (node) => node instanceof Element ? node.closest('[data-tooltip]') : null;
    const show = (event) => {
      clearTimeout(hideTimer);
      if (tooltipRef.current?.contains(event.target)) return;
      const target = findTarget(event.target);
      if (!target || target === activeElement) return;
      activeElement = target;
      updateTooltip();
    };
    const hide = (event) => {
      if (!activeElement) return;
      if (event.relatedTarget instanceof Node && (activeElement.contains(event.relatedTarget) || tooltipRef.current?.contains(event.relatedTarget))) return;
      if (findTarget(event.target) !== activeElement && !tooltipRef.current?.contains(event.target)) return;
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        activeElement = null;
        setTooltip(null);
      }, 100);
    };
    const dismiss = (event) => {
      if (event.key === 'Escape') {
        activeElement = null;
        setTooltip(null);
      }
    };
    const removedTargetObserver = new MutationObserver(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (activeElement && (!activeElement.isConnected || (dialog && !dialog.contains(activeElement)))) {
        activeElement = null;
        clearTimeout(hideTimer);
        setTooltip(null);
      }
    });
    removedTargetObserver.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('pointerover', show);
    document.addEventListener('pointerout', hide);
    document.addEventListener('focusin', show);
    document.addEventListener('focusout', hide);
    document.addEventListener('keydown', dismiss);
    document.addEventListener('scroll', updateTooltip, true);
    window.addEventListener('resize', updateTooltip);
    return () => {
      clearTimeout(hideTimer);
      removedTargetObserver.disconnect();
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
      ref={tooltipRef}
      role="tooltip"
      className="pointer-events-none fixed z-[100] w-max max-w-[min(25rem,calc(100vw-16px))] max-h-[calc(100dvh-16px)] overflow-y-auto whitespace-pre-wrap rounded-md bg-gray-900 px-2.5 py-1.5 text-left text-xs leading-5 text-white shadow-lg [overflow-wrap:anywhere]"
      style={{ left: 0, top: 0, visibility: 'hidden' }}
    >
      {tooltip.text}
    </div>,
    document.body
  );
};

export default CommonTooltip;
