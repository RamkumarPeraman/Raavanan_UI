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
  { value: '15+', label: 'Years of local service' },
  { value: '5,000+', label: 'Young people supported' },
  { value: '120+', label: 'Volunteers and mentors' },
];

const focusAreas = [
  {
    icon: FiBookOpen,
    title: 'Education access',
    description: 'Scholarships, bridge learning, and mentorship for first-generation learners.',
  },
  {
    icon: FiUsers,
    title: 'Community leadership',
    description: 'Volunteer networks that stay active inside the neighbourhoods they serve.',
  },
  {
    icon: FiHome,
    title: 'Family resilience',
    description: 'Practical support that helps students remain in school and move forward with dignity.',
  },
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#f5efe5] pt-28 text-ink-950">
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-[28rem] w-[28rem] rounded-full bg-primary-100 blur-3xl" />
        <div className="absolute right-[-8rem] top-16 h-[30rem] w-[30rem] rounded-full bg-accent-100 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#efe5d4] to-transparent" />
      </div>

      <div className="container-custom relative z-10 pb-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-primary-200 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
              Inspired by proven education-led NGO storytelling
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-[0.94] md:text-7xl">
              Building confident students and stronger communities.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-700 md:text-xl">
              Raavana Thalaigal Trust is presented here with a warmer, mission-first experience:
              one that puts student opportunity, community participation, and long-term
              social impact at the center of the homepage.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/donate" className="btn-primary group bg-primary-700 hover:bg-primary-800">
                Support a student
                <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/volunteer" className="btn-secondary group border-primary-300 bg-white/85">
                Become a volunteer
                <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {trustStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.5rem] border border-white/70 bg-white/80 px-5 py-5 shadow-[0_24px_60px_-40px_rgba(20,26,32,0.35)] backdrop-blur"
                >
                  <div className="text-3xl font-bold text-primary-800">{item.value}</div>
                  <div className="mt-2 text-sm leading-6 text-ink-600">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-[#eadbc5] bg-[#fffaf1] p-6 shadow-[0_32px_90px_-42px_rgba(66,46,17,0.38)] md:p-8">
              <div className="flex items-center justify-between border-b border-[#eadbc5] pb-5">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-700">
                    Our promise
                  </div>
                  <div className="mt-2 text-2xl font-bold text-ink-950">Education with continuity</div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-700 text-white">
                  <FiAward className="h-7 w-7" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {focusAreas.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-[#f0e4d3] bg-white px-5 py-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-ink-950">{item.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-ink-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-primary-900 px-6 py-6 text-white">
                <div className="flex items-center gap-3">
                  <FiHeart className="h-5 w-5 text-accent-300" />
                  <span className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                    Community note
                  </span>
                </div>
                <p className="mt-3 text-lg leading-8 text-white/85">
                  “Every contribution should feel visible: one student, one family, one clear
                  step forward.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
