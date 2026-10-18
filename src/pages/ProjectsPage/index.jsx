import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar, FiHeart, FiMapPin, FiSearch, FiTarget } from 'react-icons/fi';
import CommonLoader from '../../components/common/CommonLoader';
import CommonPopup from '../../components/common/CommonPopup';
import CommonSelect from '../../components/common/CommonSelect';
import apiService from '../../services/api';
import ProjectVisual from './ProjectVisual';
import { dateLabel, impactEntries, impactLabel, impactValue, moneyLabel, projectId, statusLabel } from './projectUtils';

const statusOptions = [
  { value: 'all', label: 'All Projects' },
  { value: 'ongoing', label: 'In Progress' },
  { value: 'planned', label: 'Coming Soon' },
  { value: 'completed', label: 'Completed' },
];

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedProject, setSelectedProject] = useState(null);

  const loadProjects = async () => {
    setLoading(true);
    setLoadError(false);
    try { setProjects(await apiService.getProjects()); }
    catch { setLoadError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let active = true;
    apiService.getProjects()
      .then((items) => { if (active) setProjects(items); })
      .catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => [...new Set(projects.map((project) => project.category).filter(Boolean))].sort(), [projects]);
  const tabs = statusOptions.map((option) => ({
    ...option,
    count: option.value === 'all' ? projects.length : projects.filter((project) => project.status?.toLowerCase() === option.value).length,
  }));
  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) =>
      (category === 'all' || project.category?.toLowerCase() === category)
      && (status === 'all' || project.status?.toLowerCase() === status)
      && (!query || [project.title, project.description, project.location, project.category]
        .some((value) => value?.toLowerCase().includes(query))));
  }, [projects, search, category, status]);

  const clearFilters = () => { setSearch(''); setCategory('all'); setStatus('all'); setVisibleCount(12); };
  const hasFilters = Boolean(search.trim()) || category !== 'all' || status !== 'all';
  const viewProject = (project) => {
    const id = projectId(project);
    setSelectedProject(project);
    if (!id) return;
    apiService.getProjectById(id)
      .then((details) => setSelectedProject((current) => projectId(current) === id
        ? { ...current, ...details, description: details.description || current.description }
        : current))
      .catch(() => {});
  };
  const impact = impactEntries(selectedProject);
  const progress = Number(selectedProject?.progress);
  const showProgress = selectedProject?.status?.toLowerCase() === 'ongoing' && selectedProject.progress != null && Number.isFinite(progress);
  const description = selectedProject?.description?.trim();
  const additionalDetails = selectedProject?.longDescription?.trim();

  return <div className="flex min-h-full flex-col bg-[#faf8f3] text-ink-950">
    <section className={`container-custom flex flex-1 flex-col pt-2 ${loading ? 'pb-0' : 'pb-20'}`} aria-labelledby="project-list-title">
      <h1 id="project-list-title" className="sr-only">Projects</h1>
      <div className="mb-4 flex min-w-0 flex-col gap-3 border-b border-[#e4ddd2] pb-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex max-w-full min-w-0 gap-2 overflow-x-auto" role="group" aria-label="Project views">
          {tabs.map((tab) => <button key={tab.value} type="button" aria-pressed={status === tab.value} onClick={() => { setStatus(tab.value); setVisibleCount(12); }} className={`inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-3 text-sm font-semibold transition ${status === tab.value ? 'border-primary-700 bg-primary-800 text-white' : 'border-[#e4ddd2] bg-white text-ink-700 hover:border-primary-400 hover:text-primary-800'}`}>{tab.label}<span className={`text-xs ${status === tab.value ? 'text-white/80' : 'text-ink-500'}`}>{tab.count}</span></button>)}
        </div>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row xl:w-[min(38vw,650px)] xl:shrink-0">
          <label className="relative min-w-0 flex-1"><span className="sr-only">Search projects</span><FiSearch aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" /><input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(12); }} placeholder="Search projects by name or place" className="h-11 w-full rounded-md border border-[#ded8cd] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-500/15" /></label>
          {categories.length > 1 && <div className="min-w-0 sm:w-48 sm:shrink-0"><CommonSelect label="Project category" value={category} onChange={(value) => { setCategory(value); setVisibleCount(12); }} options={[{ value: 'all', label: 'All areas' }, ...categories.map((value) => ({ value: value.toLowerCase(), label: value }))]} className="!h-11 !rounded-md !border-[#ded8cd] !bg-white !shadow-none" menuClassName="!rounded-md !border-[#ded8cd] !shadow-xl" /></div>}
        </div>
      </div>

      {loading ? <div className="flex min-h-64 flex-1 items-center justify-center"><CommonLoader size="lg" label="Loading projects…" showLabel /></div>
        : loadError ? <div className="rounded-md border border-[#e4ddd2] bg-white px-6 py-16 text-center"><h2 className="text-xl font-bold">Projects could not load right now</h2><p className="mt-2 text-sm text-ink-600">Please try again in a moment.</p><button type="button" onClick={loadProjects} className="mt-5 rounded-md bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Try again</button></div>
        : filteredProjects.length === 0 ? <div className="rounded-md border border-[#e4ddd2] bg-white px-6 py-14 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-primary-50 text-primary-700"><FiTarget size={26} aria-hidden="true" /></div><h2 className="mt-4 text-xl font-bold">{projects.length === 0 ? 'Project stories are on their way' : 'No projects found'}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-600">{projects.length === 0 ? 'We are preparing the details of our work. Please check back soon.' : 'Try a different search or filter to see more projects.'}</p>{hasFilters && <button type="button" onClick={clearFilters} className="mt-5 rounded-md bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Browse all projects</button>}</div>
          : <><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filteredProjects.slice(0, visibleCount).map((project) => {
            const id = projectId(project);
            return <article key={id} className="group overflow-hidden rounded-md border border-[#e4ddd2] bg-white shadow-[0_14px_36px_-32px_rgba(9,42,43,0.45)] transition hover:border-primary-300 hover:shadow-md">
              <button type="button" onClick={() => viewProject(project)} className="flex h-full w-full flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600" aria-label={`View ${project.title || 'project'} details`}>
                <ProjectVisual project={project} compact className="h-40 w-full shrink-0 sm:h-44" />
                <div className="flex min-w-0 flex-1 flex-col p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-700"><span>{project.category || 'Community'}</span><span className="h-1 w-1 rounded-full bg-stone-400" aria-hidden="true" /><span className="text-ink-500">{statusLabel(project.status)}</span></div>
                  <h2 className="mt-3 break-words text-xl font-bold leading-snug text-ink-950 [overflow-wrap:anywhere]">{project.title || 'Community project'}</h2>
                  <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-ink-600 [overflow-wrap:anywhere]">{project.description || 'Learn about this community initiative and the people behind it.'}</p>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-6">{project.location ? <span className="inline-flex items-center gap-1.5 text-xs text-ink-500"><FiMapPin aria-hidden="true" />{project.location}</span> : <span />}<span className="inline-flex items-center gap-2 text-sm font-bold text-primary-800">View details <FiArrowRight aria-hidden="true" /></span></div>
                </div>
              </button>
            </article>;
          })}</div>{filteredProjects.length > visibleCount && <div className="mt-10 text-center"><button type="button" onClick={() => setVisibleCount((count) => count + 12)} className="rounded-md border border-primary-300 bg-white px-6 py-3 text-sm font-bold text-primary-800 hover:bg-primary-50">Show more projects</button></div>}</>}
    </section>

    <CommonPopup open={Boolean(selectedProject)} title={selectedProject?.title || 'Project details'} onClose={() => setSelectedProject(null)} size="lg" footer={selectedProject && <div className="flex flex-wrap items-center justify-end gap-2"><Link to="/donate" className="inline-flex items-center gap-2 rounded-md bg-accent-400 px-4 py-2 font-semibold text-primary-950 hover:bg-accent-300"><FiHeart aria-hidden="true" /> Support our work</Link><button type="button" onClick={() => setSelectedProject(null)} className="rounded-md border border-[#ded8cd] bg-white px-4 py-2 font-semibold text-ink-700 hover:bg-[#faf8f3]">Close</button></div>}>
      {selectedProject && <div className="space-y-5">
        <div className="flex items-center gap-4"><ProjectVisual project={selectedProject} compact className="h-24 w-28 shrink-0 rounded-md border border-[#e4ddd2]" /><div className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-700"><span>{selectedProject.category || 'Community'}</span><span className="h-1 w-1 rounded-full bg-stone-400" aria-hidden="true" /><span className="text-ink-500">{statusLabel(selectedProject.status)}</span></div></div>
        <section><h3 className="text-base font-bold">Description</h3><p tabIndex={0} className="admin-table-scroll mt-2 min-h-[50px] max-h-40 overflow-y-auto overscroll-contain whitespace-pre-wrap break-words pr-2 leading-7 text-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600 [overflow-wrap:anywhere]">{description || additionalDetails || 'More details will be shared soon.'}</p></section>
        {additionalDetails && additionalDetails !== description && <section><h3 className="text-base font-bold">More about this project</h3><p tabIndex={0} className="admin-table-scroll mt-2 min-h-[50px] max-h-40 overflow-y-auto overscroll-contain whitespace-pre-wrap break-words pr-2 leading-7 text-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600 [overflow-wrap:anywhere]">{additionalDetails}</p></section>}
        {(selectedProject.location || dateLabel(selectedProject.startDate) || dateLabel(selectedProject.endDate) || Number(selectedProject.goal) > 0 || Number(selectedProject.raised) > 0 || showProgress) && <div className="grid gap-3 rounded-md bg-[#faf8f3] p-4 text-sm sm:grid-cols-2">{selectedProject.location && <div><span className="text-ink-500">Location</span><p className="mt-1 font-semibold">{selectedProject.location}</p></div>}{dateLabel(selectedProject.startDate) && <div><span className="text-ink-500">Started</span><p className="mt-1 font-semibold"><FiCalendar aria-hidden="true" className="mr-1 inline" />{dateLabel(selectedProject.startDate)}</p></div>}{dateLabel(selectedProject.endDate) && <div><span className="text-ink-500">End date</span><p className="mt-1 font-semibold">{dateLabel(selectedProject.endDate)}</p></div>}{Number(selectedProject.goal) > 0 && <div><span className="text-ink-500">Funding goal</span><p className="mt-1 font-semibold">{moneyLabel(selectedProject.goal)}</p></div>}{selectedProject.raised != null && (Number(selectedProject.goal) > 0 || Number(selectedProject.raised) > 0) && <div><span className="text-ink-500">Raised</span><p className="mt-1 font-semibold">{moneyLabel(selectedProject.raised)}</p></div>}{showProgress && <div><span className="text-ink-500">Progress</span><p className="mt-1 font-semibold">{Math.max(0, Math.min(100, progress))}%</p></div>}</div>}
        {impact.length > 0 && <div><h3 className="font-bold">Impact so far</h3><div className="mt-3 grid gap-3 sm:grid-cols-3">{impact.map(([label, value]) => <div key={label} className="rounded-md border border-[#e4ddd2] p-3"><div className="break-words text-lg font-bold text-primary-800 [overflow-wrap:anywhere]">{impactValue(value)}</div><div className="text-xs capitalize text-ink-600">{impactLabel(label)}</div></div>)}</div></div>}
        {Array.isArray(selectedProject.objectives) && selectedProject.objectives.length > 0 && <div><h3 className="font-bold">What we aim to do</h3><ul className="mt-2 list-inside list-disc space-y-1 text-ink-700">{selectedProject.objectives.map((item, index) => <li key={index} className="break-words [overflow-wrap:anywhere]">{item}</li>)}</ul></div>}
        {Array.isArray(selectedProject.achievements) && selectedProject.achievements.length > 0 && <div><h3 className="font-bold">What we have achieved</h3><ul className="mt-2 list-inside list-disc space-y-1 text-ink-700">{selectedProject.achievements.map((item, index) => <li key={index} className="break-words [overflow-wrap:anywhere]">{item}</li>)}</ul></div>}
        {Array.isArray(selectedProject.partners) && selectedProject.partners.length > 0 && <p className="text-ink-700"><strong>Community partners:</strong> {selectedProject.partners.join(', ')}</p>}
      </div>}
    </CommonPopup>
  </div>;
};

export default ProjectsPage;
