import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl' };

/** Shared dialog with a fixed header/footer and a scrollable content area. */
const CommonPopup = ({ open = true, title, description, onClose, children, footer, size = 'md', busy = false, closeWhileBusy = false }) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  const closeWhileBusyRef = useRef(closeWhileBusy);
  useEffect(() => {
    closeRef.current = onClose;
    busyRef.current = busy;
    closeWhileBusyRef.current = closeWhileBusy;
  }, [onClose, busy, closeWhileBusy]);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && (!busyRef.current || closeWhileBusyRef.current)) {
        event.preventDefault();
        closeRef.current?.();
      }
      if (event.key !== 'Tab') return;
      const elements = Array.from(dialogRef.current?.querySelectorAll(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]'
      ) || []).filter((element) => element.getClientRects().length > 0);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) {
        event.preventDefault();
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-5" onMouseDown={(event) => {
      if (event.target === event.currentTarget && (!busy || closeWhileBusy)) onClose?.();
    }}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined} aria-busy={busy} tabIndex={-1}
        className={`common-popup flex max-h-[calc(100dvh-24px)] w-full min-w-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl outline-none sm:max-h-[calc(100dvh-40px)] ${widths[size] || widths.md}`}>
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-2.5">
          <div className="min-w-0">
            <h2 id={titleId} className="font-sans text-sm font-semibold text-gray-900">{title}</h2>
            {description && <p id={descriptionId} className="mt-0.5 text-xs text-gray-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} disabled={busy && !closeWhileBusy} aria-label="Close popup" data-tooltip="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 disabled:opacity-40">
            <FiX size={16} aria-hidden="true" />
          </button>
        </header>
        <div className="common-popup-body admin-table-scroll min-h-0 overflow-y-auto overscroll-contain p-4 text-sm">{children}</div>
        {footer && <footer className="common-popup-footer shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-2.5">{footer}</footer>}
      </section>
    </div>, document.body
  );
};

export default CommonPopup;
