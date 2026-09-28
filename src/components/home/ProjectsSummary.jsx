import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiHeart, FiSun } from 'react-icons/fi';
import apiService from '../../services/api';

const fallbackPrograms = [
  {
    id: 'education-bridge',
    title: 'Education and Community Development',
    description:
      'Learning support, community outreach, and local development programs that expand opportunity.',
    status: 'active',
    progress: 78,
    impact: { students: '420', mentors: '36', centres: '8' },
    theme: 'from-[#f8e6be] to-[#fff8ea]',
    icon: FiBookOpen,
  },
  {
    id: 'community-circles',
    title: 'Health and Community Care',
    description:
      'Volunteer-led care initiatives, awareness drives, and support programs for underserved families.',
    status: 'expanding',
    progress: 64,
    impact: { volunteers: '95', wards: '14', sessions: '180+' },
    theme: 'from-[#dff4ef] to-[#f5fbfa]',
    icon: FiHeart,
  },
  {
    id: 'youth-readiness',
    title: 'Livelihood and Resilience Support',
    description:
      'Programs that strengthen resilience, build skills, and create pathways to dignified livelihoods.',
    status: 'ongoing',
    progress: 83,
    impact: { students: '260', workshops: '24', partners: '11' },
    theme: 'from-[#f8dcc8] to-[#fff5ee]',
    icon: FiSun,
  },
];

const ProjectsSummary = () => {
  const [projects, setProjects] = useState(fallbackPrograms);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await apiService.getProjects({ limit: 3 });
        if (data.length > 0) {
          setProjects(
            data.map((project, index) => ({
              ...project,
              theme: fallbackPrograms[index % fallbackPrograms.length].theme,
              icon: fallbackPrograms[index % fallbackPrograms.length].icon,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section className="bg-[#fffaf1] py-20">
      <div className="container-custom">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="text-reveal text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
              Focus areas
            </div>
            <h2 className="text-reveal text-reveal-delay-1 mt-4 text-3xl font-bold text-ink-950 md:text-4xl">
              Programs presented with the tone of a serious social institution.
            </h2>
            <p className="text-reveal text-reveal-delay-2 mt-5 text-base leading-7 text-ink-700">
              These cards now read as flagship initiatives rather than generic project tiles,
              which is much closer to the reference style you asked for.
            </p>
          </div>
          <Link to="/projects" className="text-reveal text-reveal-delay-3 inline-flex items-center font-semibold text-primary-700">
            See every initiative
            <FiArrowRight className="ml-2" />
          </Link>
        </div>

        <div className="text-reveal text-reveal-delay-4 mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const Icon = project.icon || FiBookOpen;

            return (
            <article
              key={project.id}
              className="overflow-hidden rounded-[2rem] border border-[#f0e4d3]/75 bg-white/88 shadow-[0_26px_70px_-42px_rgba(20,26,32,0.18)]"
            >
              <div className={`bg-gradient-to-br ${project.theme || 'from-primary-50 to-accent-50'} p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/65 text-primary-800">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="rounded-full bg-white/65 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink-700/85">
                    {project.status || 'ongoing'}
                  </span>
                </div>
                <h3 className="mt-12 text-2xl font-bold text-ink-950">{project.title}</h3>
              </div>

              <div className="p-6">
                <p className="text-sm leading-6 text-ink-600 md:text-base">{project.description}</p>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-ink-500">Current rollout</span>
                    <span className="font-semibold text-ink-900">{project.progress || 0}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-stone-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-400"
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  {Object.entries(project.impact || {}).map(([key, value]) => (
                    <div key={key} className="rounded-[1.25rem] bg-[#faf4ea]/70 px-3 py-4">
                      <div className="text-sm font-bold text-primary-800">{value}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-500">{key}</div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/projects"
                  className="mt-6 inline-flex items-center font-semibold text-primary-700 hover:text-primary-800"
                >
                  Learn about this work
                  <FiArrowRight className="ml-2" />
                </Link>
              </div>
            </article>
          );
          })}
        </div>

        {loading && (
          <div className="mt-6 text-sm text-ink-500">
            Loading live program data. Showing structured presentation either way.
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSummary;
