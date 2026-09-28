import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import config from '../../config';
import DonateButton from './DonateButton';
import ravanaLogo from "../../asset/image/ravanan.png"


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = config.navigation.main;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 shadow-lg shadow-ink-950/5 backdrop-blur-xl py-2' : 'bg-transparent py-4'
      }`}>
      <div className="container-custom">
        <div className={`flex items-center justify-between rounded-full px-4 transition-all duration-300 ${scrolled ? 'bg-white/70 py-2' : 'bg-transparent py-1'}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-ink-950 p-2 shadow-lg shadow-primary-900/20">
              <img
                src={ravanaLogo}
                alt="" />
            </div>
            <span className={`text-xl font-bold ${scrolled ? 'text-ink-950' : 'text-white'
              }`}>
              Raavana Thalaigal Trust
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors duration-300 ${location.pathname === item.path
                    ? 'text-primary-600'
                    : scrolled
                      ? 'text-ink-700 hover:text-primary-600'
                      : 'text-white/90 hover:text-accent-200'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Donate Button & Mobile Menu Toggle */}
          <div className="flex items-center space-x-4">
            <DonateButton />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <FiX className={`w-6 h-6 ${scrolled ? 'text-ink-950' : 'text-white'}`} />
              ) : (
                <FiMenu className={`w-6 h-6 ${scrolled ? 'text-ink-950' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden fixed inset-x-4 top-[76px] rounded-[1.75rem] border border-white/60 bg-white/95 shadow-2xl shadow-ink-950/10 backdrop-blur-xl transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
            }`}
        >
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${location.pathname === item.path
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-ink-700 hover:bg-primary-50 hover:text-primary-600'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
