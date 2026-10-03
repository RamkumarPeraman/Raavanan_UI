import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCheckCircle, FiClock, FiEye, FiFilter, FiSearch, FiTarget, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import CommonLoader from '../../components/common/CommonLoader';
import CommonPopup from '../../components/common/CommonPopup';
import CommonSelect from '../../components/common/CommonSelect';
import Pagination from '../../components/common/Pagination';
import apiService from '../../services/api';

const emptyMetrics = { totalProjects: 0, ongoingProjects: 0, completedProjects: 0 };
const statusLabel = status => ({ ongoing: 'Ongoing', planned: 'Planned', completed: 'Completed' })[status] || 'Unknown';
const statusClass = status => ({ ongoing: 'bg-green-100 text-green-800', planned: 'bg-yellow-100 text-yellow-800', completed: 'bg-slate-100 text-slate-700' })[status] || 'bg-gray-100 text-gray-700';
const dateLabel = value => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString('en-GB') : '—';
const numberLabel = value => Number(value || 0).toLocaleString('en-IN');
const moneyLabel = value => `₹${numberLabel(value)}`;
const projectId = project => project?.id || project?._id;

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('ongoing');
  const [draftFilters, setDraftFilters] = useState({ category: 'all', status: 'ongoing' });
  const [filterPosition, setFilterPosition] = useState(null);
  const filterButtonRef = useRef(null);
  const filterPanelRef = useRef(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    const [projectResult, metricResult] = await Promise.allSettled([apiService.getProjects(), apiService.getProjectMetrics()]);
    if (projectResult.status === 'fulfilled') setProjects(projectResult.value);
    else { setLoadError(true); toast.error(projectResult.reason?.message || 'Unable to load projects'); }
    if (metricResult.status === 'fulfilled') setMetrics(metricResult.value || emptyMetrics);
    setLoading(false);
  };

  const loadProjects = () => {
    setLoading(true);
    setLoadError(false);
    void fetchProjects();
  };

  useEffect(() => { void fetchProjects(); }, []);

  const openFilters = () => {
    if (filterPosition) { setFilterPosition(null); return; }
    setDraftFilters({ category, status });
    const rect = filterButtonRef.current.getBoundingClientRect();
    setFilterPosition({ top: Math.min(rect.bottom + 6, Math.max(8, window.innerHeight - 260)), left: Math.max(8, Math.min(rect.left, window.innerWidth - 304)) });
  };

  useEffect(() => {
    if (!filterPosition) return undefined;
    const dismiss = event => {
      if (!filterPanelRef.current?.contains(event.target) && !filterButtonRef.current?.contains(event.target) && !event.target.closest?.('[role="listbox"]')) setFilterPosition(null);
    };
    const keydown = event => { if (event.key === 'Escape') { setFilterPosition(null); filterButtonRef.current?.focus(); } };
    const close = () => setFilterPosition(null);
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', keydown);
    window.addEventListener('resize', close);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', keydown); window.removeEventListener('resize', close); };
  }, [filterPosition]);

  const categories = useMemo(() => [...new Set(projects.map(project => project.category).filter(Boolean))].sort(), [projects]);
  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter(project =>
      (category === 'all' || project.category?.toLowerCase() === category)
      && (status === 'all' || project.status === status)
      && (!query || [project.title, project.description, project.location].some(value => value?.toLowerCase().includes(query))));
  }, [projects, category, status, search]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filteredProjects.length / pageSize)));
  const visibleProjects = filteredProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const viewProject = project => {
    setSelectedProject(project);
    const id = projectId(project);
    if (!id) return;
    apiService.getProjectById(id).then(details => {
      setSelectedProject(previous => projectId(previous) === id ? details : previous);
    }).catch(() => toast.error('Could not load additional project details'));
  };

  const selectSummary = nextStatus => {
    setCategory('all');
    setStatus(nextStatus);
    setPage(1);
    setFilterPosition(null);
  };

  const metricItems = [
    { icon: FiTarget, label: 'Total Projects', value: metrics.totalProjects, filter: 'all', color: 'border-blue-200 bg-blue-50 text-blue-700' },
    { icon: FiClock, label: 'Ongoing', value: metrics.ongoingProjects, filter: 'ongoing', color: 'border-green-200 bg-green-50 text-green-700' },
    { icon: FiCheckCircle, label: 'Completed', value: metrics.completedProjects, filter: 'completed', color: 'border-purple-200 bg-purple-50 text-purple-700' },
  ];

  return (
    <div className="flex h-full min-w-0 flex-col gap-3 overflow-hidden bg-gray-50 px-[5px] pt-20">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {metricItems.map(({ icon: Icon, label, value, filter, color }) => <button key={label} type="button" aria-pressed={category === 'all' && status === filter} onClick={() => selectSummary(filter)} className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2 text-xs transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${color} ${category === 'all' && status === filter ? 'font-semibold ring-1 ring-current' : ''}`}><Icon /><span>{label}</span><span className="font-semibold">{numberLabel(value)}</span></button>)}
        <div className="relative w-full sm:ml-auto sm:w-48"><FiSearch className="absolute left-2.5 top-2.5 text-gray-400" /><input aria-label="Search projects" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search projects…" className="h-[34px] w-full rounded-md border border-gray-200 bg-white pl-8 pr-2 text-xs focus:border-primary-500 focus:outline-none" /></div>
        <button ref={filterButtonRef} type="button" aria-expanded={Boolean(filterPosition)} aria-controls="project-filter-panel" onClick={openFilters} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-primary-700 hover:bg-primary-50"><FiFilter />Filters</button>
      </div>
      {filterPosition && createPortal(
        <section ref={filterPanelRef} id="project-filter-panel" role="dialog" aria-label="Project filters" tabIndex={-1} style={filterPosition} className="fixed z-50 w-72 max-w-[calc(100vw-16px)] max-h-[calc(100dvh-16px)] overflow-auto rounded-lg border border-slate-200 bg-white shadow-xl outline-none">
          <div className="flex items-center justify-between px-4 pt-3 text-sm font-semibold text-slate-800">Filters<button type="button" aria-label="Close filters" onClick={() => setFilterPosition(null)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><FiX /></button></div>
          <div className="space-y-4 p-4">
            <div><label className="mb-1.5 block text-xs font-medium text-slate-500">Category</label><CommonSelect label="Category" value={draftFilters.category} onChange={value => setDraftFilters(previous => ({ ...previous, category: value }))} options={[{ value: 'all', label: 'All Categories' }, ...categories.map(value => ({ value: value.toLowerCase(), label: value }))]} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-slate-500">Status</label><CommonSelect label="Status" value={draftFilters.status} onChange={value => setDraftFilters(previous => ({ ...previous, status: value }))} options={[{ value: 'all', label: 'All Status' }, { value: 'ongoing', label: 'Ongoing' }, { value: 'planned', label: 'Planned' }, { value: 'completed', label: 'Completed' }]} /></div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3"><button type="button" onClick={() => setDraftFilters({ category: 'all', status: 'all' })} className="text-xs text-slate-500 hover:text-slate-900">Clear</button><button type="button" onClick={() => { setCategory(draftFilters.category); setStatus(draftFilters.status); setPage(1); setFilterPosition(null); filterButtonRef.current?.focus(); }} className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700">Apply</button></div>
        </section>, document.body
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-md border border-gray-200 bg-white">
        {loading ? <div className="flex min-h-0 flex-1 items-center justify-center"><CommonLoader size="lg" label="Loading projects…" showLabel /></div>
          : loadError ? <div className="flex min-h-0 flex-1 items-center justify-center gap-2 text-sm text-gray-600">Could not load projects. <button onClick={loadProjects} className="text-primary-700 underline">Retry</button></div>
            : filteredProjects.length === 0 ? <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-gray-500">No projects match these filters.</div>
              : <>
                <div className="admin-table-scroll hidden min-h-0 flex-1 overflow-auto overscroll-contain lg:block">
                  <table className="w-full table-fixed text-sm"><colgroup><col className="w-[27%]" /><col className="w-[15%]" /><col className="w-[12%]" /><col className="w-[15%]" /><col className="w-[10%]" /><col className="w-[11%]" /><col className="w-[10%]" /></colgroup>
                    <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50"><tr>{['Project', 'Category', 'Status', 'Location', 'Progress', 'Start Date', 'Actions'].map(label => <th key={label} className={`px-3 py-3 text-left text-xs font-medium uppercase text-gray-500 ${label === 'Actions' ? 'text-right' : ''}`}>{label}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-100">{visibleProjects.map(project => <tr key={projectId(project)} className="hover:bg-slate-50">
                      <td className="px-3 py-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-primary-50 text-primary-600">{project.image ? <img src={project.image} alt="" className="h-full w-full object-cover" /> : <FiTarget />}</div><div className="min-w-0"><div className="truncate font-medium text-gray-900" title={project.title}>{project.title}</div><div className="truncate text-xs text-gray-500" title={project.description || ''}>{project.description || '—'}</div></div></div></td>
                      <td className="truncate px-3 py-3 text-gray-600" title={project.category || ''}>{project.category || '—'}</td>
                      <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs ${statusClass(project.status)}`}>{statusLabel(project.status)}</span></td>
                      <td className="truncate px-3 py-3 text-gray-600" title={project.location || ''}>{project.location || '—'}</td>
                      <td className="px-3 py-3 text-gray-600">{project.progress == null ? '—' : `${project.progress}%`}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-600">{dateLabel(project.startDate)}</td>
                      <td className="px-3 py-3 text-right"><button type="button" onClick={() => viewProject(project)} aria-label={`View ${project.title}`} className="inline-flex items-center gap-1 rounded px-2 py-1.5 text-primary-700 hover:bg-primary-50"><FiEye size={17} />View</button></td>
                    </tr>)}</tbody>
                  </table>
                </div>
                <div className="admin-table-scroll min-h-0 flex-1 space-y-2 overflow-y-auto bg-slate-50 p-2 lg:hidden">{visibleProjects.map(project => <article key={projectId(project)} className="rounded-lg border bg-white p-3 text-sm"><div className="flex gap-3"><div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-primary-50 text-primary-600">{project.image ? <img src={project.image} alt="" className="h-full w-full object-cover" /> : <FiTarget />}</div><div className="min-w-0 flex-1"><h2 className="font-semibold text-gray-900">{project.title}</h2><p className="mt-1 text-xs text-gray-500">{project.category || 'Uncategorized'} · {project.location || 'Location unavailable'}</p></div><span className={`h-fit shrink-0 rounded-full px-2 py-1 text-xs ${statusClass(project.status)}`}>{statusLabel(project.status)}</span></div><p className="mt-2 line-clamp-2 text-gray-600">{project.description}</p><div className="mt-2 flex items-center justify-between border-t pt-2"><span className="text-xs text-gray-500">Started {dateLabel(project.startDate)}</span><button type="button" onClick={() => viewProject(project)} className="inline-flex items-center gap-1 rounded px-2 py-1 text-primary-700 hover:bg-primary-50"><FiEye />View</button></div></article>)}</div>
              </>}
        <Pagination page={currentPage} pageSize={pageSize} total={filteredProjects.length} onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }} disabled={loading} itemLabel="Projects" />
      </div>

      <CommonPopup open={Boolean(selectedProject)} title={<div className="flex flex-wrap items-center gap-2"><span>{selectedProject?.title || 'Project details'}</span>{selectedProject && <><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(selectedProject.status)}`}>{statusLabel(selectedProject.status)}</span>{selectedProject.category && <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-800">{selectedProject.category}</span>}</>}</div>} onClose={() => setSelectedProject(null)} size="lg" footer={<div className="flex justify-end"><button type="button" onClick={() => setSelectedProject(null)} className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">Close</button></div>}>
        {selectedProject && <div className="space-y-5">
          <div className={selectedProject.image ? 'grid gap-4 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]' : ''}>
            {selectedProject.image && <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-2"><img src={selectedProject.image} alt={selectedProject.title} className="h-full w-full object-contain" /></div>}
            <div className="min-w-0"><h3 className="mb-1 font-semibold text-gray-900">About the project</h3><p className="whitespace-pre-wrap text-gray-700">{selectedProject.longDescription || selectedProject.description || 'No description available.'}</p></div>
          </div>
          <div className="grid gap-3 rounded-lg bg-gray-50 p-4 text-sm sm:grid-cols-2"><div><span className="text-gray-500">Location</span><p className="font-medium">{selectedProject.location || '—'}</p></div><div><span className="text-gray-500">Start date</span><p className="font-medium">{dateLabel(selectedProject.startDate)}</p></div><div><span className="text-gray-500">End date</span><p className="font-medium">{dateLabel(selectedProject.endDate)}</p></div><div><span className="text-gray-500">Progress</span><p className="font-medium">{selectedProject.progress == null ? '—' : `${selectedProject.progress}%`}</p></div>{selectedProject.goal != null && <div><span className="text-gray-500">Funding goal</span><p className="font-medium">{moneyLabel(selectedProject.goal)}</p></div>}{selectedProject.raised != null && <div><span className="text-gray-500">Raised</span><p className="font-medium">{moneyLabel(selectedProject.raised)}</p></div>}</div>
          {Array.isArray(selectedProject.objectives) && selectedProject.objectives.length > 0 && <div><h3 className="mb-1 font-semibold">Objectives</h3><ul className="list-inside list-disc space-y-1 text-gray-700">{selectedProject.objectives.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
          {Array.isArray(selectedProject.achievements) && selectedProject.achievements.length > 0 && <div><h3 className="mb-1 font-semibold">Achievements</h3><ul className="list-inside list-disc space-y-1 text-gray-700">{selectedProject.achievements.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
          {selectedProject.impact && Object.keys(selectedProject.impact).length > 0 && <div><h3 className="mb-2 font-semibold">Impact</h3><div className="grid gap-2 sm:grid-cols-3">{Object.entries(selectedProject.impact).map(([key, value]) => <div key={key} className="rounded border border-primary-100 bg-primary-50 p-3"><div className="font-semibold text-primary-700">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</div><div className="text-xs capitalize text-gray-600">{key.replace(/([A-Z])/g, ' $1')}</div></div>)}</div></div>}
          {Array.isArray(selectedProject.partners) && selectedProject.partners.length > 0 && <p><strong>Partners:</strong> {selectedProject.partners.join(', ')}</p>}
          {Array.isArray(selectedProject.funding) && selectedProject.funding.length > 0 && <p><strong>Funding partners:</strong> {selectedProject.funding.join(', ')}</p>}
          {Array.isArray(selectedProject.gallery) && selectedProject.gallery.length > 0 && <div><h3 className="mb-2 font-semibold">Gallery</h3><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{selectedProject.gallery.map((image, index) => <img key={index} src={image} alt={`${selectedProject.title} gallery ${index + 1}`} className="h-24 w-full rounded object-cover" />)}</div></div>}
        </div>}
      </CommonPopup>
    </div>
  );
};

export default ProjectsPage;
