import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiChevronRight, FiEdit2, FiGitBranch, FiLayers, FiPlus, FiRefreshCw, FiSearch, FiTrash2 } from 'react-icons/fi';
import CommonPopup from '../../components/common/CommonPopup';
import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import apiService from '../../services/api';

const displayName = item => item.name || 'Untitled';

const WingsPage = () => {
  const [wings, setWings] = useState([]);
  const [subWings, setSubWings] = useState([]);
  const [selectedWingId, setSelectedWingId] = useState(null);
  const [wingSearch, setWingSearch] = useState('');
  const [subWingSearch, setSubWingSearch] = useState('');
  const [wingsLoading, setWingsLoading] = useState(true);
  const [subWingsLoading, setSubWingsLoading] = useState(false);
  const [wingError, setWingError] = useState('');
  const [subWingError, setSubWingError] = useState('');
  const [editor, setEditor] = useState(null);
  const [draft, setDraft] = useState({ name: '', description: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [language] = useSiteLanguage();
  const role = JSON.parse(localStorage.getItem('user') || '{}').role?.toLowerCase();
  const canManage = role === 'admin' || role === 'super_admin';
  const selectedWing = wings.find(wing => wing.id === selectedWingId);
  const visibleWings = wings.filter(wing => wing.name.toLocaleLowerCase().includes(wingSearch.trim().toLocaleLowerCase()));
  const visibleSubWings = subWings.filter(subWing => subWing.name.toLocaleLowerCase().includes(subWingSearch.trim().toLocaleLowerCase()));

  const reloadWings = async () => {
    setWingsLoading(true);
    setWingError('');
    try {
      const response = await apiService.getWings();
      const next = Array.isArray(response.data) ? response.data : [];
      setWings(next);
      setSelectedWingId(current => next.some(wing => wing.id === current) ? current : null);
    } catch (error) {
      setWingError(error.message || 'Could not load wings.');
    } finally {
      setWingsLoading(false);
    }
  };

  const reloadSubWings = async (wingId) => {
    if (!wingId) return;
    setSubWingsLoading(true);
    setSubWingError('');
    try {
      const response = await apiService.getSubWings(wingId);
      setSubWings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setSubWingError(error.message || 'Could not load departments.');
    } finally {
      setSubWingsLoading(false);
    }
  };

  useEffect(() => { void reloadWings(); }, []);
  useEffect(() => {
    if (!selectedWingId) {
      setSubWings([]);
      setSubWingError('');
      return;
    }
    let active = true;
    setSubWings([]);
    setSubWingsLoading(true);
    setSubWingError('');
    apiService.getSubWings(selectedWingId)
      .then(response => { if (active) setSubWings(Array.isArray(response.data) ? response.data : []); })
      .catch(error => { if (active) setSubWingError(error.message || 'Could not load departments.'); })
      .finally(() => { if (active) setSubWingsLoading(false); });
    return () => { active = false; };
  }, [selectedWingId]);

  const openEditor = (type, record = null) => {
    setDraft({ name: record?.name || '', description: record?.description || '' });
    setEditor({ type, record });
  };

  const save = async event => {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name) return;
    setBusy(true);
    try {
      const data = { name, description: draft.description.trim() };
      if (editor.type === 'wing') {
        const response = editor.record
          ? await apiService.updateWing(editor.record.id, data)
          : await apiService.createWing(data);
        await reloadWings();
        if (!editor.record) setSelectedWingId(response.data.id);
      } else {
        if (editor.record) await apiService.updateSubWing(editor.record.id, data);
        else await apiService.createSubWing(selectedWingId, data);
        await Promise.all([reloadSubWings(selectedWingId), reloadWings()]);
      }
      toast.success(editor.record ? 'Saved successfully' : 'Added successfully');
      setEditor(null);
    } catch (error) {
      toast.error(error.message || 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      if (deleteTarget.type === 'wing') {
        await apiService.deleteWing(deleteTarget.record.id);
        await reloadWings();
      } else {
        await apiService.deleteSubWing(deleteTarget.record.id);
        await Promise.all([reloadSubWings(selectedWingId), reloadWings()]);
      }
      toast.success('Deleted successfully');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error.message || 'Could not delete.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-50 px-3 pb-3 pt-[4.5rem] sm:px-5 md:overflow-hidden md:pt-20" aria-label="Wings and Departments">
      <div className="grid min-h-0 flex-none gap-3 md:flex-1 md:grid-cols-2">
        <div className="flex min-h-[18rem] flex-col overflow-hidden rounded-xl border border-slate-200 border-t-[3px] border-t-blue-600 bg-white shadow-sm md:min-h-0">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <h1 className="flex items-center gap-2 font-semibold text-slate-900"><FiLayers className="text-blue-600" />Wings <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{wings.length}</span></h1>
            {canManage && <button type="button" onClick={() => openEditor('wing')} className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"><FiPlus />Add Wing</button>}
          </div>
          <div className="border-b border-slate-100 p-3">
            <div className="relative"><FiSearch aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={wingSearch} onChange={event => setWingSearch(event.target.value)} aria-label="Search wings" placeholder="Search wings..." className="w-full rounded-full border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
          </div>
          <div className="admin-table-scroll min-h-0 flex-1 overflow-y-auto">
            {wingsLoading ? <p className="p-8 text-center text-sm text-slate-500">Loading wings...</p>
              : wingError ? <div className="p-8 text-center text-sm text-red-600">{wingError}<button type="button" onClick={reloadWings} className="mx-auto mt-3 flex items-center gap-1 text-primary-700"><FiRefreshCw />Retry</button></div>
                : wings.length === 0 ? <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-500"><FiLayers size={32} className="mb-3 text-blue-300" /><p>No wings yet.</p>{canManage && <p className="mt-1 text-xs">Add a wing to get started.</p>}</div>
                  : visibleWings.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No matching wings.</p>
                    : visibleWings.map(wing => <div key={wing.id} className={`group flex items-center gap-2 border-b border-slate-100 px-3 py-2.5 ${selectedWingId === wing.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                      <button type="button" onClick={() => { setSelectedWingId(wing.id); setSubWingSearch(''); }} aria-pressed={selectedWingId === wing.id} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{wing.name.charAt(0).toUpperCase()}</span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{wing.name}</span><span className="block text-xs text-slate-500">{wing.subWingCount || 0} {language === 'ta' ? 'துறைகள்' : 'departments'}</span></span>
                        <FiChevronRight className={`shrink-0 ${selectedWingId === wing.id ? 'text-blue-600' : 'text-slate-400'}`} />
                      </button>
                      {canManage && <div className="flex shrink-0 items-center gap-0.5"><button type="button" onClick={() => openEditor('wing', wing)} aria-label={`Edit ${wing.name}`} data-tooltip="Edit wing" className="rounded p-1.5 text-blue-700 hover:bg-blue-100"><FiEdit2 size={15} /></button><button type="button" onClick={() => setDeleteTarget({ type: 'wing', record: wing })} aria-label={`Delete ${wing.name}`} data-tooltip="Delete wing" className="rounded p-1.5 text-red-600 hover:bg-red-50"><FiTrash2 size={15} /></button></div>}
                    </div>)}
          </div>
        </div>

        <div className="flex min-h-[18rem] flex-col overflow-hidden rounded-xl border border-slate-200 border-t-[3px] border-t-blue-600 bg-white shadow-sm md:min-h-0">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <h2 className="flex min-w-0 items-center gap-2 font-semibold text-slate-900"><FiGitBranch className="shrink-0 text-blue-600" /><span className="truncate">Departments</span>{selectedWing && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{subWings.length}</span>}</h2>
            {canManage && selectedWing && <button type="button" onClick={() => openEditor('subWing')} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"><FiPlus />Add Department</button>}
          </div>
          {selectedWing && <div className="border-b border-slate-100 p-3"><p className="mb-2 truncate text-xs font-medium text-blue-700">{selectedWing.name}</p><div className="relative"><FiSearch aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={subWingSearch} onChange={event => setSubWingSearch(event.target.value)} aria-label="Search departments" placeholder="Search departments..." className="w-full rounded-full border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div></div>}
          <div className="admin-table-scroll min-h-0 flex-1 overflow-y-auto">
            {!selectedWing ? <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-500"><FiGitBranch size={38} className="mb-4 text-blue-300" /><p>Select a wing to see its departments.</p></div>
              : subWingsLoading ? <p className="p-8 text-center text-sm text-slate-500">Loading departments...</p>
                : subWingError ? <div className="p-8 text-center text-sm text-red-600">{subWingError}<button type="button" onClick={() => reloadSubWings(selectedWingId)} className="mx-auto mt-3 flex items-center gap-1 text-primary-700"><FiRefreshCw />Retry</button></div>
                  : subWings.length === 0 ? <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-500"><FiGitBranch size={32} className="mb-3 text-blue-300" /><p>No departments for this wing yet.</p></div>
                    : visibleSubWings.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No matching departments.</p>
                      : visibleSubWings.map(subWing => <div key={subWing.id} className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 hover:bg-slate-50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">{subWing.name.charAt(0).toUpperCase()}</span>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{subWing.name}</p>{subWing.description && <p className="truncate text-xs text-slate-500">{subWing.description}</p>}</div>
                        {canManage && <div className="flex shrink-0 items-center gap-0.5"><button type="button" onClick={() => openEditor('subWing', subWing)} aria-label={`Edit ${subWing.name}`} data-tooltip="Edit department" className="rounded p-1.5 text-blue-700 hover:bg-blue-100"><FiEdit2 size={15} /></button><button type="button" onClick={() => setDeleteTarget({ type: 'subWing', record: subWing })} aria-label={`Delete ${subWing.name}`} data-tooltip="Delete department" className="rounded p-1.5 text-red-600 hover:bg-red-50"><FiTrash2 size={15} /></button></div>}
                      </div>)}
          </div>
        </div>
      </div>

      <CommonPopup open={Boolean(editor)} title={editor?.type === 'wing' ? (editor.record ? 'Edit Wing' : 'Add Wing') : (editor?.record ? 'Edit Department' : 'Add Department')} onClose={() => setEditor(null)} busy={busy} size="sm" footer={<div className="flex justify-end gap-2"><button type="button" onClick={() => setEditor(null)} disabled={busy} className="rounded border px-4 py-2">Cancel</button><button type="submit" form="wing-editor" disabled={busy || !draft.name.trim()} className="rounded bg-primary-600 px-4 py-2 text-white disabled:opacity-50">{busy ? 'Saving...' : 'Save'}</button></div>}>
        <form id="wing-editor" onSubmit={save} className="space-y-4"><div><label htmlFor="wing-name" className="mb-1 block text-sm font-medium">Name *</label><input id="wing-name" autoFocus required maxLength={120} value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500" placeholder={editor?.type === 'wing' ? 'Wing name' : 'Department name'} /></div><div><label htmlFor="wing-description" className="mb-1 block text-sm font-medium">Description</label><textarea id="wing-description" maxLength={1000} rows={3} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500" placeholder="Optional description" /></div></form>
      </CommonPopup>

      <CommonPopup open={Boolean(deleteTarget)} title={deleteTarget?.type === 'wing' ? 'Delete Wing' : 'Delete Department'} onClose={() => setDeleteTarget(null)} busy={busy} size="sm" footer={<div className="flex justify-end gap-2"><button type="button" onClick={() => setDeleteTarget(null)} disabled={busy} className="rounded border px-4 py-2">Cancel</button><button type="button" onClick={remove} disabled={busy || (deleteTarget?.type === 'wing' && deleteTarget.record.subWingCount > 0)} className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50">{busy ? 'Deleting...' : 'Delete'}</button></div>}>
        <p>Delete <strong>{deleteTarget?.record && displayName(deleteTarget.record)}</strong>?</p>
        {deleteTarget?.type === 'wing' && deleteTarget.record.subWingCount > 0 && <p className="mt-2 text-red-600">Delete this wing's departments first.</p>}
      </CommonPopup>
    </section>
  );
};

export default WingsPage;
