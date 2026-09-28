import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';

const DonateButton = () => {
  return (
    <Link
      to="/donate"
      className="inline-flex items-center rounded-full bg-ink-950 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-lg"
    >
      <FiHeart className="mr-2" />
      Donate Now
    </Link>
  );
};

export default DonateButton;
