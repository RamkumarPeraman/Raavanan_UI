import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCalendar, FiMapPin, FiClock, FiUsers, FiUser, 
  FiFilter, FiSearch, FiChevronLeft, FiChevronRight,
  FiDownload, FiShare2, FiBookmark, FiCheckCircle,
  FiAlertCircle, FiAward, FiCamera, FiHeart
} from 'react-icons/fi';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-toastify';
import apiService from '../../services/api';

const EventsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
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
  const eventsPerPage = 6;

  // Event categories
  const categories = [
    'All',
    'Fundraiser',
    'Volunteer Training',
    'Community Event',
    'Awareness Campaign',
    'Workshop',
    'Conference',
    'Cultural Event',
    'Webinar'
  ];

  // Event types with colors
  const eventTypeColors = {
    'Fundraiser': 'bg-purple-100 text-purple-800',
    'Volunteer Training': 'bg-blue-100 text-blue-800',
    'Community Event': 'bg-green-100 text-green-800',
    'Awareness Campaign': 'bg-yellow-100 text-yellow-800',
    'Workshop': 'bg-indigo-100 text-indigo-800',
    'Conference': 'bg-red-100 text-red-800',
    'Cultural Event': 'bg-pink-100 text-pink-800',
    'Webinar': 'bg-teal-100 text-teal-800'
  };

  useEffect(() => {
    fetchEvents();
    // Load registered and bookmarked events from localStorage
    const registered = localStorage.getItem('registeredEvents');
    if (registered) {
      setRegisteredEvents(JSON.parse(registered));
    }
    const bookmarked = localStorage.getItem('bookmarkedEvents');
    if (bookmarked) {
      setBookmarkedEvents(JSON.parse(bookmarked));
    }
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, selectedCategory, searchTerm, activeTab, selectedDate]);

  const fetchEvents = async () => {
    try {
      const data = await apiService.getEvents();
      setEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.type === selectedCategory);
    }

    if (calendarFilterActive) {
      const selectedDateStr = selectedDate.toDateString();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date).toDateString();
        return eventDate === selectedDateStr;
      });
    }

    // Filter by tab
    const today = new Date();
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.date) >= today);
    } else if (activeTab === 'past') {
      filtered = filtered.filter(event => new Date(event.date) < today);
    } else if (activeTab === 'registered') {
      filtered = filtered.filter(event => registeredEvents.includes(event.id));
    }

    setFilteredEvents(filtered);
  };

  const handleEventRegister = async (event) => {
    try {
      const response = await apiService.registerForEvent(event.id, {
        name: 'Test User', // In real app, get from user context
        email: 'user@example.com'
      });

      if (response.success) {
        const updated = [...registeredEvents, event.id];
        setRegisteredEvents(updated);
        localStorage.setItem('registeredEvents', JSON.stringify(updated));
        toast.success(`Successfully registered for ${event.title}!`);
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleBookmark = (eventId) => {
    let updated;
    if (bookmarkedEvents.includes(eventId)) {
      updated = bookmarkedEvents.filter(id => id !== eventId);
      toast.info('Removed from bookmarks');
    } else {
      updated = [...bookmarkedEvents, eventId];
      toast.success('Added to bookmarks');
    }
    setBookmarkedEvents(updated);
    localStorage.setItem('bookmarkedEvents', JSON.stringify(updated));
  };

  const handleShare = async (event) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.origin + `/events/${event.id}`
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`);
      toast.success('Event link copied to clipboard!');
    }
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const downloadICS = (event) => {
    // Create ICS file content
    const startDate = new Date(event.date + 'T' + event.time.split(' - ')[0]);
    const endDate = new Date(event.date + 'T' + event.time.split(' - ')[1]);
    
    const icsContent = `BEGIN:VCALENDAR
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

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}.ics`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Calendar file downloaded!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  // Pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  // Get events for calendar highlighting
  const getEventDates = () => {
    return events.map(event => new Date(event.date));
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const eventDates = getEventDates();
      if (eventDates.some(eventDate => eventDate.toDateString() === date.toDateString())) {
        return 'event-day';
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-gray-50">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-gray-200 h-96 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Events & Updates</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us in our mission through various events, workshops, and community gatherings. 
            Register for upcoming events or explore our past activities.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: FiCalendar, value: events.length, label: 'Total Events' },
            { icon: FiClock, value: events.filter(e => new Date(e.date) >= new Date()).length, label: 'Upcoming' },
            { icon: FiUsers, value: '2.5k+', label: 'Attendees' },
            { icon: FiAward, value: '15+', label: 'Workshops' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
              <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Events List */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-3 font-medium whitespace-nowrap ${
                  activeTab === 'upcoming'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-6 py-3 font-medium whitespace-nowrap ${
                  activeTab === 'past'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Past Events
              </button>
              <button
                onClick={() => setActiveTab('registered')}
                className={`px-6 py-3 font-medium whitespace-nowrap ${
                  activeTab === 'registered'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Registrations
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-6 py-3 font-medium whitespace-nowrap ${
                  activeTab === 'gallery'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Event Gallery
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div className="md:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat === 'All' ? 'all' : cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Events Grid */}
            {activeTab !== 'gallery' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentEvents.map((event) => (
                    <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      {event.image && (
                        <div className="h-40 bg-gray-300 relative">
                          <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4 flex space-x-2">
                            <button
                              onClick={() => handleBookmark(event.id)}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                            >
                              <FiBookmark 
                                className={bookmarkedEvents.includes(event.id) ? 'fill-primary-600 text-primary-600' : 'text-gray-600'} 
                                size={16} 
                              />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${eventTypeColors[event.type] || 'bg-gray-100 text-gray-800'}`}>
                            {event.type}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <FiUsers className="mr-1" size={12} />
                            {event.registered}/{event.capacity} registered
                          </span>
                        </div>

                        <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiCalendar className="mr-2 text-primary-600" size={14} />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiClock className="mr-2 text-primary-600" size={14} />
                            {event.time}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiMapPin className="mr-2 text-primary-600" size={14} />
                            {event.location}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewEvent(event)}
                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            Details
                          </button>
                          
                          {new Date(event.date) >= new Date() && (
                            registeredEvents.includes(event.id) ? (
                              <button
                                disabled
                                className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                              >
                                <FiCheckCircle className="mr-1" />
                                Registered
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEventRegister(event)}
                                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                              >
                                Register
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
                      >
                        <FiChevronLeft />
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-4 py-2 rounded-lg ${
                            currentPage === i + 1
                              ? 'bg-primary-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
                      >
                        <FiChevronRight />
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              /* Event Gallery */
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="relative group cursor-pointer">
                    <div className="aspect-square bg-gray-300 rounded-lg overflow-hidden">
                      <img 
                        src={`/assets/gallery/event${i}.jpg`} 
                        alt={`Event ${i}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <FiCamera className="text-white" size={30} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Calendar & Info */}
          <div className="lg:col-span-1">
            {/* Calendar */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Event Calendar</h3>
              <Calendar
                onChange={(date) => {
                  setSelectedDate(date);
                  setCalendarFilterActive(true);
                }}
                value={selectedDate}
                tileClassName={tileClassName}
                className="w-full border-none"
              />
              <p className="text-sm text-gray-600 mt-4 text-center">
                {calendarFilterActive
                  ? `Events on ${selectedDate.toLocaleDateString()}: ${filteredEvents.length}`
                  : `Showing all matching events: ${filteredEvents.length}`}
              </p>
              {calendarFilterActive && (
                <button
                  onClick={() => setCalendarFilterActive(false)}
                  className="mt-3 w-full text-sm text-primary-600 font-semibold hover:text-primary-700"
                >
                  Clear date filter
                </button>
              )}
            </div>

            {/* Upcoming Events Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming This Month</h3>
              <div className="space-y-4">
                {events
                  .filter(e => new Date(e.date) >= new Date())
                  .slice(0, 3)
                  .map(event => (
                    <div key={event.id} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs text-primary-600 font-semibold">
                          {new Date(event.date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-primary-600">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{event.title}</h4>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <FiMapPin className="mr-1" size={10} />
                          {event.location}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
              <button
                onClick={() => setActiveTab('upcoming')}
                className="w-full mt-4 text-primary-600 font-semibold text-sm hover:text-primary-700"
              >
                View All Events →
              </button>
            </div>

            {/* Quick Info */}
            <div className="bg-primary-50 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary-800">Organize an Event</h3>
              <p className="text-primary-700 text-sm mb-4">
                Want to collaborate or organize an event with us? We'd love to hear your ideas!
              </p>
              <Link
                to="/contact"
                className="block w-full bg-primary-600 text-white text-center px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Event Details Modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {selectedEvent.image && (
                <div className="h-64 md:h-80 bg-gray-300 relative">
                  <img 
                    src={selectedEvent.image} 
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={() => handleBookmark(selectedEvent.id)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                    >
                      <FiBookmark 
                        className={bookmarkedEvents.includes(selectedEvent.id) ? 'fill-primary-600 text-primary-600' : 'text-gray-600'} 
                        size={20} 
                      />
                    </button>
                    <button
                      onClick={() => handleShare(selectedEvent)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                    >
                      <FiShare2 size={20} />
                    </button>
                    <button
                      onClick={() => downloadICS(selectedEvent)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                    >
                      <FiDownload size={20} />
                    </button>
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${eventTypeColors[selectedEvent.type] || 'bg-gray-100 text-gray-800'}`}>
                    {selectedEvent.type}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <FiUsers className="mr-1" />
                    {selectedEvent.registered}/{selectedEvent.capacity} registered
                  </span>
                </div>

                <h2 className="text-3xl font-bold mb-4">{selectedEvent.title}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FiCalendar className="text-primary-600 mr-3 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-semibold">Date</p>
                        <p className="text-gray-600">{formatDate(selectedEvent.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FiClock className="text-primary-600 mr-3 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-semibold">Time</p>
                        <p className="text-gray-600">{selectedEvent.time}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FiMapPin className="text-primary-600 mr-3 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-semibold">Location</p>
                        <p className="text-gray-600">{selectedEvent.location}</p>
                      </div>
                    </div>
                    {selectedEvent.price > 0 ? (
                      <div className="flex items-start">
                        <FiAward className="text-primary-600 mr-3 mt-1 flex-shrink-0" size={20} />
                        <div>
                          <p className="font-semibold">Entry Fee</p>
                          <p className="text-gray-600">₹{selectedEvent.price}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <FiHeart className="text-primary-600 mr-3 mt-1 flex-shrink-0" size={20} />
                        <div>
                          <p className="font-semibold">Entry</p>
                          <p className="text-gray-600">Free Event</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3">About the Event</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p>
                </div>

                {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Speakers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedEvent.speakers.map((speaker, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-bold text-lg">
                              {speaker.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{speaker}</p>
                            <p className="text-sm text-gray-500">Guest Speaker</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FiAlertCircle className="text-primary-600 mr-2" size={20} />
                    <span className="text-sm text-gray-600">
                      {selectedEvent.capacity - selectedEvent.registered} spots remaining
                    </span>
                  </div>
                  
                  {new Date(selectedEvent.date) >= new Date() && (
                    registeredEvents.includes(selectedEvent.id) ? (
                      <button
                        disabled
                        className="bg-green-100 text-green-700 px-8 py-3 rounded-lg font-semibold flex items-center"
                      >
                        <FiCheckCircle className="mr-2" />
                        Already Registered
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEventRegister(selectedEvent)}
                        className="btn-primary"
                      >
                        Register Now
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Calendar Styles */}
        <style jsx>{`
          .react-calendar {
            width: 100%;
            border: none;
            font-family: inherit;
          }
          .react-calendar__tile--active {
            background: #ed1515 !important;
            color: white;
          }
          .react-calendar__tile--active:enabled:hover,
          .react-calendar__tile--active:enabled:focus {
            background: #c80d0d !important;
          }
          .event-day {
            background-color: #fee7e7;
            font-weight: bold;
            color: #ed1515;
            position: relative;
          }
          .event-day::after {
            content: '•';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            color: #ed1515;
            font-size: 12px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default EventsPage;
