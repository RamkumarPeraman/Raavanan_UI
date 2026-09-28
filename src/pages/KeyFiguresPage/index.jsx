import React from 'react';
import { FiMail, FiPhone } from 'react-icons/fi';

const members = [
  {
    name: 'Che. Raavanan',
    role: 'Founder & Managing Trustee',
    email: 'cheraa0618@gmail.com',
    phone: '+91 8825563709',
    initials: 'CR',
    color: 'bg-primary-600',
  },
  {
    name: 'Partha Sarathi',
    role: 'Co-Founder & Trustee',
    email: 'errorpartha2004@gmail.com',
    phone: '+91 8344428176',
    initials: 'PS',
    color: 'bg-teal-600',
  },
  {
    name: 'Ambika Swathi',
    role: 'Joint General Secretary & Trustee Designate',
    email: 'rtm251005@gmail.com',
    phone: '+91 9944233014',
    initials: 'AS',
    color: 'bg-purple-600',
  },
  {
    name: 'Prithika Prakash',
    role: 'Treasurer (In-charge) & Trustee Designate',
    email: 'rtm251006@gmail.com',
    phone: '+91 6383049615',
    initials: 'PP',
    color: 'bg-rose-600',
  },
  {
    name: 'Abdul Rahman',
    role: 'Joint Coordinator & Trustee Designate',
    email: 'rtm251008@gmail.com',
    phone: '+91 9043857657',
    initials: 'AR',
    color: 'bg-amber-600',
  },
];

const KeyFiguresPage = () => {
  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20">
        <div className="container-custom text-center">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-3">Leadership</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Key Figures</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Raavana Thalaigal Trust
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className="container-custom py-12 max-w-3xl mx-auto text-center">
        <p className="text-gray-600 text-lg leading-relaxed">
          These are the core leaders and coordinators who guide the vision and day-to-day
          functioning of Raavana Thalaigal Trust. Each member brings a distinct skill set and
          commitment to building a disciplined, youth-led movement for Tamil excellence and
          social transformation.
        </p>
      </div>

      {/* Cards */}
      <div className="container-custom pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {members.map((member, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
            >
              {/* Card top band */}
              <div className={`${member.color} h-2 w-full`}></div>

              <div className="p-6">
                {/* Avatar */}
                <div className={`w-16 h-16 rounded-full ${member.color} text-white flex items-center justify-center text-xl font-extrabold mb-4 shadow`}>
                  {member.initials}
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                <p className="text-sm font-medium text-primary-600 mb-4 leading-snug">{member.role}</p>

                {/* Contact */}
                <div className="space-y-2">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors group"
                  >
                    <FiMail className="flex-shrink-0 text-gray-400 group-hover:text-primary-500" size={15} />
                    <span className="truncate">{member.email}</span>
                  </a>
                  <a
                    href={`tel:${member.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors group"
                  >
                    <FiPhone className="flex-shrink-0 text-gray-400 group-hover:text-primary-500" size={15} />
                    <span>{member.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="bg-primary-700 text-white py-12 text-center">
        <div className="container-custom max-w-xl">
          <p className="text-primary-100 mb-2 text-sm font-semibold uppercase tracking-wider">Get in Touch</p>
          <p className="text-lg font-medium mb-4">
            For official inquiries, reach out to our Secretariat Office.
          </p>
          <a
            href="mailto:enquiry.raavanathalaigal@gmail.com"
            className="inline-block px-6 py-2 bg-white text-primary-700 font-bold rounded-full hover:bg-primary-50 transition-colors text-sm"
          >
            enquiry.raavanathalaigal@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default KeyFiguresPage;
