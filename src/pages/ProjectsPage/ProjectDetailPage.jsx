import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCalendar, FiHeart, FiMapPin } from 'react-icons/fi';
import CommonLoader from '../../components/common/CommonLoader';
import apiService from '../../services/api';
import ProjectVisual from './ProjectVisual';
import { dateLabel, impactEntries, impactLabel, impactValue, moneyLabel, projectId, statusLabel } from './projectUtils';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const initialProject = String(projectId(location.state?.project) || '') === id ? location.state.project : null;
  const [project, setProject] = useState(initialProject);
  const [loading, setLoading] = useState(!initialProject);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    apiService.getProjectById(id).then((details) => {
      if (active) { setProject(details); setLoadError(false); }
    }).catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, retryCount]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center bg-[#faf8f3]"><CommonLoader size="lg" label="Loading project…" showLabel /></div>;
  if (!project) return <div className="min-h-[60vh] bg-[#faf8f3] px-5 py-24 text-center"><h1 className="text-3xl font-bold">{loadError ? 'Project could not load' : 'Project not found'}</h1><p className="mt-3 text-ink-600">Please try again or browse the other projects.</p><div className="mt-6 flex justify-center gap-3">{loadError && <button type="button" onClick={() => { setLoading(true); setRetryCount((count) => count + 1); }} className="rounded-md bg-primary-800 px-5 py-2.5 font-semibold text-white">Try again</button>}<Link to="/projects" className="rounded-md border border-primary-800 px-5 py-2.5 font-semibold text-primary-800">All projects</Link></div></div>;

  const impact = impactEntries(project);
  const progress = Number(project.progress);
  const showProgress = project.status?.toLowerCase() === 'ongoing' && project.progress != null && Number.isFinite(progress);
  const photos = (Array.isArray(project.gallery) ? project.gallery : []).filter((source) => source && source !== project.gallery?.[0]);

  return <div className="min-h-full bg-[#faf8f3] text-ink-950">
    <main className="container-custom pb-8 pt-5 sm:pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-800 hover:text-primary-600"><FiArrowLeft aria-hidden="true" /> All projects</Link>
        <Link to="/donate" className="inline-flex items-center justify-center gap-2 rounded-md bg-accent-400 px-4 py-2.5 text-sm font-bold text-primary-950 transition hover:bg-accent-300"><FiHeart aria-hidden="true" /> Support our work <FiArrowRight aria-hidden="true" /></Link>
      </div>

      <header className="mt-5 grid min-w-0 gap-5 border-b border-[#e4ddd2] pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,35%)] lg:items-center lg:gap-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary-700"><span>{project.category || 'Community project'}</span><span className="h-1 w-1 rounded-full bg-stone-400" aria-hidden="true" /><span className="text-ink-500">{statusLabel(project.status)}</span></div>
          <h1 className="mt-3 break-words text-3xl font-bold leading-tight tracking-tight sm:text-4xl [overflow-wrap:anywhere]">{project.title || 'Community project'}</h1>
          <p className="mt-3 line-clamp-2 max-w-3xl break-words text-base leading-7 text-ink-700 [overflow-wrap:anywhere]">{project.description || 'Learn about this community initiative and the people behind it.'}</p>
          {(project.location || dateLabel(project.startDate)) && <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">{project.location && <span className="inline-flex items-center gap-2"><FiMapPin aria-hidden="true" />{project.location}</span>}{dateLabel(project.startDate) && <span className="inline-flex items-center gap-2"><FiCalendar aria-hidden="true" />Started {dateLabel(project.startDate)}</span>}</div>}
        </div>
        <ProjectVisual project={project} eager compact className="h-44 w-full rounded-lg border border-[#e4ddd2] sm:h-48" />
      </header>

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <section className="rounded-lg border border-[#e4ddd2] bg-white p-5 sm:p-6"><h2 className="text-xl font-bold">About this project</h2><p className="mt-3 whitespace-pre-wrap break-words leading-7 text-ink-700 [overflow-wrap:anywhere]">{project.longDescription || project.description || 'More details will be shared soon.'}</p></section>
          {impact.length > 0 && <section className="rounded-lg border border-[#e4ddd2] bg-white p-6 sm:p-8"><h2 className="text-2xl font-bold">Impact so far</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{impact.map(([label, value]) => <div key={label} className="min-w-0 rounded-md border border-[#e4ddd2] bg-[#faf8f3] p-4"><div className="break-words text-2xl font-bold text-primary-800 [overflow-wrap:anywhere]">{impactValue(value)}</div><div className="mt-1 text-sm capitalize text-ink-600">{impactLabel(label)}</div></div>)}</div></section>}
          {Array.isArray(project.objectives) && project.objectives.length > 0 && <section className="rounded-lg border border-[#e4ddd2] bg-white p-6 sm:p-8"><h2 className="text-2xl font-bold">What we aim to do</h2><ul className="mt-5 space-y-3 text-ink-700">{project.objectives.map((item, index) => <li key={index} className="flex min-w-0 gap-3 break-words [overflow-wrap:anywhere]"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-400" />{item}</li>)}</ul></section>}
          {Array.isArray(project.achievements) && project.achievements.length > 0 && <section className="rounded-lg border border-[#e4ddd2] bg-white p-6 sm:p-8"><h2 className="text-2xl font-bold">What we have achieved</h2><ul className="mt-5 space-y-3 text-ink-700">{project.achievements.map((item, index) => <li key={index} className="flex min-w-0 gap-3 break-words [overflow-wrap:anywhere]"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-600" />{item}</li>)}</ul></section>}
          {photos.length > 0 && <ProjectGallery photos={photos} title={project.title} />}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-[#e4ddd2] bg-white p-5"><h2 className="text-lg font-bold">At a glance</h2><dl className="mt-3 divide-y divide-[#eee9e0] text-sm"><div className="flex justify-between gap-4 py-2.5"><dt className="text-ink-500">Status</dt><dd className="text-right font-semibold">{statusLabel(project.status)}</dd></div>{project.category && <div className="flex justify-between gap-4 py-2.5"><dt className="text-ink-500">Area</dt><dd className="text-right font-semibold">{project.category}</dd></div>}{project.location && <div className="flex justify-between gap-4 py-2.5"><dt className="text-ink-500">Location</dt><dd className="break-words text-right font-semibold [overflow-wrap:anywhere]">{project.location}</dd></div>}{dateLabel(project.startDate) && <div className="flex justify-between gap-4 py-2.5"><dt className="text-ink-500">Started</dt><dd className="text-right font-semibold">{dateLabel(project.startDate)}</dd></div>}{dateLabel(project.endDate) && <div className="flex justify-between gap-4 py-2.5"><dt className="text-ink-500">End date</dt><dd className="text-right font-semibold">{dateLabel(project.endDate)}</dd></div>}{Number(project.goal) > 0 && <div className="flex justify-between gap-4 py-2.5"><dt className="text-ink-500">Funding goal</dt><dd className="text-right font-semibold">{moneyLabel(project.goal)}</dd></div>}{project.raised != null && (Number(project.goal) > 0 || Number(project.raised) > 0) && <div className="flex justify-between gap-4 py-2.5"><dt className="text-ink-500">Raised</dt><dd className="text-right font-semibold">{moneyLabel(project.raised)}</dd></div>}</dl>{showProgress && <div className="mt-4 border-t border-[#eee9e0] pt-4"><div className="flex justify-between text-xs font-semibold"><span>Progress</span><span>{Math.max(0, Math.min(100, progress))}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-sm bg-primary-50"><div className="h-full bg-primary-600" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div></div>}</div>
          {Array.isArray(project.partners) && project.partners.length > 0 && <div className="rounded-lg border border-[#e4ddd2] bg-white p-6"><h2 className="font-bold">Community partners</h2><p className="mt-2 break-words text-sm leading-6 text-ink-600 [overflow-wrap:anywhere]">{project.partners.join(', ')}</p></div>}
        </aside>
      </div>
    </main>
  </div>;
};

const ProjectGallery = ({ photos, title }) => {
  const [loaded, setLoaded] = useState([]);
  return <section className={loaded.length ? 'rounded-lg border border-[#e4ddd2] bg-white p-6 sm:p-8' : 'h-0 overflow-hidden'}>
    <h2 className="text-2xl font-bold">Project photos</h2>
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{photos.map((source, index) => <img key={`${source}-${index}`} src={source} alt={`${title} photo ${index + 1}`} loading="eager" onLoad={() => setLoaded((previous) => previous.includes(source) ? previous : [...previous, source])} className={`${loaded.includes(source) ? '' : 'hidden'} h-36 w-full rounded-md object-cover sm:h-44`} />)}</div>
  </section>;
};

export default ProjectDetailPage;
