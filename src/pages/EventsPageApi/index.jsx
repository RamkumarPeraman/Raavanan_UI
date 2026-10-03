import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-toastify';
import { FiBookmark, FiCalendar, FiCheckCircle, FiDownload, FiEye, FiFilter, FiSearch, FiShare2, FiUsers, FiX } from 'react-icons/fi';
import CommonLoader from '../../components/common/CommonLoader';
import CommonPopup from '../../components/common/CommonPopup';
import CommonSelect from '../../components/common/CommonSelect';
import Pagination from '../../components/common/Pagination';
import apiService from '../../services/api';

const typeColors = { Fundraiser: 'bg-purple-100 text-purple-800', 'Volunteer Training': 'bg-blue-100 text-blue-800', 'Community Event': 'bg-green-100 text-green-800', 'Awareness Campaign': 'bg-yellow-100 text-yellow-800', Workshop: 'bg-indigo-100 text-indigo-800', Conference: 'bg-red-100 text-red-800', 'Cultural Event': 'bg-pink-100 text-pink-800', Webinar: 'bg-teal-100 text-teal-800' };
const eventId = event => String(event?.id || event?._id || '');
const eventDay = value => {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Date(date.getFullYear(), date.getMonth(), date.getDate());
};
const isUpcoming = event => {
  const day = eventDay(event.date);
  return Boolean(day && day >= eventDay(new Date()));
};
const dateLabel = value => eventDay(value)?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) || '—';
const attendeeLabel = event => String(event.registered || 0) + (event.capacity ? ' / ' + event.capacity : '');
const isFull = event => Number(event.capacity) > 0 && Number(event.registered || 0) >= Number(event.capacity);
const escapeIcs = value => String(value || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

const EventsPageApi = () => {
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarkedEvents') || '[]');
      return Array.isArray(saved) ? saved.map(String) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [registeringId, setRegisteringId] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState(null);
  const [draftCategory, setDraftCategory] = useState('all');
  const [draftDate, setDraftDate] = useState(null);
  const [filterPosition, setFilterPosition] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const filterButtonRef = useRef(null);
  const filterPanelRef = useRef(null);
  const isAuthenticated = Boolean(localStorage.getItem('authToken'));

  const fetchEvents = useCallback(async () => {
    const [eventResult, registrationResult] = await Promise.allSettled([
      apiService.getEvents(),
      isAuthenticated ? apiService.getMyRegisteredEvents() : Promise.resolve([]),
    ]);
    if (eventResult.status === 'fulfilled') setEvents(eventResult.value);
    else { setLoadError(true); toast.error(eventResult.reason?.message || 'Failed to load events.'); }
    if (registrationResult.status === 'fulfilled') setRegisteredIds(registrationResult.value.map(eventId));
    setLoading(false);
  }, [isAuthenticated]);
  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);
  useEffect(() => {
    const sharedId = new URLSearchParams(window.location.search).get('event');
    if (sharedId) apiService.getEventById(sharedId).then(setSelectedEvent).catch(() => toast.error('This event could not be found.'));
  }, []);
  const retry = () => { setLoading(true); setLoadError(false); void fetchEvents(); };

  const categories = useMemo(() => [...new Set(events.map(event => event.type).filter(Boolean))].sort(), [events]);
  const upcomingCount = events.filter(isUpcoming).length;
  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    const dayKey = dateFilter?.toDateString();
    return events.filter(event => {
      if (category !== 'all' && event.type !== category) return false;
      if (dayKey && eventDay(event.date)?.toDateString() !== dayKey) return false;
      if (query && ![event.title, event.description, event.location, event.type].some(value => String(value || '').toLowerCase().includes(query))) return false;
      if (activeTab === 'upcoming') return isUpcoming(event);
      if (activeTab === 'past') return !isUpcoming(event);
      if (activeTab === 'registered') return registeredIds.includes(eventId(event));
      if (activeTab === 'gallery') return Boolean(event.image);
      return true;
    });
  }, [events, category, dateFilter, search, activeTab, registeredIds]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filteredEvents.length / pageSize)));
  const visibleEvents = filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const tabs = [
    { id: 'all', label: 'All Events', count: events.length },
    { id: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { id: 'past', label: 'Past', count: events.length - upcomingCount },
    { id: 'registered', label: 'My Registrations', count: registeredIds.length },
    { id: 'gallery', label: 'Gallery', count: events.filter(event => event.image).length },
  ];

  const openFilters = () => {
    if (filterPosition) { setFilterPosition(null); return; }
    setDraftCategory(category);
    setDraftDate(dateFilter);
    const rect = filterButtonRef.current.getBoundingClientRect();
    setFilterPosition({ top: Math.min(rect.bottom + 6, Math.max(8, window.innerHeight - 510)), left: Math.max(8, Math.min(rect.left, window.innerWidth - 336)) });
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

  const viewEvent = event => {
    setSelectedEvent(event);
    apiService.getEventById(eventId(event)).then(details => {
      setSelectedEvent(previous => eventId(previous) === eventId(event) ? details : previous);
    }).catch(() => toast.error('Could not load additional event details.'));
  };
  const toggleBookmark = id => {
    const next = bookmarkedIds.includes(id) ? bookmarkedIds.filter(value => value !== id) : [...bookmarkedIds, id];
    setBookmarkedIds(next);
    localStorage.setItem('bookmarkedEvents', JSON.stringify(next));
  };
  const register = async event => {
    const id = eventId(event);
    if (!isAuthenticated) { toast.info('Please log in to register for an event.'); return; }
    if (registeredIds.includes(id) || registeringId) return;
    setRegisteringId(id);
    try {
      const response = await apiService.registerForEvent(id);
      const count = response.data?.registered ?? Number(event.registered || 0) + 1;
      setRegisteredIds(previous => [...previous, id]);
      setEvents(previous => previous.map(item => eventId(item) === id ? { ...item, registered: count } : item));
      setSelectedEvent(previous => eventId(previous) === id ? { ...previous, registered: count } : previous);
      toast.success('Registered for ' + event.title + '.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setRegisteringId(null); }
  };
  const share = async event => {
    const url = new URL('/events', window.location.origin);
    url.searchParams.set('event', eventId(event));
    try {
      if (navigator.share) await navigator.share({ title: event.title, text: event.description, url: url.toString() });
      else { await navigator.clipboard.writeText(url.toString()); toast.success('Event link copied.'); }
    } catch (error) { if (error.name !== 'AbortError') toast.error('Could not share the event.'); }
  };
  const downloadCalendar = event => {
    const start = eventDay(event.date);
    if (!start) { toast.error('This event has no valid date.'); return; }
    const parts = [...String(event.time || '').matchAll(/(\d{1,2}):(\d{2})\s*(AM|PM)?/gi)];
    const setTime = (date, part, fallbackHour) => {
      let hour = part ? Number(part[1]) : fallbackHour;
      if (part?.[3]) hour = (hour % 12) + (part[3].toUpperCase() === 'PM' ? 12 : 0);
      date.setHours(hour, part ? Number(part[2]) : 0, 0, 0);
    };
    setTime(start, parts[0], 9);
    const end = new Date(start);
    if (parts[1]) setTime(end, parts[1], 11);
    else end.setHours(start.getHours() + 2);
    if (end <= start) end.setDate(end.getDate() + 1);
    const stamp = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Raavana Thalaigal Trust//Events//EN', 'BEGIN:VEVENT', 'UID:' + eventId(event) + '@raavanathalaigal.org', 'DTSTAMP:' + stamp(new Date()), 'DTSTART:' + stamp(start), 'DTEND:' + stamp(end), 'SUMMARY:' + escapeIcs(event.title), 'DESCRIPTION:' + escapeIcs(event.description), 'LOCATION:' + escapeIcs(event.location), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = (event.title || 'event') + '.ics';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const registrationAction = event => {
    const id = eventId(event);
    if (registeredIds.includes(id)) return <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700"><FiCheckCircle />Registered</span>;
    if (!isUpcoming(event)) return <span className="text-xs text-gray-500">Past event</span>;
    if (isFull(event)) return <span className="text-xs text-gray-500">Full</span>;
    return <button type="button" disabled={Boolean(registeringId)} onClick={() => register(event)} className="rounded bg-primary-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50">{registeringId === id ? 'Registering…' : 'Register'}</button>;
  };

  return (
    <div className="flex h-full min-w-0 flex-col gap-3 overflow-hidden bg-gray-50 px-[5px] pt-20">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div className="flex min-w-0 max-w-full gap-1 overflow-x-auto">
          {tabs.map(tab => <button key={tab.id} type="button" aria-pressed={activeTab === tab.id} onClick={() => { setActiveTab(tab.id); setPage(1); }} className={'inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-xs font-medium ' + (activeTab === tab.id ? 'border-primary-300 bg-primary-50 text-primary-800 ring-1 ring-primary-500' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100')}>{tab.label}<span>{tab.count}</span></button>)}
        </div>
        <div className="relative w-full sm:ml-auto sm:w-48"><FiSearch className="absolute left-2.5 top-2.5 text-gray-400" /><input aria-label="Search events" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search events…" className="h-[34px] w-full rounded-md border border-gray-200 bg-white pl-8 pr-2 text-xs focus:border-primary-500 focus:outline-none" /></div>
        <button ref={filterButtonRef} type="button" aria-expanded={Boolean(filterPosition)} aria-controls="event-filter-panel" onClick={openFilters} className={'inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-primary-50 ' + (category !== 'all' || dateFilter ? 'border-primary-400 bg-primary-50 text-primary-800' : 'border-gray-200 bg-white text-primary-700')}><FiFilter />Filters</button>
        <Link to="/contact" className="inline-flex h-8 items-center rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-100">Organize an event</Link>
      </div>

      {filterPosition && createPortal(
        <section ref={filterPanelRef} id="event-filter-panel" role="dialog" aria-label="Event filters" tabIndex={-1} style={filterPosition} className="fixed z-50 w-80 max-w-[calc(100vw-16px)] max-h-[calc(100dvh-16px)] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl outline-none">
          <div className="flex items-center justify-between px-4 pt-3 text-sm font-semibold text-slate-800">Filters<button type="button" aria-label="Close filters" onClick={() => setFilterPosition(null)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><FiX /></button></div>
          <div className="space-y-4 p-4">
            <div><label className="mb-1.5 block text-xs font-medium text-slate-500">Category</label><CommonSelect label="Category" value={draftCategory} onChange={setDraftCategory} options={[{ value: 'all', label: 'All Categories' }, ...categories.map(value => ({ value, label: value }))]} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-slate-500">Event date</label><Calendar value={draftDate} onChange={setDraftDate} tileClassName={({ date, view }) => view === 'month' && events.some(event => eventDay(event.date)?.toDateString() === date.toDateString()) ? 'event-day' : null} className="event-filter-calendar" />{draftDate && <button type="button" onClick={() => setDraftDate(null)} className="mt-2 text-xs text-primary-700 underline">Clear date</button>}</div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3"><button type="button" onClick={() => { setDraftCategory('all'); setDraftDate(null); }} className="text-xs text-slate-500 hover:text-slate-900">Clear</button><button type="button" onClick={() => { setCategory(draftCategory); setDateFilter(draftDate); setPage(1); setFilterPosition(null); filterButtonRef.current?.focus(); }} className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700">Apply</button></div>
        </section>, document.body
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-md border border-gray-200 bg-white">
        {loading ? <div className="flex min-h-0 flex-1 items-center justify-center"><CommonLoader size="lg" label="Loading events…" showLabel /></div>
          : loadError ? <div className="flex min-h-0 flex-1 items-center justify-center gap-2 text-sm text-gray-600">Could not load events. <button type="button" onClick={retry} className="text-primary-700 underline">Retry</button></div>
            : filteredEvents.length === 0 ? <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-gray-500">{activeTab === 'registered' && !isAuthenticated ? 'Log in to see your event registrations.' : 'No events match this view.'}</div>
              : activeTab === 'gallery' ? <div className="admin-table-scroll grid min-h-0 flex-1 auto-rows-max grid-cols-2 gap-3 overflow-y-auto bg-slate-50 p-3 sm:grid-cols-3 lg:grid-cols-5">{visibleEvents.map(event => <button key={eventId(event)} type="button" onClick={() => viewEvent(event)} className="overflow-hidden rounded-lg border bg-white text-left hover:border-primary-300 hover:shadow"><div className="aspect-square bg-gray-100"><img src={event.image} alt="" className="h-full w-full object-cover" /></div><div className="truncate p-2 text-xs font-medium text-gray-800">{event.title}</div></button>)}</div>
                : <>
                  <div className="admin-table-scroll hidden min-h-0 flex-1 overflow-auto overscroll-contain lg:block">
                    <table className="w-full table-fixed text-sm"><colgroup><col className="w-[27%]" /><col className="w-[13%]" /><col className="w-[16%]" /><col className="w-[14%]" /><col className="w-[11%]" /><col className="w-[19%]" /></colgroup>
                      <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50"><tr>{['Event', 'Type', 'Date & Time', 'Location', 'Attendees', 'Actions'].map(label => <th key={label} className={'px-3 py-3 text-left text-xs font-medium uppercase text-gray-500 ' + (label === 'Actions' ? 'text-right' : '')}>{label}</th>)}</tr></thead>
                      <tbody className="divide-y divide-gray-100">{visibleEvents.map(event => <tr key={eventId(event)} className="hover:bg-slate-50">
                        <td className="px-3 py-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-primary-50 text-primary-600">{event.image ? <img src={event.image} alt="" className="h-full w-full object-cover" /> : <FiCalendar />}</div><div className="min-w-0"><div className="truncate font-medium text-gray-900" title={event.title}>{event.title}</div><div className="truncate text-xs text-gray-500" title={event.description || ''}>{event.description || '—'}</div></div></div></td>
                        <td className="truncate px-3 py-3"><span className={'rounded-full px-2 py-1 text-xs ' + (typeColors[event.type] || 'bg-gray-100 text-gray-700')}>{event.type || '—'}</span></td>
                        <td className="px-3 py-3 text-gray-600"><div>{dateLabel(event.date)}</div><div className="truncate text-xs text-gray-500" title={event.time || ''}>{event.time || '—'}</div></td>
                        <td className="truncate px-3 py-3 text-gray-600" title={event.location || ''}>{event.location || '—'}</td>
                        <td className="px-3 py-3 text-gray-600">{attendeeLabel(event)}</td>
                        <td className="px-3 py-3"><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => viewEvent(event)} aria-label={'View ' + event.title} className="inline-flex items-center gap-1 rounded px-2 py-1.5 text-primary-700 hover:bg-primary-50"><FiEye />View</button>{registrationAction(event)}</div></td>
                      </tr>)}</tbody>
                    </table>
                  </div>
                  <div className="admin-table-scroll min-h-0 flex-1 space-y-2 overflow-y-auto bg-slate-50 p-2 lg:hidden">{visibleEvents.map(event => <article key={eventId(event)} className="rounded-lg border bg-white p-3 text-sm"><div className="flex gap-3"><div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-primary-50 text-primary-600">{event.image ? <img src={event.image} alt="" className="h-full w-full object-cover" /> : <FiCalendar />}</div><div className="min-w-0 flex-1"><h2 className="truncate font-semibold text-gray-900">{event.title}</h2><p className="mt-1 truncate text-xs text-gray-500">{event.type || 'Event'} · {event.location || 'Location unavailable'}</p><p className="mt-1 text-xs text-gray-500">{dateLabel(event.date)} · {event.time || 'Time TBA'}</p></div></div><p className="mt-2 line-clamp-2 text-gray-600">{event.description}</p><div className="mt-2 flex items-center justify-between gap-2 border-t pt-2"><span className="text-xs text-gray-500"><FiUsers className="mr-1 inline" />{attendeeLabel(event)}</span><div className="flex items-center gap-2"><button type="button" onClick={() => viewEvent(event)} className="inline-flex items-center gap-1 text-primary-700"><FiEye />View</button>{registrationAction(event)}</div></div></article>)}</div>
                </>}
        <Pagination page={currentPage} pageSize={pageSize} total={filteredEvents.length} onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }} disabled={loading} itemLabel="Events" />
      </div>

      <CommonPopup open={Boolean(selectedEvent)} title={<div className="flex flex-wrap items-center gap-2"><span>{selectedEvent?.title || 'Event details'}</span>{selectedEvent?.type && <span className={'rounded-full px-2.5 py-1 text-xs font-medium ' + (typeColors[selectedEvent.type] || 'bg-gray-100 text-gray-700')}>{selectedEvent.type}</span>}</div>} onClose={() => setSelectedEvent(null)} size="lg" footer={selectedEvent && <div className="flex flex-wrap items-center justify-end gap-2"><button type="button" onClick={() => toggleBookmark(eventId(selectedEvent))} aria-label={bookmarkedIds.includes(eventId(selectedEvent)) ? 'Remove bookmark' : 'Bookmark event'} className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1.5 text-gray-700"><FiBookmark className={bookmarkedIds.includes(eventId(selectedEvent)) ? 'fill-primary-600 text-primary-600' : ''} />Bookmark</button><button type="button" onClick={() => share(selectedEvent)} className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1.5 text-gray-700"><FiShare2 />Share</button><button type="button" onClick={() => downloadCalendar(selectedEvent)} className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1.5 text-gray-700"><FiDownload />Calendar</button>{registrationAction(selectedEvent)}<button type="button" onClick={() => setSelectedEvent(null)} className="rounded border border-gray-300 px-3 py-1.5 text-gray-700">Close</button></div>}>
        {selectedEvent && <div className="space-y-5">
          <div className={selectedEvent.image ? 'grid gap-4 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]' : ''}>
            {selectedEvent.image && <div className="flex h-48 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-2"><img src={selectedEvent.image} alt={selectedEvent.title} className="h-full w-full object-contain" /></div>}
            <div className="min-w-0"><h3 className="mb-1 font-semibold text-gray-900">About the event</h3><p className="whitespace-pre-wrap text-gray-700">{selectedEvent.description || 'No description available.'}</p></div>
          </div>
          <div className="grid gap-3 rounded-lg bg-gray-50 p-4 text-sm sm:grid-cols-2"><div><span className="text-gray-500">Date</span><p className="font-medium">{dateLabel(selectedEvent.date)}</p></div><div><span className="text-gray-500">Time</span><p className="font-medium">{selectedEvent.time || '—'}</p></div><div><span className="text-gray-500">Location</span><p className="font-medium">{selectedEvent.location || '—'}</p></div><div><span className="text-gray-500">Attendees</span><p className="font-medium">{attendeeLabel(selectedEvent)}</p></div><div><span className="text-gray-500">Entry</span><p className="font-medium">{Number(selectedEvent.price) > 0 ? '₹' + Number(selectedEvent.price).toLocaleString('en-IN') : 'Free'}</p></div><div><span className="text-gray-500">Availability</span><p className="font-medium">{isFull(selectedEvent) ? 'Full' : selectedEvent.capacity ? Math.max(Number(selectedEvent.capacity) - Number(selectedEvent.registered || 0), 0) + ' spots remaining' : 'Open registration'}</p></div></div>
          {Array.isArray(selectedEvent.speakers) && selectedEvent.speakers.length > 0 && <div><h3 className="mb-2 font-semibold text-gray-900">Speakers</h3><div className="flex flex-wrap gap-2">{selectedEvent.speakers.map((speaker, index) => <span key={index} className="rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-800">{speaker}</span>)}</div></div>}
        </div>}
      </CommonPopup>
      <style>{'.event-filter-calendar.react-calendar { width: 100%; border: 0; font-family: inherit; } .event-filter-calendar .react-calendar__tile--active { background: #1b736f !important; color: white; } .event-filter-calendar .event-day { background-color: #e4f5f2; font-weight: 600; }'}</style>
    </div>
  );
};

export default EventsPageApi;
