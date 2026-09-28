import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiHeart,
  FiHome,
  FiUsers,
} from 'react-icons/fi';

const trustStats = [
  { value: '2+', label: 'Years of service' },
  { value: '2,000+', label: 'People supported' },
  { value: '100+', label: 'Volunteers and community partners' },
];

const focusAreas = [
  {
    icon: FiBookOpen,
    title: 'Education and learning',
    description: 'Learning access, youth support, and local development initiatives for underserved communities.',
  },
  {
    icon: FiUsers,
    title: 'Community care',
    description: 'Volunteer networks, outreach efforts, and direct support for families and vulnerable groups.',
  },
  {
    icon: FiHome,
    title: 'Livelihood and resilience',
    description: 'Practical programs that help people build stability, dignity, and long-term opportunity.',
  },
];

const FoundationHero = () => {
  return (
    <section className="relative overflow-hidden bg-[#f5efe5] pt-20 md:pt-15 text-ink-950">
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-[28rem] w-[28rem] rounded-full bg-primary-100 blur-3xl" />
        <div className="absolute right-[-8rem] top-16 h-[30rem] w-[30rem] rounded-full bg-accent-100 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#efe5d4] to-transparent" />
      </div>

      <div className="container-custom relative z-10 pb-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-center">
          <div className="max-w-3xl">
            <div className="text-reveal inline-flex rounded-full border border-primary-200/70 bg-white/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700/85">
              Let your existence begin with glory and dignity
            </div>

            <h1 className="text-reveal text-reveal-delay-1 mt-6 text-2xl font-bold leading-snug md:text-3xl lg:text-4xl">
              To rise as a revolutionary Tamil movement, where heritage leads, voices unite, and youth become the fire of transformation
            </h1>

            <p className="text-reveal text-reveal-delay-2 mt-6 max-w-2xl text-base leading-7 text-ink-700 md:text-lg">
              Raavana Thalaigal Trust is a student and youth-led movement built on the spirit of
              unity, learning, growth, and social responsibility — where every young voice matters,
              and when united, becomes a powerful force for meaningful change.
            </p>

            <div className="text-reveal text-reveal-delay-3 mt-5 flex flex-wrap gap-3">
              <Link
                to="/our-story"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary-400 bg-white/80 text-primary-800 text-sm font-semibold hover:bg-primary-50 transition-colors"
              >
                Our Story
                <FiArrowRight size={14} />
              </Link>
              <Link
                to="/key-figures"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary-400 bg-white/80 text-primary-800 text-sm font-semibold hover:bg-primary-50 transition-colors"
              >
                Key Figures
                <FiArrowRight size={14} />
              </Link>
            </div>

            <div className="text-reveal text-reveal-delay-3 mt-5 flex flex-col gap-4 sm:flex-row">
              <Link to="/donate" className="btn-primary group bg-primary-700 hover:bg-primary-800">
                Support our mission
                <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/volunteer" className="btn-secondary group border-primary-300/80 bg-white/72">
                Become a volunteer
                <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="text-reveal text-reveal-delay-4 mt-10 grid gap-4 sm:grid-cols-3">
              {trustStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.5rem] border border-white/55 bg-white/66 px-5 py-5 shadow-[0_24px_60px_-40px_rgba(20,26,32,0.2)] backdrop-blur"
                >
                  <div className="text-2xl font-bold text-primary-800">{item.value}</div>
                  <div className="mt-2 text-xs leading-5 text-ink-600 md:text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-[#eadbc5]/80 bg-[#fffaf1]/88 p-6 shadow-[0_32px_90px_-42px_rgba(66,46,17,0.24)] md:p-8">
              <div className="flex items-center justify-between border-b border-[#eadbc5]/75 pb-5">
                <div>
                  <div className="text-reveal text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
                    Our promise
                  </div>
                  <div className="text-reveal text-reveal-delay-1 mt-2 text-xl font-bold text-ink-950 md:text-2xl">Community impact with continuity</div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-700 text-white">
                  <FiAward className="h-7 w-7" />
                </div>
              </div>

              <div className="text-reveal text-reveal-delay-2 mt-6 space-y-4">
                {focusAreas.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-[#f0e4d3]/75 bg-white/80 px-5 py-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-ink-950">{item.title}</h2>
                        <p className="mt-2 text-sm leading-5 text-ink-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-reveal text-reveal-delay-3 mt-6 rounded-[1.5rem] border border-primary-800/40 bg-primary-900 px-6 py-6 text-white shadow-[0_18px_40px_-28px_rgba(8,38,40,0.55)]">
                <div className="flex items-center gap-3">
                  <FiHeart className="h-5 w-5 text-accent-300" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/78">
                    Community note
                  </span>
                </div>
                <p className="mt-3 text-base leading-7 text-white/94">
                  "Every contribution should feel visible: one person, one family, one clear
                  step forward."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoundationHero;
