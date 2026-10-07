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

const toDateString = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

const VolunteerDatePicker = ({ value, onChange, labelledBy }) => {
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

  return (
    <>
      <button ref={triggerRef} type="button" aria-labelledby={labelledBy} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(previous => !previous)} className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-white focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-primary-100">
        <span className={selectedDate ? '' : 'text-slate-400'}>{selectedDate ? selectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select date of birth'}</span>
        <FiCalendar className="shrink-0 text-primary-700" aria-hidden="true" />
      </button>
      {open && createPortal(
        <div ref={popupRef} role="dialog" aria-label="Choose date of birth" style={position || { visibility: 'hidden' }} className="volunteer-date-popover fixed z-[100] max-h-[calc(100dvh-16px)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <p className="mb-2 px-1 text-xs font-medium text-slate-500">Choose year, month and day</p>
          <Calendar
            calendarType="gregory"
            defaultView={selectedDate ? 'month' : 'decade'}
            defaultActiveStartDate={selectedDate || new Date(2000, 0, 1)}
            value={selectedDate}
            minDate={new Date(1900, 0, 1)}
            maxDate={new Date()}
            showNeighboringMonth={false}
            prevLabel={<FiChevronLeft />}
            nextLabel={<FiChevronRight />}
            prev2Label={<FiChevronsLeft />}
            next2Label={<FiChevronsRight />}
            onChange={date => {
              if (date instanceof Date) {
                onChange(toDateString(date));
                setOpen(false);
                triggerRef.current?.focus();
              }
            }}
          />
          {selectedDate && <div className="mt-2 border-t border-slate-100 pt-2 text-right"><button type="button" onClick={() => { onChange(''); setOpen(false); triggerRef.current?.focus(); }} className="rounded px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800">Clear date</button></div>}
        </div>, document.body
      )}
    </>
  );
};

export default VolunteerDatePicker;
