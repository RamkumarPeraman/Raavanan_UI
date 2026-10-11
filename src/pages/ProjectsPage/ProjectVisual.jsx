import React, { useState } from 'react';
import { FiActivity, FiBookOpen, FiHeart, FiSun, FiUsers } from 'react-icons/fi';

const appearance = (category = '') => {
  const value = category.toLowerCase();
  if (value.includes('health')) return { Icon: FiActivity, colors: 'from-[#d8efea] via-[#eaf7f3] to-[#f9f5e9]', label: 'Care for every community' };
  if (value.includes('education')) return { Icon: FiBookOpen, colors: 'from-[#fbe8c9] via-[#fff3dd] to-[#e9f2e9]', label: 'A brighter way forward' };
  if (value.includes('women')) return { Icon: FiUsers, colors: 'from-[#f5dfd9] via-[#fff0e8] to-[#f8efd7]', label: 'Opportunity grows together' };
  if (value.includes('environment')) return { Icon: FiSun, colors: 'from-[#dcebd6] via-[#edf4e1] to-[#fff3d7]', label: 'Growing a greener future' };
  return { Icon: FiHeart, colors: 'from-[#dfefeb] via-[#f5f6e9] to-[#fff0db]', label: 'Made for our communities' };
};

const isGenericLogo = (source) => /(?:^|\/)(?:ravanan|raavanan|logo)(?:\.[^/?]+)?(?:[?#].*)?$/i.test(source);

const ProjectVisual = ({ project, className = '', eager = false, compact = false }) => {
  const [failedSources, setFailedSources] = useState([]);
  const sources = [...new Set([...(Array.isArray(project.gallery) ? project.gallery.slice(0, 1) : []), project.image].filter((source) => source && !isGenericLogo(source)))];
  const cover = sources.find((source) => !failedSources.includes(source));
  const { Icon, colors, label } = appearance(project.category);

  return (
    <div className={`relative isolate overflow-hidden bg-gradient-to-br ${colors} ${className}`}>
      {cover ? (
        <img src={cover} alt="" loading={eager ? 'eager' : 'lazy'} onError={() => setFailedSources((previous) => [...previous, cover])} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden text-primary-900">
          <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border-[28px] border-white/25" />
          <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-white/30 blur-sm" />
          <div className={`relative flex items-center justify-center bg-white/70 shadow-[0_20px_50px_-20px_rgba(8,38,40,.35)] ${compact ? 'h-16 w-16 rounded-md' : 'h-20 w-20 rounded-[1.75rem]'}`}>
            <Icon aria-hidden="true" className={compact ? 'h-8 w-8' : 'h-10 w-10'} />
          </div>
          {!compact && <span className="relative mt-5 px-6 text-center text-xs font-bold uppercase tracking-[0.22em] text-primary-800/70">{label}</span>}
        </div>
      )}
    </div>
  );
};

export default ProjectVisual;
