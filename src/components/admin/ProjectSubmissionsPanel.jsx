import { useEffect, useState } from 'react';
import { FiCheckCircle, FiChevronDown, FiEdit2, FiEye, FiFileText, FiSearch, FiTrash2, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import CommonLoader from '../common/CommonLoader';
import CommonPopup from '../common/CommonPopup';
import FormDatePicker from '../common/FormDatePicker';
import Pagination from '../common/Pagination';
import apiService from '../../services/api';

const proposalQuestions = [
  { title: 'Project Title', fields: [['title', 'Project title', 'text', true]] },
  { title: 'Submitted By', fields: [['submittedByName', 'Name', 'text', true], ['position', 'Position']] },
  { title: 'Department / Wing', fields: [['departmentWing', 'Department or wing', 'text', true]] },
  { title: 'Date of Submission', fields: [['submissionDate', 'Submission date', 'date', true]] },
  { title: 'Project Objective (1–2 lines)', fields: [['objective', 'Objective', 'textarea', true]] },
  { title: 'Project Summary', fields: [['summary', 'Summary', 'textarea', true]] },
  { title: 'Target Group / Audience', fields: [['targetGroup', 'Target group', 'text', true]] },
  { title: 'Duration & Timeline', fields: [['timeline', 'Timeline', 'textarea', true]] },
  { title: 'Estimated Budget', fields: [['estimatedBudget', 'Estimated total (₹)', 'text', true], ['expenseItems', 'Key expense items']] },
  { title: 'Resource Needs', fields: [['resourceNeeds', 'Resources', 'textarea', true]] },
  { title: 'Partnerships (if any)', fields: [['partnerships', 'Partners', 'textarea']] },
  { title: 'Approval Flow', fields: [['approvalDirector', 'Department Director'], ['approvalWingSecretary', 'Wing Secretary'], ['approvalTreasury', 'Treasury / Admin'], ['finalApproval', 'Final approval']] },
];

const reportQuestions = [
  { title: 'Project Title', fields: [['title', 'Project title', 'text', true]] },
  { title: 'Conducted By', fields: [['conductedBy', 'Organizers', 'textarea', true]] },
  { title: 'Date(s) & Location', fields: [['datesLocation', 'Dates and location', 'text', true]] },
  { title: 'Objective Recap', fields: [['objectiveRecap', 'Objective', 'textarea', true]] },
  { title: 'Summary of Activities', fields: [['activities', 'Activities', 'textarea', true]] },
  { title: 'Participation Details', fields: [['attendeeCount', 'Attendees / beneficiaries', 'number', true], ['targetAudience', 'Target audience reached', 'text', true], ['volunteers', 'Volunteers / teams involved', 'text', true]] },
  { title: 'Key Highlights & Outcomes', fields: [['achievements', 'Achievements', 'textarea', true], ['notableExperiences', 'Notable experiences or guests', 'textarea'], ['milestones', 'Milestones reached', 'textarea']] },
  { title: 'Budget Utilization Summary', budget: true },
  { title: 'Photos & Media Evidence', fields: [['mediaEvidence', 'Evidence links', 'textarea']] },
  { title: 'Feedback Received', fields: [['feedback', 'Feedback', 'textarea']] },
  { title: 'Challenges Faced', fields: [['challenges', 'Challenges', 'textarea']] },
  { title: 'Recommendations for Future', fields: [['recommendations', 'Recommendations', 'textarea']] },
  { title: 'Prepared By', fields: [['preparedName', 'Name', 'text', true], ['preparedRole', 'Role'], ['preparedSignature', 'Typed signature'], ['preparedDate', 'Date', 'date', true]] },
  { title: 'Reviewed & Forwarded By', fields: [['reviewDirector', 'Department Director', 'textarea'], ['reviewWingSecretary', 'Wing Secretary', 'textarea'], ['reviewGeneralSecretary', 'General Secretary', 'textarea']] },
];

const dateLabel = value => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const statusStyle = { pending: 'bg-amber-50 text-amber-700', approved: 'bg-green-50 text-green-700', rejected: 'bg-red-50 text-red-700' };
const fieldClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100';

const ProjectSubmissionsPanel = () => {
  const [kind, setKind] = useState('proposal');
  const [menuOpen, setMenuOpen] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    let active = true;
    apiService.getProjectSubmissions(kind, { page, pageSize, search: search.trim() || undefined })
      .then(response => { if (active) { setItems(Array.isArray(response?.data) ? response.data : []); setTotal(response?.totalRowCount || 0); } })
      .catch(error => { if (active) toast.error(error.message || 'Could not load project forms.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kind, page, pageSize, search]);

  const questions = kind === 'proposal' ? proposalQuestions : reportQuestions;
  const close = () => { if (!busy) { setSelected(null); setEditing(false); setDraft(null); } };
  const open = (item, edit = false) => { setSelected(item); setDraft({ title: item.title, answers: structuredClone(item.answers || {}) }); setEditing(edit); };
  const change = (key, value) => setDraft(previous => key === 'title' ? { ...previous, title: value } : { ...previous, answers: { ...previous.answers, [key]: value } });
  const budgetChange = (index, key, value) => setDraft(previous => ({ ...previous, answers: { ...previous.answers, budgetItems: previous.answers.budgetItems.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row) } }));
  const updateLocal = updated => { setItems(previous => previous.map(item => item.id === updated.id ? updated : item)); setSelected(previous => previous?.id === updated.id ? updated : previous); };

  const save = async event => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await apiService.updateProjectSubmission(selected.id, draft);
      updateLocal(response.data);
      setEditing(false);
      toast.success('Project form updated.');
    } catch (error) { toast.error(error.message || 'Could not save changes.'); }
    finally { setBusy(false); }
  };
  const decide = async (item, status) => {
    setBusy(true);
    try {
      const response = await apiService.reviewProjectSubmission(item.id, status);
      updateLocal(response.data);
      toast.success(`Project ${kind} ${status}.`);
    } catch (error) { toast.error(error.message || 'Could not update status.'); }
    finally { setBusy(false); }
  };
  const remove = async item => {
    if (!window.confirm(`Delete ${item.title}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await apiService.deleteProjectSubmission(item.id);
      setItems(previous => previous.filter(record => record.id !== item.id));
      setTotal(previous => previous - 1);
      if (items.length === 1 && page > 1) setPage(page - 1);
      setSelected(null);
      toast.success('Project form deleted.');
    } catch (error) { toast.error(error.message || 'Could not delete the form.'); }
    finally { setBusy(false); }
  };

  const field = ([key, label, type = 'text', required = false]) => {
    const value = key === 'title' ? draft?.title : draft?.answers?.[key];
    if (editing && type === 'date') return <div key={key}><FormDatePicker label={label} value={value} onChange={next => change(key, next)} required={required} /></div>;
    return <div key={key} className="min-w-0"><div className="text-sm font-medium text-slate-700">{label}{editing && required && <span className="ml-1 text-red-600">*</span>}</div>
      {editing ? type === 'textarea' ? <textarea required={required} maxLength={5000} value={value || ''} onChange={event => change(key, event.target.value)} className={`${fieldClass} min-h-[100px] max-h-[102px] resize-y overflow-y-auto`} />
          : <input type={type} required={required} maxLength={type === 'text' ? 5000 : undefined} value={value || ''} onChange={event => change(key, event.target.value)} className={fieldClass} />
        : <p className="mt-1 min-h-10 whitespace-pre-wrap break-words rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-800">{value || '—'}</p>}
    </div>;
  };

  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="mb-3 flex flex-wrap items-center gap-3">
      <div className="relative">
        <button type="button" aria-expanded={menuOpen} aria-haspopup="menu" onClick={() => setMenuOpen(previous => !previous)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-primary-200 bg-white px-3 text-sm font-semibold text-primary-800 shadow-sm"><FiFileText />{kind === 'proposal' ? 'Project Proposals' : 'Project Reports'}<FiChevronDown /></button>
        {menuOpen && <div role="menu" className="absolute left-0 top-10 z-20 min-w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">{[['proposal', 'Project Proposals'], ['report', 'Project Reports']].map(([value, label]) => <button key={value} type="button" role="menuitem" onClick={() => { setKind(value); setItems([]); setLoading(true); setSearch(''); setPage(1); setMenuOpen(false); }} className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-primary-50">{label}</button>)}</div>}
      </div>
      <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">{total}</span>
      <div className="relative ml-auto w-full sm:w-64"><FiSearch className="absolute left-3 top-2.5 text-slate-400" /><input type="search" aria-label={`Search project ${kind}s`} placeholder={`Search ${kind}s...`} value={search} onChange={event => { setSearch(event.target.value); setPage(1); setLoading(true); }} className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary-500" /></div>
    </div>
    <div className="admin-table-scroll min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-white">
      {loading ? <div className="flex h-full items-center justify-center"><CommonLoader /></div> : items.length === 0 ? <div className="px-5 py-16 text-center text-slate-500">No project {kind}s found.</div> : <div className="divide-y divide-slate-100">{items.map(item => <div key={item.id} className="grid gap-3 p-4 hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_9rem_9rem_auto] sm:items-center">
        <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.answers?.submittedByName || item.answers?.preparedName || '—'}</p></div>
        <div className="text-sm text-slate-600">{dateLabel(item.createdAt)}</div>
        <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle[item.status || 'pending']}`}>{item.status || 'pending'}</span>
        <div className="flex items-center gap-1 sm:justify-end">
          <button type="button" aria-label={`View ${item.title}`} data-tooltip="View" onClick={() => open(item)} className="rounded-lg p-2 text-sky-700 hover:bg-sky-50"><FiEye /></button>
          <button type="button" aria-label={`Edit ${item.title}`} data-tooltip="Edit" onClick={() => open(item, true)} className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"><FiEdit2 /></button>
          <button type="button" aria-label={`Approve ${item.title}`} data-tooltip="Approve" disabled={busy || item.status === 'approved'} onClick={() => decide(item, 'approved')} className="rounded-lg p-2 text-green-700 hover:bg-green-50 disabled:opacity-30"><FiCheckCircle /></button>
          <button type="button" aria-label={`Reject ${item.title}`} data-tooltip="Reject" disabled={busy || item.status === 'rejected'} onClick={() => decide(item, 'rejected')} className="rounded-lg p-2 text-amber-700 hover:bg-amber-50 disabled:opacity-30"><FiXCircle /></button>
          <button type="button" aria-label={`Delete ${item.title}`} data-tooltip="Delete" disabled={busy} onClick={() => remove(item)} className="rounded-lg p-2 text-red-700 hover:bg-red-50 disabled:opacity-30"><FiTrash2 /></button>
        </div>
      </div>)}</div>}
    </div>
    <Pagination page={page} pageSize={pageSize} total={total} onPageChange={next => { setPage(next); setLoading(true); }} onPageSizeChange={next => { setPageSize(next); setPage(1); setLoading(true); }} disabled={loading} itemLabel="Forms" />
    <CommonPopup open={Boolean(selected)} title={`${editing ? 'Edit' : 'View'} Project ${kind === 'proposal' ? 'Proposal' : 'Report'}`} description={selected?.title} size="lg" busy={busy} onClose={close} footer={<div className="flex flex-wrap justify-end gap-2">{editing ? <><button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Cancel</button><button type="submit" form="admin-project-form" disabled={busy} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save Changes</button></> : <><button type="button" onClick={() => setEditing(true)} className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700">Edit</button><button type="button" disabled={busy || selected?.status === 'approved'} onClick={() => decide(selected, 'approved')} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Approve</button><button type="button" disabled={busy || selected?.status === 'rejected'} onClick={() => decide(selected, 'rejected')} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Reject</button></>}</div>}>
      {selected && <form id="admin-project-form" onSubmit={save} className="space-y-3"><div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-xs font-medium text-slate-500">Submitted {dateLabel(selected.createdAt)}</span><span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusStyle[selected.status || 'pending']}`}>{selected.status || 'pending'}</span></div>
        {questions.map((question, index) => <section key={question.title} className="rounded-xl border border-slate-200 p-4"><h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-xs text-primary-700">{index + 1}</span>{question.title}</h3>
          {question.budget ? <div className="space-y-2">{(draft.answers.budgetItems || []).map((row, rowIndex) => <div key={rowIndex} className="grid gap-2 rounded-lg bg-slate-50 p-2 sm:grid-cols-4">{['item', 'estimated', 'actual', 'remarks'].map(key => <div key={key}><div className="text-xs font-medium capitalize text-slate-600">{key}</div>{editing ? <input value={row[key] || ''} maxLength={500} onChange={event => budgetChange(rowIndex, key, event.target.value)} className={fieldClass} /> : <p className="mt-1 break-words text-sm text-slate-800">{row[key] || '—'}</p>}</div>)}{editing && <button type="button" onClick={() => change('budgetItems', draft.answers.budgetItems.filter((_, i) => i !== rowIndex))} className="text-left text-xs text-red-600 sm:col-span-4">Remove row</button>}</div>)}{editing && <button type="button" onClick={() => change('budgetItems', [...(draft.answers.budgetItems || []), { item: '', estimated: '', actual: '', remarks: '' }])} className="text-sm font-semibold text-primary-700">+ Add budget item</button>}</div>
            : <div className={`grid gap-3 ${question.fields.length > 1 ? 'sm:grid-cols-2' : ''}`}>{question.fields.map(field)}</div>}</section>)}
      </form>}
    </CommonPopup>
  </div>;
};

export default ProjectSubmissionsPanel;
