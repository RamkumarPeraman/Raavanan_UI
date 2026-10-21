import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiClipboard, FiFileText, FiPlus, FiTrash2 } from 'react-icons/fi';
import CommonPopup from '../../components/common/CommonPopup';
import FormDatePicker from '../../components/common/FormDatePicker';
import apiService from '../../services/api';

const today = () => new Date().toISOString().slice(0, 10);
const currentName = () => { try { return JSON.parse(localStorage.getItem('user') || '{}').name || ''; } catch { return ''; } };
const emptyAnswers = kind => kind === 'proposal'
  ? { submittedByName: currentName(), position: '', departmentWing: '', submissionDate: today(), objective: '', summary: '', targetGroup: '', timeline: '', estimatedBudget: '', expenseItems: '', resourceNeeds: '', partnerships: '', approvalDirector: '', approvalWingSecretary: '', approvalTreasury: '', finalApproval: '' }
  : { conductedBy: '', datesLocation: '', objectiveRecap: '', activities: '', attendeeCount: '', targetAudience: '', volunteers: '', achievements: '', notableExperiences: '', milestones: '', budgetItems: [{ item: '', estimated: '', actual: '', remarks: '' }], mediaEvidence: '', feedback: '', challenges: '', recommendations: '', preparedName: currentName(), preparedRole: '', preparedSignature: '', preparedDate: today(), reviewDirector: '', reviewWingSecretary: '', reviewGeneralSecretary: '' };

const fieldClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100';
const Question = ({ number, title, prompt, children }) => <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
  <div className="mb-3 flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">{number}</span><div><h3 className="font-semibold text-slate-900">{title}</h3>{prompt && <p className="mt-0.5 text-sm text-slate-500">{prompt}</p>}</div></div>
  <div className="pl-0 sm:pl-10">{children}</div>
</section>;
const Field = ({ label, value, onChange, required = false, multiline = false, type = 'text', placeholder = '' }) => type === 'date'
  ? <FormDatePicker label={label} value={value} onChange={onChange} required={required} />
  : <label className="block text-sm font-medium text-slate-700">{label}{required && <span className="ml-1 text-red-600">*</span>}
  {multiline ? <textarea rows={3} maxLength={5000} required={required} value={value || ''} onChange={event => onChange(event.target.value)} placeholder={placeholder} className={`${fieldClass} min-h-[100px] max-h-[102px] resize-y overflow-y-auto`} />
    : <input type={type} maxLength={type === 'text' ? 5000 : undefined} required={required} value={value || ''} onChange={event => onChange(event.target.value)} placeholder={placeholder} className={fieldClass} />}
</label>;

const ProjectFormsPage = () => {
  const [kind, setKind] = useState('proposal');
  const [forms, setForms] = useState({ proposal: { title: '', answers: emptyAnswers('proposal') }, report: { title: '', answers: emptyAnswers('report') } });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const form = forms[kind];
  const answer = (key, value) => setForms(previous => ({ ...previous, [kind]: { ...previous[kind], answers: { ...previous[kind].answers, [key]: value } } }));
  const title = value => setForms(previous => ({ ...previous, [kind]: { ...previous[kind], title: value } }));
  const budgetRow = (index, key, value) => answer('budgetItems', form.answers.budgetItems.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  const budgetRows = form.answers.budgetItems;

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiService.getProjectSubmissions(kind)
      .then(response => { if (active) setRecent(Array.isArray(response?.data) ? response.data : []); })
      .catch(error => { if (active) toast.error(error.message || 'Could not load submitted forms.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kind]);

  const submit = async event => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await apiService.createProjectSubmission({ kind, ...form });
      setRecent(previous => [response.data, ...previous]);
      setForms(previous => ({ ...previous, [kind]: { title: '', answers: emptyAnswers(kind) } }));
      toast.success('Form submitted and saved.');
    } catch (error) {
      toast.error(error.message || 'Could not submit the form.');
    } finally {
      setSaving(false);
    }
  };

  return <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 px-3 pt-4 sm:px-6">
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
      <div className="mb-4 flex w-fit max-w-full shrink-0 flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm" role="tablist" aria-label="Project form type">
        {[['proposal', 'Project Proposal', FiClipboard], ['report', 'Project Report', FiFileText]].map(([value, label, Icon]) => <button key={value} type="button" role="tab" aria-selected={kind === value} onClick={() => setKind(value)} className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${kind === value ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}><Icon />{label}</button>)}
      </div>
      <div className="admin-table-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pb-10">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <form onSubmit={submit} className="min-w-0 space-y-3">
          {kind === 'proposal' ? <>
            <Question number="1" title="Project Title" prompt="Enter the name of the project clearly."><Field label="Project title" required value={form.title} onChange={title} /></Question>
            <Question number="2" title="Submitted By" prompt="Your name and position, if any."><div className="grid gap-3 sm:grid-cols-2"><Field label="Name" required value={form.answers.submittedByName} onChange={value => answer('submittedByName', value)} /><Field label="Position" value={form.answers.position} onChange={value => answer('position', value)} /></div></Question>
            <Question number="3" title="Department / Wing" prompt="Which department or wing is this proposal related to?"><Field label="Department or wing" required value={form.answers.departmentWing} onChange={value => answer('departmentWing', value)} /></Question>
            <Question number="4" title="Date of Submission"><Field label="Submission date" type="date" required value={form.answers.submissionDate} onChange={value => answer('submissionDate', value)} /></Question>
            <Question number="5" title="Project Objective (1–2 lines)" prompt="What is the main goal of this project?"><Field label="Objective" multiline required value={form.answers.objective} onChange={value => answer('objective', value)} /></Question>
            <Question number="6" title="Project Summary" prompt="What will happen, and why does it matter?"><Field label="Summary" multiline required value={form.answers.summary} onChange={value => answer('summary', value)} /></Question>
            <Question number="7" title="Target Group / Audience" prompt="Who will benefit from this project?"><Field label="Target group" required value={form.answers.targetGroup} onChange={value => answer('targetGroup', value)} /></Question>
            <Question number="8" title="Duration & Timeline" prompt="Include the expected duration, dates, and phases."><Field label="Timeline" multiline required value={form.answers.timeline} onChange={value => answer('timeline', value)} /></Question>
            <Question number="9" title="Estimated Budget" prompt="Give the rough total cost and key expense items."><div className="grid gap-3 sm:grid-cols-2"><Field label="Estimated total (₹)" required value={form.answers.estimatedBudget} onChange={value => answer('estimatedBudget', value)} /><Field label="Key expense items" value={form.answers.expenseItems} onChange={value => answer('expenseItems', value)} placeholder="Travel, food, materials…" /></div></Question>
            <Question number="10" title="Resource Needs" prompt="List volunteers, venues, equipment, or external support needed."><Field label="Resources" multiline required value={form.answers.resourceNeeds} onChange={value => answer('resourceNeeds', value)} /></Question>
            <Question number="11" title="Partnerships (if any)" prompt="Mention collaborating groups or sponsors."><Field label="Partners" multiline value={form.answers.partnerships} onChange={value => answer('partnerships', value)} /></Question>
            <Question number="12" title="Approval Flow" prompt="For officials: Department Director → Wing Secretary → Treasury/Admin → Final Approval."><div className="grid gap-3 sm:grid-cols-2">{[['approvalDirector', 'Department Director'], ['approvalWingSecretary', 'Wing Secretary'], ['approvalTreasury', 'Treasury / Admin'], ['finalApproval', 'Final approval']].map(([key, label]) => <Field key={key} label={label} value={form.answers[key]} onChange={value => answer(key, value)} placeholder="Name, decision, or comments" />)}</div></Question>
          </> : <>
       
            <Question number="1" title="Project Title" prompt="Official name of the project or event."><Field label="Project title" required value={form.title} onChange={title} /></Question>
            <Question number="2" title="Conducted By" prompt="Organizing department, Event Chair, and coordinators."><Field label="Organizers" multiline required value={form.answers.conductedBy} onChange={value => answer('conductedBy', value)} /></Question>
            <Question number="3" title="Date(s) & Location" prompt="Event dates and venue or address."><Field label="Dates and location" required value={form.answers.datesLocation} onChange={value => answer('datesLocation', value)} /></Question>
            <Question number="4" title="Objective Recap" prompt="Restate the original project objective."><Field label="Objective" multiline required value={form.answers.objectiveRecap} onChange={value => answer('objectiveRecap', value)} /></Question>
            <Question number="5" title="Summary of Activities" prompt="Include the schedule, activities, and number of sessions."><Field label="Activities" multiline required value={form.answers.activities} onChange={value => answer('activities', value)} /></Question>
            <Question number="6" title="Participation Details"><div className="grid gap-3 sm:grid-cols-3"><Field label="Attendees / beneficiaries" type="number" required value={form.answers.attendeeCount} onChange={value => answer('attendeeCount', value)} /><Field label="Target audience reached" required value={form.answers.targetAudience} onChange={value => answer('targetAudience', value)} /><Field label="Volunteers / teams involved" required value={form.answers.volunteers} onChange={value => answer('volunteers', value)} /></div></Question>
            <Question number="7" title="Key Highlights & Outcomes"><div className="space-y-3"><Field label="Achievements" multiline required value={form.answers.achievements} onChange={value => answer('achievements', value)} /><Field label="Notable experiences or guests" multiline value={form.answers.notableExperiences} onChange={value => answer('notableExperiences', value)} /><Field label="Milestones reached" multiline value={form.answers.milestones} onChange={value => answer('milestones', value)} /></div></Question>
            <Question number="8" title="Budget Utilization Summary" prompt="Add each expense with estimated and actual amounts."><div className="space-y-3">{budgetRows.map((row, index) => <div key={index} className="grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-[1.3fr_1fr_1fr_1.3fr_auto]"><Field label="Item" value={row.item} onChange={value => budgetRow(index, 'item', value)} /><Field label="Estimated ₹" type="number" value={row.estimated} onChange={value => budgetRow(index, 'estimated', value)} /><Field label="Actual ₹" type="number" value={row.actual} onChange={value => budgetRow(index, 'actual', value)} /><Field label="Remarks" value={row.remarks} onChange={value => budgetRow(index, 'remarks', value)} /><button type="button" aria-label="Remove budget row" disabled={budgetRows.length === 1} onClick={() => answer('budgetItems', budgetRows.filter((_, i) => i !== index))} className="self-end rounded p-2 text-red-600 disabled:opacity-30"><FiTrash2 /></button></div>)}<button type="button" onClick={() => answer('budgetItems', [...budgetRows, { item: '', estimated: '', actual: '', remarks: '' }])} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700"><FiPlus />Add budget item</button></div></Question>
            <Question number="9" title="Photos & Media Evidence" prompt="Add photo or video links, social media posts, or handles."><Field label="Evidence links" multiline value={form.answers.mediaEvidence} onChange={value => answer('mediaEvidence', value)} /></Question>
            <Question number="10" title="Feedback Received" prompt="Summarize verbal or written feedback."><Field label="Feedback" multiline value={form.answers.feedback} onChange={value => answer('feedback', value)} /></Question>
            <Question number="11" title="Challenges Faced" prompt="Difficulties, last-minute changes, or areas to improve."><Field label="Challenges" multiline value={form.answers.challenges} onChange={value => answer('challenges', value)} /></Question>
            <Question number="12" title="Recommendations for Future" prompt="Suggestions and team reflections."><Field label="Recommendations" multiline value={form.answers.recommendations} onChange={value => answer('recommendations', value)} /></Question>
            <Question number="13" title="Prepared By"><div className="grid gap-3 sm:grid-cols-2"><Field label="Name" required value={form.answers.preparedName} onChange={value => answer('preparedName', value)} /><Field label="Role" value={form.answers.preparedRole} onChange={value => answer('preparedRole', value)} /><Field label="Typed signature" value={form.answers.preparedSignature} onChange={value => answer('preparedSignature', value)} /><Field label="Date" type="date" required value={form.answers.preparedDate} onChange={value => answer('preparedDate', value)} /></div></Question>
            <Question number="14" title="Reviewed & Forwarded By" prompt="For officials: signatures, comments, and final note."><div className="space-y-3"><Field label="Department Director" multiline value={form.answers.reviewDirector} onChange={value => answer('reviewDirector', value)} /><Field label="Wing Secretary" multiline value={form.answers.reviewWingSecretary} onChange={value => answer('reviewWingSecretary', value)} /><Field label="General Secretary" multiline value={form.answers.reviewGeneralSecretary} onChange={value => answer('reviewGeneralSecretary', value)} /></div></Question>
          </>}
          <div className="flex justify-end pb-1"><button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50">{saving ? 'Submitting…' : `Submit ${kind === 'proposal' ? 'Project Proposal' : 'Project Report'}`}</button></div>
        </form>
        <aside className="sticky top-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="font-serif text-xl font-bold text-slate-900">Submitted {kind === 'proposal' ? 'proposals' : 'reports'}</h2><p className="mt-1 text-xs text-slate-500">Saved in the database · newest first</p><div className="mt-4 space-y-2">{loading ? <p className="text-sm text-slate-500">Loading submissions…</p> : recent.length ? recent.map(item => <button type="button" key={item.id} onClick={() => setSelected(item)} className="block w-full rounded-lg border border-slate-200 p-3 text-left hover:border-primary-300 hover:bg-primary-50"><span className="block truncate text-sm font-semibold text-slate-800">{item.title}</span><span className="mt-1 block text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span></button>) : <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">No submissions yet.</p>}</div></aside>
        </div>
      </div>
    </div>
    <CommonPopup open={Boolean(selected)} title={selected?.title || 'Submission'} size="lg" onClose={() => setSelected(null)} footer={<button type="button" onClick={() => setSelected(null)} className="rounded-lg bg-primary-600 px-4 py-2 text-white">Close</button>}>
      {selected && <div className="admin-table-scroll max-h-[60vh] space-y-3 overflow-y-auto text-sm">{Object.entries(selected.answers || {}).map(([key, value]) => <div key={key} className="border-b border-slate-100 pb-2"><p className="font-semibold capitalize text-slate-700">{key.replace(/([A-Z])/g, ' $1')}</p>{Array.isArray(value) ? <div className="mt-1 space-y-1">{value.map((row, index) => <p key={index} className="text-slate-600">{row.item}: ₹{row.estimated} estimated · ₹{row.actual} actual · {row.remarks}</p>)}</div> : <p className="whitespace-pre-wrap text-slate-600">{value || '—'}</p>}</div>)}</div>}
    </CommonPopup>
  </div>;
};

export default ProjectFormsPage;
