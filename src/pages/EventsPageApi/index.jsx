import CommonLoader from '../../components/common/CommonLoader';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiAward, FiBookmark, FiCalendar, FiCamera, FiCheckCircle, FiChevronLeft, FiChevronRight, FiClock, FiDownload, FiHeart, FiMapPin, FiSearch, FiShare2, FiUsers } from 'react-icons/fi';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-toastify';
import apiService from '../../services/api';

const categories = ['All', 'Fundraiser', 'Volunteer Training', 'Community Event', 'Awareness Campaign', 'Workshop', 'Conference', 'Cultural Event', 'Webinar'];
const eventTypeColors = { Fundraiser: 'bg-purple-100 text-purple-800', 'Volunteer Training': 'bg-blue-100 text-blue-800', 'Community Event': 'bg-green-100 text-green-800', 'Awareness Campaign': 'bg-yellow-100 text-yellow-800', Workshop: 'bg-indigo-100 text-indigo-800', Conference: 'bg-red-100 text-red-800', 'Cultural Event': 'bg-pink-100 text-pink-800', Webinar: 'bg-teal-100 text-teal-800' };

const EventsPageApi = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarFilterActive, setCalendarFilterActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const isAuthenticated = Boolean(localStorage.getItem('authToken'));
  const eventsPerPage = 6;

  const loadEventPageData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventData, registrationData] = await Promise.all([
        apiService.getEvents(),
        isAuthenticated ? apiService.getMyRegisteredEvents().catch(() => []) : Promise.resolve([]),
      ]);
      setEvents(eventData);
      setRegisteredEvents(registrationData.map((event) => event.id));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const bookmarked = localStorage.getItem('bookmarkedEvents');
    if (bookmarked) setBookmarkedEvents(JSON.parse(bookmarked));
    loadEventPageData();
  }, [isAuthenticated]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedCategory, searchTerm, selectedDate, calendarFilterActive]);

  const filteredEvents = useMemo(() => {
    let filtered = [...events];
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter((event) => event.title?.toLowerCase().includes(query) || event.description?.toLowerCase().includes(query) || event.location?.toLowerCase().includes(query));
    }
    if (selectedCategory !== 'all') filtered = filtered.filter((event) => event.type === selectedCategory);
    if (calendarFilterActive) filtered = filtered.filter((event) => new Date(event.date).toDateString() === selectedDate.toDateString());
    const now = new Date();
    if (activeTab === 'upcoming') filtered = filtered.filter((event) => new Date(event.date) >= now);
    if (activeTab === 'past') filtered = filtered.filter((event) => new Date(event.date) < now);
    if (activeTab === 'registered') filtered = filtered.filter((event) => registeredEvents.includes(event.id));
    return filtered;
  }, [activeTab, calendarFilterActive, events, registeredEvents, searchTerm, selectedCategory, selectedDate]);

  const galleryEvents = useMemo(() => events.filter((event) => Boolean(event.image)), [events]);
  const totalAttendees = useMemo(() => events.reduce((sum, event) => sum + (event.registered || 0), 0), [events]);
  const workshopCount = useMemo(() => events.filter((event) => ['Workshop', 'Volunteer Training', 'Conference', 'Webinar'].includes(event.type)).length, [events]);
  const upcomingThisMonth = useMemo(() => {
    const now = new Date();
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    }).slice(0, 3);
  }, [events]);

  const handleEventRegister = async (event) => {
    if (!isAuthenticated) {
      toast.error('Please login to register for an event.');
      return;
    }
    if (registeredEvents.includes(event.id)) {
      toast.info('You are already registered for this event.');
      return;
    }
    try {
      const response = await apiService.registerForEvent(event.id);
      const count = response.data?.registered ?? (event.registered || 0) + 1;
      setRegisteredEvents((prev) => [...prev, event.id]);
      setEvents((prev) => prev.map((item) => (item.id === event.id ? { ...item, registered: count } : item)));
      setSelectedEvent((prev) => (prev?.id === event.id ? { ...prev, registered: count } : prev));
      toast.success(`Successfully registered for ${event.title}!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleBookmark = (eventId) => {
    const updated = bookmarkedEvents.includes(eventId) ? bookmarkedEvents.filter((id) => id !== eventId) : [...bookmarkedEvents, eventId];
    setBookmarkedEvents(updated);
    localStorage.setItem('bookmarkedEvents', JSON.stringify(updated));
    toast[bookmarkedEvents.includes(eventId) ? 'info' : 'success'](bookmarkedEvents.includes(eventId) ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleShare = async (event) => {
    const url = `${window.location.origin}/events/${event.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, text: event.description, url }); } catch (error) { console.log('Share cancelled'); }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Event link copied to clipboard!');
    }
  };

  const downloadICS = (event) => {
    const [startTime = '09:00', endTime = '17:00'] = String(event.time || '').split(' - ');
    const datePart = new Date(event.date).toISOString().split('T')[0];
    const startDate = new Date(`${datePart}T${startTime}`);
    const endDate = new Date(`${datePart}T${endTime}`);
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Raavana Thalaigal Trust//Events//EN
BEGIN:VEVENT
UID:${event.id}@raavanathalaigal.org
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${event.title}.ics`;
    anchor.click();
    window.URL.revokeObjectURL(url);
    toast.success('Calendar file downloaded!');
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentEvents = filteredEvents.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  if (loading) return (
    <div className="flex min-h-[60dvh] items-center justify-center bg-gray-50 pt-20">
      <CommonLoader size="lg" label="Loading events…" showLabel />
    </div>
  );

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Events & Updates</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Join us in our mission through various events, workshops, and community gatherings. Register for upcoming events or explore our past activities.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[{ icon: FiCalendar, value: events.length, label: 'Total Events' }, { icon: FiClock, value: events.filter((event) => new Date(event.date) >= new Date()).length, label: 'Upcoming' }, { icon: FiUsers, value: totalAttendees, label: 'Attendees' }, { icon: FiAward, value: workshopCount, label: 'Workshops' }].map((stat, index) => <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center"><stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" /><div className="text-2xl font-bold text-gray-900">{stat.value}</div><div className="text-sm text-gray-600">{stat.label}</div></div>)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
              {['upcoming', 'past', 'registered', 'gallery'].map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>{tab === 'upcoming' ? 'Upcoming Events' : tab === 'past' ? 'Past Events' : tab === 'registered' ? 'My Registrations' : 'Event Gallery'}</button>)}
            </div>
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none" />
                </div>
                <div className="md:w-48">
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none">
                    {categories.map((category) => <option key={category} value={category === 'All' ? 'all' : category}>{category}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {activeTab !== 'gallery' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentEvents.map((event) => (
                    <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      {event.image && <div className="h-40 bg-gray-300 relative"><img src={event.image} alt={event.title} className="w-full h-full object-cover" /><div className="absolute top-4 right-4"><button onClick={() => handleBookmark(event.id)} className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"><FiBookmark className={bookmarkedEvents.includes(event.id) ? 'fill-primary-600 text-primary-600' : 'text-gray-600'} size={16} /></button></div></div>}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${eventTypeColors[event.type] || 'bg-gray-100 text-gray-800'}`}>{event.type}</span>
                          <span className="text-xs text-gray-500 flex items-center"><FiUsers className="mr-1" size={12} />{event.registered || 0}{event.capacity ? `/${event.capacity}` : ''} registered</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600"><FiCalendar className="mr-2 text-primary-600" size={14} />{formatDate(event.date)}</div>
                          <div className="flex items-center text-sm text-gray-600"><FiClock className="mr-2 text-primary-600" size={14} />{event.time}</div>
                          <div className="flex items-center text-sm text-gray-600"><FiMapPin className="mr-2 text-primary-600" size={14} />{event.location}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedEvent(event); setShowEventModal(true); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">Details</button>
                          {new Date(event.date) >= new Date() && (registeredEvents.includes(event.id) ? <button disabled className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center"><FiCheckCircle className="mr-1" />Registered</button> : <button onClick={() => handleEventRegister(event)} className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">Register</button>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredEvents.length === 0 && <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500 mt-6">No events found for the current filters.</div>}
                {totalPages > 1 && <div className="flex justify-center mt-8"><nav className="flex items-center space-x-2"><button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"><FiChevronLeft /></button>{[...Array(totalPages)].map((_, index) => <button key={index} onClick={() => setCurrentPage(index + 1)} className={`px-4 py-2 rounded-lg ${currentPage === index + 1 ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{index + 1}</button>)}<button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"><FiChevronRight /></button></nav></div>}
              </>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryEvents.length > 0 ? galleryEvents.map((event) => <div key={event.id} className="relative group cursor-pointer" onClick={() => { setSelectedEvent(event); setShowEventModal(true); }}><div className="aspect-square bg-gray-300 rounded-lg overflow-hidden"><img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /></div><div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"><div className="text-center text-white px-4"><FiCamera className="mx-auto mb-2" size={30} /><p className="text-sm font-semibold">{event.title}</p></div></div></div>) : <div className="col-span-full bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500">No event images available yet.</div>}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Event Calendar</h3>
              <Calendar onChange={(date) => { setSelectedDate(date); setCalendarFilterActive(true); }} value={selectedDate} tileClassName={({ date, view }) => view === 'month' && events.some((event) => new Date(event.date).toDateString() === date.toDateString()) ? 'event-day' : null} className="w-full border-none" />
              <p className="text-sm text-gray-600 mt-4 text-center">{calendarFilterActive ? `Events on ${selectedDate.toLocaleDateString()}: ${filteredEvents.length}` : `Showing all matching events: ${filteredEvents.length}`}</p>
              {calendarFilterActive && <button onClick={() => setCalendarFilterActive(false)} className="mt-3 w-full text-sm text-primary-600 font-semibold hover:text-primary-700">Clear date filter</button>}
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming This Month</h3>
              <div className="space-y-4">
                {upcomingThisMonth.length > 0 ? upcomingThisMonth.map((event) => <div key={event.id} className="flex items-start space-x-3 pb-4 border-b last:border-0"><div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex flex-col items-center justify-center"><span className="text-xs text-primary-600 font-semibold">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span><span className="text-lg font-bold text-primary-600">{new Date(event.date).getDate()}</span></div><div className="flex-1"><h4 className="font-semibold text-sm">{event.title}</h4><p className="text-xs text-gray-500 flex items-center mt-1"><FiMapPin className="mr-1" size={10} />{event.location}</p></div></div>) : <p className="text-sm text-gray-500">No upcoming events this month.</p>}
              </div>
              <button onClick={() => setActiveTab('upcoming')} className="w-full mt-4 text-primary-600 font-semibold text-sm hover:text-primary-700">View All Events →</button>
            </div>
            <div className="bg-primary-50 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary-800">Organize an Event</h3>
              <p className="text-primary-700 text-sm mb-4">Want to collaborate or organize an event with us? We&apos;d love to hear your ideas!</p>
              <Link to="/contact" className="block w-full bg-primary-600 text-white text-center px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold">Contact Us</Link>
            </div>
          </div>
        </div>

        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {selectedEvent.image && <div className="h-64 md:h-80 bg-gray-300 relative"><img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" /><div className="absolute top-4 right-4 flex space-x-2"><button onClick={() => handleBookmark(selectedEvent.id)} className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"><FiBookmark className={bookmarkedEvents.includes(selectedEvent.id) ? 'fill-primary-600 text-primary-600' : 'text-gray-600'} size={20} /></button><button onClick={() => handleShare(selectedEvent)} className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"><FiShare2 size={20} /></button><button onClick={() => downloadICS(selectedEvent)} className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"><FiDownload size={20} /></button></div></div>}
              <div className="p-8">
                <div className="flex items-center justify-between mb-6"><span className={`px-3 py-1 rounded-full text-sm font-semibold ${eventTypeColors[selectedEvent.type] || 'bg-gray-100 text-gray-800'}`}>{selectedEvent.type}</span><span className="text-sm text-gray-500 flex items-center"><FiUsers className="mr-1" />{selectedEvent.registered || 0}{selectedEvent.capacity ? `/${selectedEvent.capacity}` : ''} registered</span></div>
                <h2 className="text-3xl font-bold mb-4">{selectedEvent.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4"><div className="flex items-start"><FiCalendar className="text-primary-600 mr-3 mt-1 flex-shrink-0" size={20} /><div><p className="font-semibold">Date</p><p className="text-gray-600">{formatDate(selectedEvent.date)}</p></div></div><div className="flex items-start"><FiClock className="text-primary-600 mr-3 mt-1 flex-shrink-0" size={20} /><div><p className="font-semibold">Time</p><p className="text-gray-600">{selectedEvent.time}</p></div></div></div>
                  <div className="space-y-4"><div className="flex items-start"><FiMapPin className="text-primary-600 mr-3 mt-1 flex-shrink-0" size={20} /><div><p className="font-semibold">Location</p><p className="text-gray-600">{selectedEvent.location}</p></div></div>{selectedEvent.price > 0 ? <div className="flex items-start"><FiAward className="text-primary-600 mr-3 mt-1 flex-shrink-0" size={20} /><div><p className="font-semibold">Entry Fee</p><p className="text-gray-600">₹{selectedEvent.price}</p></div></div> : <div className="flex items-start"><FiHeart className="text-primary-600 mr-3 mt-1 flex-shrink-0" size={20} /><div><p className="font-semibold">Entry</p><p className="text-gray-600">Free Event</p></div></div>}</div>
                </div>
                <div className="mb-8"><h3 className="text-lg font-semibold mb-3">About the Event</h3><p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p></div>
                {selectedEvent.speakers?.length > 0 && <div className="mb-8"><h3 className="text-lg font-semibold mb-4">Speakers</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{selectedEvent.speakers.map((speaker, index) => <div key={index} className="flex items-center space-x-3"><div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center"><span className="text-primary-600 font-bold text-lg">{speaker.charAt(0)}</span></div><div><p className="font-semibold">{speaker}</p><p className="text-sm text-gray-500">Guest Speaker</p></div></div>)}</div></div>}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div className="flex items-center"><FiAlertCircle className="text-primary-600 mr-2" size={20} /><span className="text-sm text-gray-600">{selectedEvent.capacity > 0 ? `${Math.max(selectedEvent.capacity - (selectedEvent.registered || 0), 0)} spots remaining` : 'Open registration'}</span></div>{new Date(selectedEvent.date) >= new Date() && (registeredEvents.includes(selectedEvent.id) ? <button disabled className="bg-green-100 text-green-700 px-8 py-3 rounded-lg font-semibold flex items-center"><FiCheckCircle className="mr-2" />Already Registered</button> : <button onClick={() => handleEventRegister(selectedEvent)} className="btn-primary">Register Now</button>)}</div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .react-calendar { width: 100%; border: none; font-family: inherit; }
          .react-calendar__tile--active { background: #ed1515 !important; color: white; }
          .react-calendar__tile--active:enabled:hover, .react-calendar__tile--active:enabled:focus { background: #c80d0d !important; }
          .event-day { background-color: #fee7e7; font-weight: bold; color: #ed1515; position: relative; }
          .event-day::after { content: '•'; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); color: #ed1515; font-size: 12px; }
        `}</style>
      </div>
    </div>
  );
};

export default EventsPageApi;
