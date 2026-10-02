import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

const CommonSelect = ({ id, name, value, onChange, options, placeholder = 'Select an option', label, disabled = false }) => {
  const menuId = useId();
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef({ text: '', time: 0 });
  const [position, setPosition] = useState(null);
  const [active, setActive] = useState(0);
  const items = options.map((option) => typeof option === 'object' ? option : { value: option, label: option });
  const selected = items.findIndex((option) => option.value === value);

  const openMenu = () => {
    const rect = triggerRef.current.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const up = below < 200 && above > below;
    setPosition({ left: rect.left, width: rect.width, maxHeight: Math.min(240, up ? above : below),
      ...(up ? { bottom: window.innerHeight - rect.top + 5 } : { top: rect.bottom + 5 }) });
    setActive(Math.max(0, selected));
  };

  useEffect(() => {
    if (!position) return undefined;
    const dismiss = (event) => {
      if (!triggerRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setPosition(null);
    };
    const close = () => setPosition(null);
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', close);
    };
  }, [position]);

  useEffect(() => {
    if (position) menuRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active, position]);

  const choose = (index) => {
    if (!items[index]) return;
    onChange(items[index].value);
    setPosition(null);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && position) {
      event.preventDefault();
      event.stopPropagation();
      setPosition(null);
    } else if (event.key === 'Tab') {
      setPosition(null);
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (!position) openMenu();
      else setActive((index) => event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : Math.max(0, Math.min(items.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1))));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (position) choose(active);
      else openMenu();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      const text = (now - searchRef.current.time < 700 ? searchRef.current.text : '') + event.key.toLowerCase();
      searchRef.current = { text, time: now };
      const match = items.findIndex((item) => String(item.label).toLowerCase().startsWith(text));
      if (!position) openMenu();
      if (match >= 0) setActive(match);
    }
  };

  return (
    <>
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      <button ref={triggerRef} id={id} type="button" role="combobox" aria-label={label}
        aria-expanded={Boolean(position)} aria-controls={position ? menuId : undefined} aria-haspopup="listbox"
        aria-activedescendant={position && items[active] ? `${menuId}-${active}` : undefined}
        disabled={disabled} onKeyDown={handleKeyDown} onBlur={() => setPosition(null)}
        onClick={() => position ? setPosition(null) : openMenu()}
        className="flex h-[34px] w-full min-w-0 items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-white focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-primary-600/10 disabled:cursor-not-allowed disabled:opacity-50">
        <span className={`truncate ${selected < 0 ? 'text-slate-400' : ''}`}>{items[selected]?.label || placeholder}</span>
        <FiChevronDown aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${position ? 'rotate-180' : ''}`} />
      </button>
      {position && createPortal(
        <div ref={menuRef} id={menuId} role="listbox" aria-label={label || placeholder}
          style={position} onMouseDown={(event) => event.preventDefault()}
          className="admin-table-scroll fixed z-[60] overflow-y-auto overscroll-contain rounded-md border border-slate-200 bg-white p-1 shadow-lg">
          {items.map((item, index) => (
            <div key={item.value} id={`${menuId}-${index}`} role="option" aria-selected={item.value === value}
              onMouseEnter={() => setActive(index)} onClick={() => choose(index)}
              className={`flex cursor-pointer items-center justify-between gap-2 rounded px-2.5 py-2 text-sm ${index === active ? 'bg-primary-100 text-primary-800' : item.value === value ? 'bg-primary-50 text-primary-700' : 'text-slate-700'}`}>
              <span>{item.label}</span>
              {item.value === value && <FiCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
            </div>
          ))}
        </div>, document.body
      )}
    </>
  );
};

export default CommonSelect;
