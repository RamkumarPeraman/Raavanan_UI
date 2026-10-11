import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-toastify';
import { FiArrowRight, FiBookmark, FiCalendar, FiCheckCircle, FiClock, FiDownload, FiFilter, FiMapPin, FiSearch, FiShare2, FiUsers, FiX } from 'react-icons/fi';
import CommonLoader from '../../components/common/CommonLoader';
import CommonPopup from '../../components/common/CommonPopup';
import CommonSelect from '../../components/common/CommonSelect';
import FoundationFooter from '../../components/common/FoundationFooter';
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

const EventCover = ({ event, className = '', showDate = false }) => {
  const [imageFailed, setImageFailed] = useState(false);
  return <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#dcece7] via-[#f2f4e9] to-[#fff0db] text-primary-800 ${className}`}>
    {event.image && !imageFailed ? <img src={event.image} alt="" onError={() => setImageFailed(true)} className="h-full w-full object-cover" /> : <FiCalendar aria-hidden="true" className="h-10 w-10" />}
    {showDate && <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-3 py-1.5 text-xs font-bold text-primary-900 shadow-sm">{eventDay(event.date) ? dateLabel(event.date) : 'Date TBA'}</span>}
  </div>;
};

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
  const [activeTab, setActiveTab] = useState('all');
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
    <div className="admin-table-scroll h-full min-w-0 overflow-y-auto bg-[#faf8f3] pt-3 text-ink-950">
      <div className="container-custom pb-16">
        <div className="flex min-w-0 flex-col gap-4 border-b border-[#e4ddd2] pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-1" role="group" aria-label="Event views">
            {tabs.map(tab => <button key={tab.id} type="button" aria-pressed={activeTab === tab.id} onClick={() => { setActiveTab(tab.id); setPage(1); }} className={'inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-3 text-sm font-semibold transition ' + (activeTab === tab.id ? 'border-primary-700 bg-primary-800 text-white' : 'border-[#e4ddd2] bg-white text-ink-700 hover:border-primary-400 hover:text-primary-800')}>{tab.label}<span className={'text-xs ' + (activeTab === tab.id ? 'text-white/80' : 'text-ink-500')}>{tab.count}</span></button>)}
          </div>
          <div className="flex min-w-0 flex-col gap-3 md:flex-row xl:w-[min(45vw,760px)] xl:shrink-0">
            <label className="relative min-w-0 flex-1"><span className="sr-only">Search events</span><FiSearch aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" /><input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search events by name or place" className="h-11 w-full rounded-md border border-[#ded8cd] bg-white pl-11 pr-4 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-500/15" /></label>
            <button ref={filterButtonRef} type="button" aria-expanded={Boolean(filterPosition)} aria-controls="event-filter-panel" onClick={openFilters} className={'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border px-5 text-sm font-semibold transition hover:border-primary-600 ' + (category !== 'all' || dateFilter ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-[#ded8cd] bg-white text-ink-700')}><FiFilter aria-hidden="true" /> Filters</button>
            <Link to="/contact" className="inline-flex h-11 shrink-0 items-center justify-center rounded-md border border-primary-700 px-4 text-sm font-semibold text-primary-800 transition hover:bg-primary-50">Organize an event</Link>
          </div>
        </div>

        {filterPosition && createPortal(
          <section ref={filterPanelRef} id="event-filter-panel" role="dialog" aria-label="Event filters" tabIndex={-1} style={filterPosition} className="fixed z-50 w-80 max-w-[calc(100vw-16px)] max-h-[calc(100dvh-16px)] overflow-y-auto rounded-md border border-[#ded8cd] bg-white shadow-xl outline-none">
            <div className="flex items-center justify-between border-b border-[#eee9e0] px-4 py-3 text-sm font-semibold">Filters<button type="button" aria-label="Close filters" onClick={() => setFilterPosition(null)} className="rounded p-1 text-ink-500 hover:bg-primary-50"><FiX /></button></div>
            <div className="space-y-4 p-4">
              <div><label className="mb-1.5 block text-xs font-medium text-ink-500">Category</label><CommonSelect label="Category" value={draftCategory} onChange={setDraftCategory} options={[{ value: 'all', label: 'All Categories' }, ...categories.map(value => ({ value, label: value }))]} /></div>
              <div><label className="mb-1.5 block text-xs font-medium text-ink-500">Event date</label><Calendar value={draftDate} onChange={setDraftDate} tileClassName={({ date, view }) => view === 'month' && events.some(event => eventDay(event.date)?.toDateString() === date.toDateString()) ? 'event-day' : null} className="event-filter-calendar" />{draftDate && <button type="button" onClick={() => setDraftDate(null)} className="mt-2 text-xs text-primary-700 underline">Clear date</button>}</div>
            </div>
            <div className="flex items-center justify-between border-t border-[#eee9e0] px-4 py-3"><button type="button" onClick={() => { setDraftCategory('all'); setDraftDate(null); }} className="text-sm text-ink-500 hover:text-ink-900">Clear</button><button type="button" onClick={() => { setCategory(draftCategory); setDateFilter(draftDate); setPage(1); setFilterPosition(null); filterButtonRef.current?.focus(); }} className="rounded-md bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">Apply</button></div>
          </section>, document.body
        )}

        <div className="mt-7">
          {loading ? <div className="flex min-h-64 items-center justify-center"><CommonLoader size="lg" label="Loading events…" showLabel /></div>
            : loadError ? <div className="rounded-md border border-[#e4ddd2] bg-white px-6 py-16 text-center"><h2 className="text-xl font-bold">Events could not load right now</h2><p className="mt-2 text-sm text-ink-600">Please try again in a moment.</p><button type="button" onClick={retry} className="mt-5 rounded-md bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white">Try again</button></div>
              : filteredEvents.length === 0 ? <div className="rounded-md border border-[#e4ddd2] bg-white px-6 py-14 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-primary-50 text-primary-800"><FiCalendar size={25} aria-hidden="true" /></div><h2 className="mt-4 text-xl font-bold">{activeTab === 'upcoming' ? 'No upcoming events right now' : activeTab === 'registered' ? 'No registrations yet' : 'No events found'}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-600">{activeTab === 'registered' && !isAuthenticated ? 'Log in to see the events you have registered for.' : activeTab === 'upcoming' ? 'Browse past events or check back for new opportunities.' : 'Try another search, view, or filter.'}</p>{activeTab !== 'all' && <button type="button" onClick={() => { setActiveTab('all'); setPage(1); }} className="mt-5 rounded-md bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Browse all events</button>}{activeTab === 'all' && (search.trim() || category !== 'all' || dateFilter) && <button type="button" onClick={() => { setSearch(''); setCategory('all'); setDateFilter(null); setPage(1); }} className="mt-5 rounded-md bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Clear filters</button>}</div>
                : activeTab === 'gallery' ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleEvents.map(event => <button key={eventId(event)} type="button" onClick={() => viewEvent(event)} className="overflow-hidden rounded-md border border-[#e4ddd2] bg-white text-left transition hover:border-primary-400 hover:shadow-md"><EventCover event={event} className="aspect-[4/3] w-full" /><div className="p-4 text-base font-semibold text-ink-900">{event.title}</div></button>)}</div>
                  : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{visibleEvents.map(event => <article key={eventId(event)} className="flex min-w-0 flex-col overflow-hidden rounded-md border border-[#e4ddd2] bg-white shadow-[0_14px_36px_-32px_rgba(9,42,43,0.45)] transition hover:border-primary-300 hover:shadow-md">
                    <button type="button" onClick={() => viewEvent(event)} aria-label={'View ' + event.title} className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600">
                      <EventCover event={event} className="h-40 w-full" showDate />
                      <div className="p-5"><div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-700"><span>{event.type || 'Event'}</span><span className="h-1 w-1 rounded-full bg-stone-400" aria-hidden="true" /><span className="text-ink-500">{isUpcoming(event) ? 'Upcoming' : 'Past'}</span></div><h2 className="mt-3 break-words text-xl font-bold leading-snug text-ink-950 [overflow-wrap:anywhere]">{event.title || 'Community event'}</h2><p className="mt-2 line-clamp-2 min-h-12 break-words text-sm leading-6 text-ink-600 [overflow-wrap:anywhere]">{event.description || 'Learn more about this event and how to take part.'}</p><div className="mt-4 space-y-2 text-sm text-ink-600">{event.time && <div className="flex items-start gap-2"><FiClock aria-hidden="true" className="mt-0.5 shrink-0" /><span>{event.time}</span></div>}{event.location && <div className="flex items-start gap-2"><FiMapPin aria-hidden="true" className="mt-0.5 shrink-0" /><span className="break-words [overflow-wrap:anywhere]">{event.location}</span></div>}<div className="flex items-center gap-2"><FiUsers aria-hidden="true" /><span>{attendeeLabel(event)} attendees</span></div></div></div>
                    </button>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[#eee9e0] px-5 py-3"><button type="button" onClick={() => viewEvent(event)} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-800 hover:text-primary-600">View details <FiArrowRight aria-hidden="true" /></button>{registrationAction(event)}</div>
                  </article>)}</div>}
          {!loading && !loadError && filteredEvents.length > pageSize && <div className="mt-8 overflow-hidden rounded-md border border-[#e4ddd2] bg-white"><Pagination page={currentPage} pageSize={pageSize} total={filteredEvents.length} onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }} itemLabel="Events" /></div>}
        </div>
      </div>
      <FoundationFooter />
      <CommonPopup open={Boolean(selectedEvent)} title={<div className="flex flex-wrap items-center gap-2"><span>{selectedEvent?.title || 'Event details'}</span>{selectedEvent?.type && <span className={'rounded-full px-2.5 py-1 text-xs font-medium ' + (typeColors[selectedEvent.type] || 'bg-gray-100 text-gray-700')}>{selectedEvent.type}</span>}</div>} onClose={() => setSelectedEvent(null)} size="lg" footer={selectedEvent && <div className="flex flex-wrap items-center justify-end gap-2"><button type="button" onClick={() => toggleBookmark(eventId(selectedEvent))} aria-label={bookmarkedIds.includes(eventId(selectedEvent)) ? 'Remove bookmark' : 'Bookmark event'} className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1.5 text-gray-700"><FiBookmark className={bookmarkedIds.includes(eventId(selectedEvent)) ? 'fill-primary-600 text-primary-600' : ''} />Bookmark</button><button type="button" onClick={() => share(selectedEvent)} className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1.5 text-gray-700"><FiShare2 />Share</button><button type="button" onClick={() => downloadCalendar(selectedEvent)} className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1.5 text-gray-700"><FiDownload />Calendar</button>{registrationAction(selectedEvent)}<button type="button" onClick={() => setSelectedEvent(null)} className="rounded border border-gray-300 px-3 py-1.5 text-gray-700">Close</button></div>}>
        {selectedEvent && <div className="space-y-5">
          <div className={selectedEvent.image ? 'grid gap-4 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]' : ''}>
            {selectedEvent.image && <EventCover key={eventId(selectedEvent)} event={selectedEvent} className="h-48 rounded-md border border-[#e4ddd2]" />}
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
