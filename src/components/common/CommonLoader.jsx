import React from 'react';
import logo from '../../asset/image/ravanan.png';

const sizes = { sm: 24, md: 56, lg: 80 };

/** Logo loader for page requests, panels, and in-button loading states. */
const CommonLoader = ({ size = 'md', label = 'Loading…', showLabel = false, className = '' }) => (
  <span role="status" aria-live="polite" aria-label={label}
    className={`inline-flex flex-col items-center justify-center gap-3 align-middle ${className}`}>
    <span aria-hidden="true" className="brand-loader" style={{ '--loader-size': `${sizes[size] || sizes.md}px` }}>
      <span className="brand-loader-ring" />
      <img src={logo} alt="" draggable="false" className="brand-loader-logo" />
    </span>
    {showLabel && <span aria-hidden="true" className="text-xs font-medium tracking-wide text-slate-500">{label}</span>}
  </span>
);

export default CommonLoader;
