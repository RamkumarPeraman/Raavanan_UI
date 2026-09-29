import React, { cloneElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({ children, label, position = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coordinates, setCoordinates] = useState({ left: 0, top: 0 });
  const triggerRef = useRef(null);
  const tooltipId = useId();

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 10;
    const positions = {
      right: { left: rect.right + gap, top: rect.top + rect.height / 2 },
      left: { left: rect.left - gap, top: rect.top + rect.height / 2 },
      top: { left: rect.left + rect.width / 2, top: rect.top - gap },
      bottom: { left: rect.left + rect.width / 2, top: rect.bottom + gap },
    };

    setCoordinates(positions[position] || positions.right);
  }, [position]);

  useEffect(() => {
    if (!isVisible) return undefined;

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isVisible, updatePosition]);

  const transform = {
    right: 'translateY(-50%)',
    left: 'translate(-100%, -50%)',
    top: 'translate(-50%, -100%)',
    bottom: 'translateX(-50%)',
  }[position];

  return (
    <span
      ref={triggerRef}
      className="inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {cloneElement(children, { 'aria-describedby': tooltipId })}
      {isVisible && createPortal(
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none fixed z-[100] whitespace-nowrap rounded-md bg-ink-950 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
          style={{ left: coordinates.left, top: coordinates.top, transform }}
        >
          {label}
        </span>,
        document.body,
      )}
    </span>
  );
};

export default Tooltip;
