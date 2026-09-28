import React, { useEffect, useState } from 'react';
import { FiBookOpen, FiHeart, FiMapPin, FiUsers } from 'react-icons/fi';
import config from '../../config';

const ImpactMetrics = () => {
  const [counts, setCounts] = useState({
    lives: 0,
    volunteers: 0,
    projects: 0,
    states: 0,
  });

  useEffect(() => {
    const targets = config.impactMetrics;
    const duration = 1800;
    const steps = 60;
    const increment = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      
      setCounts({
        lives: Math.min(Math.floor((targets.lives / steps) * currentStep), targets.lives),
        volunteers: Math.min(Math.floor((targets.volunteers / steps) * currentStep), targets.volunteers),
        projects: Math.min(Math.floor((targets.projects / steps) * currentStep), targets.projects),
        states: Math.min(Math.floor((targets.states / steps) * currentStep), targets.states),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, increment);

    return () => clearInterval(timer);
  }, []);

  const metrics = [
    { icon: FiUsers, value: counts.lives, label: 'Lives reached', suffix: '+' },
    { icon: FiHeart, value: counts.volunteers, label: 'People backing the mission', suffix: '+' },
    { icon: FiBookOpen, value: counts.projects, label: 'Programs delivered', suffix: '+' },
    { icon: FiMapPin, value: counts.states, label: 'Regions connected', suffix: '' },
  ];

  return (
    <section className="bg-[#efe5d4] py-16">
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div>
            <h2 className="text-reveal text-reveal-delay-1 mt-4 text-3xl font-bold text-ink-950 md:text-4xl">
              Trust is built through clarity, not decoration.
            </h2>
            <div className="text-reveal text-reveal-delay-2 mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="/our-story"
                className="inline-flex items-center justify-center rounded-full border border-primary-300 bg-white px-6 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-700 hover:text-white"
              >
                Our Story
              </a>
              <a
                href="/key-figures"
                className="inline-flex items-center justify-center rounded-full border border-primary-300 bg-white px-6 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-700 hover:text-white"
              >
                Key Figures
              </a>
            </div>
          </div>

          <div className="text-reveal text-reveal-delay-3 grid gap-4 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[1.75rem] border border-white/45 bg-white/72 p-6 shadow-[0_20px_50px_-38px_rgba(20,26,32,0.18)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100">
                  <metric.icon className="h-7 w-7 text-primary-700" />
                </div>
                <div className="mt-5 text-3xl font-bold text-ink-950">
                  {metric.value.toLocaleString()}{metric.suffix}
                </div>
                <div className="mt-2 text-sm leading-5 text-ink-600">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactMetrics;
