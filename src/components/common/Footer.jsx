import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiYoutube,
  FiMail, FiPhone, FiMapPin
} from 'react-icons/fi';
import ravanaLogo from "../../asset/image/ravanan.png"

import config from '../../config';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-2">
                <img
                  src={ravanaLogo}
                  alt="" />
              </div>
              Raavana Thalaigal Trust
            </h3>
            <p className="text-gray-400 mb-4">
              Empowering communities through education, healthcare, and sustainable development.
            </p>
            <div className="flex space-x-4">
              <a href={config.socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href={config.socialMedia.twitter} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href={config.socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href={config.socialMedia.linkedin} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiLinkedin size={20} />
              </a>
              <a href={config.socialMedia.youtube} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {config.navigation.footer.quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-primary-500 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {config.navigation.footer.resources.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-primary-500 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/newsletter" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Newsletter
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FiMapPin className="text-primary-500 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  123 NGO Street, Chennai<br />
                  Tamil Nadu, India - 600001
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="text-primary-500 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-gray-400 hover:text-primary-500">
                  +91 94878 14418
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="text-primary-500 flex-shrink-0" />
                <a href="mailto:info@raavanathalaigal.org" className="text-gray-400 hover:text-primary-500">
                  info@raavanathalaigal.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Raavana Thalaigal Trust. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-primary-500 text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-primary-500 text-sm">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-primary-500 text-sm">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;