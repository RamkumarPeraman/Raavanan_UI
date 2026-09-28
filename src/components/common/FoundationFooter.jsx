import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiPhone,
  FiYoutube,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import ravanaLogo from '../../asset/image/ravanan.png';
import config from '../../config';

const FoundationFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#201814] pt-16 text-white">
      <div className="container-custom">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-8 md:px-8 md:py-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.8fr))]">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-2">
                  <img src={ravanaLogo} alt="Raavana Thalaigal Trust logo" />
                </div>
                <div>
                  <h3 className="text-xl font-bold md:text-2xl">Raavana Thalaigal Trust</h3>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/55">
                    Community impact platform
                  </p>
                </div>
              </div>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/70 md:text-base">
                Mission: To root our strength in every corner of Tamil Nadu, building branches
                of action, brotherhood, and brave youth ready to serve and lead.
              </p>

              <div className="mt-6 flex gap-3">
                {[
                  { href: config.socialMedia.facebook, icon: FiFacebook, label: 'Facebook' },
                  { href: config.socialMedia.whatsapp, icon: FaWhatsapp, label: 'WhatsApp' },
                  { href: config.socialMedia.instagram, icon: FiInstagram, label: 'Instagram' },
                  { href: config.socialMedia.linkedin, icon: FiLinkedin, label: 'LinkedIn' },
                  { href: config.socialMedia.youtube, icon: FiYoutube, label: 'YouTube' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/75 transition hover:border-accent-400/50 hover:bg-accent-400/10 hover:text-accent-300"
                  >
                    <item.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-base font-semibold text-accent-300 md:text-lg">Quick Links</h4>
              <div className="mt-5 space-y-3">
                {config.navigation.footer.quickLinks.map((link) => (
                  <Link key={link.path} to={link.path} className="block text-white/70 transition hover:text-white">
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-base font-semibold text-accent-300 md:text-lg">Resources</h4>
              <div className="mt-5 space-y-3">
                {config.navigation.footer.resources.map((link) => (
                  <Link key={link.path} to={link.path} className="block text-white/70 transition hover:text-white">
                    {link.name}
                  </Link>
                ))}
                <Link to="/blogs" className="block text-white/70 transition hover:text-white">
                  Stories &amp; Media
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-base font-semibold text-accent-300 md:text-lg">Contact</h4>
              <div className="mt-5 space-y-4 text-white/70">
                <div className="flex min-w-0 items-start gap-3">
                  <FiMapPin className="mt-1 h-5 w-5 flex-shrink-0 text-accent-300" />
                  <span>212, 1st Floor, Ramalingam Road East, R.S. Puram, Coimbatore – 641002, Tamil Nadu, India.</span>
                </div>
                <div className="flex min-w-0 items-start gap-3">
                  <FiPhone className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-300" />
                  <a href="tel:+919487814418" className="transition hover:text-white">
                    +91 94878 14418
                  </a>
                </div>
                <div className="flex min-w-0 items-start gap-3">
                  <FiMail className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-300" />
                  <a
                    href="mailto:enquiry.raavanathalaigal@gmail.com"
                    className="min-w-0 break-all transition hover:text-white"
                  >
                    enquiry.raavanathalaigal@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <p>&copy; {currentYear} Raavana Thalaigal Trust. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition hover:text-white">
              Terms of Service
            </Link>
            <Link to="/sitemap" className="transition hover:text-white">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FoundationFooter;
