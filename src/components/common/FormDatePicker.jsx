import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

const parseDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
};

const formatValue = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

const FormDatePicker = ({ label, value, onChange, required = false }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const popupRef = useRef(null);
  const selectedDate = parseDate(value);

  useLayoutEffect(() => {
    if (!open) return undefined;
    const updatePosition = () => {
      const anchor = triggerRef.current?.getBoundingClientRect();
      if (!anchor) return;
      const width = Math.min(336, window.innerWidth - 16);
      const height = popupRef.current?.offsetHeight || 370;
      const left = Math.max(8, Math.min(anchor.left, window.innerWidth - width - 8));
      const below = anchor.bottom + 8;
      const top = below + height <= window.innerHeight - 8
        ? below
        : Math.max(8, anchor.top - height - 8);
      setPosition({ top, left, width });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutside = event => {
      if (!triggerRef.current?.contains(event.target) && !popupRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return <div className="block text-sm font-medium text-slate-700">
    <span>{label}{required && <span className="ml-1 text-red-600">*</span>}</span>
    <button ref={triggerRef} type="button" aria-label={label} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(previous => !previous)} className="mt-1 flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
      <span className={selectedDate ? '' : 'text-slate-400'}>{selectedDate ? selectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select date'}</span>
      <FiCalendar className="shrink-0 text-primary-700" aria-hidden="true" />
    </button>
    {open && createPortal(<div ref={popupRef} role="dialog" aria-label={`Choose ${label.toLowerCase()}`} style={position || { visibility: 'hidden' }} className="volunteer-date-popover fixed z-[100] max-h-[calc(100dvh-16px)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
      <p className="mb-2 px-1 text-xs font-medium text-slate-500">Choose year, month and day</p>
      <Calendar calendarType="gregory" value={selectedDate} defaultActiveStartDate={selectedDate || new Date()} showNeighboringMonth={false} prevLabel={<FiChevronLeft />} nextLabel={<FiChevronRight />} prev2Label={<FiChevronsLeft />} next2Label={<FiChevronsRight />} onChange={date => {
        if (date instanceof Date) {
          onChange(formatValue(date));
          setOpen(false);
          triggerRef.current?.focus();
        }
      }} />
      {!required && selectedDate && <div className="mt-2 border-t border-slate-100 pt-2 text-right"><button type="button" onClick={() => { onChange(''); setOpen(false); triggerRef.current?.focus(); }} className="rounded px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800">Clear date</button></div>}
    </div>, document.body)}
  </div>;
};

export default FormDatePicker;
