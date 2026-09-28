import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import config from '../../config';

const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(config.announcement.show);

  if (!isVisible) return null;

  return (
    <div className="bg-primary-600 text-white relative z-50">
      <div className="container-custom py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <span className="text-sm md:text-base">
              {config.announcement.message}
            </span>
            <Link 
              to={config.announcement.ctaLink}
              className="ml-4 inline-block bg-white text-primary-600 px-4 py-1 rounded-full text-sm font-semibold hover:bg-primary-50 transition-colors"
            >
              {config.announcement.cta}
            </Link>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-4 p-1 hover:bg-primary-700 rounded-full transition-colors"
            aria-label="Close announcement"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;