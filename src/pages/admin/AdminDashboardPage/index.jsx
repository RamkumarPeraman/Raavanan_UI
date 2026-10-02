import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiBriefcase, FiCalendar, FiFileText, FiEdit3, FiBookOpen, FiUsers, FiClipboard, FiCreditCard,
  FiPlus, FiEdit2, FiTrash2, FiSearch,
  FiCheck, FiX, FiCheckCircle, FiXCircle, FiList, FiClock,
  FiUpload, FiEye, FiImage, FiChevronUp, FiChevronDown,
} from 'react-icons/fi';
import { FaFileExcel, FaFilePdf, FaRupeeSign } from 'react-icons/fa';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import ContentPopup from '../../../components/admin/ContentPopup';
import Pagination from '../../../components/common/Pagination';
import apiService, { defaultBankDetails, defaultHeroNewsCarousel } from '../../../services/api';

const contentTypes = [
  { id: 'donations', label: 'Donations', icon: FaRupeeSign, popupType: null },
  { id: 'projects', label: 'Projects', icon: FiBriefcase, popupType: 'project' },
  { id: 'events', label: 'Events', icon: FiCalendar, popupType: 'event' },
  { id: 'blogs', label: 'Blogs', icon: FiEdit3, popupType: 'blog' },
  { id: 'reports', label: 'Reports & Publications', icon: FiBookOpen, popupType: 'report' },
  { id: 'volunteer', label: 'Volunteer Opportunities', icon: FiUsers, popupType: 'volunteer' },
  { id: 'volunteerApplications', label: 'Volunteer Applications', icon: FiClipboard, popupType: null },
  { id: 'homepageCarousel', label: 'Hero Carousel', icon: FiImage, popupType: null },
  { id: 'donationSettings', label: 'Payment Settings', icon: FiCreditCard, popupType: null },
];

const tableColumns = {
  projects: ['title', 'category', 'status', 'location', 'progress', 'goal', 'raised'],
  events: ['title', 'type', 'date', 'location', 'capacity', 'registered'],
  blogs: ['title', 'category', 'author', 'date', 'readTime'],
  reports: ['title', 'type', 'year', 'publishedDate', 'pages', 'status'],
  volunteer: ['title', 'category', 'location', 'commitment', 'spots', 'status'],
  volunteerApplications: ['fullName', 'email', 'phone', 'city', 'skills', 'status', 'createdAt'],
  donations: ['name', 'email', 'phone', 'amount', 'type', 'project', 'transactionId', 'paymentStatus', 'createdAt'],
};

const createHeroSlide = () => ({
  id: `hero-slide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  category: 'Latest News',
  title: '',
  summary: '',
  image: '',
  link: '',
  buttonLabel: 'Read more',
});

const normalizeHeroSlides = (slides = []) => {
  const source = Array.isArray(slides) ? slides : [];

  return source.map((slide, index) => ({
    id: slide.id || `hero-slide-${index + 1}`,
    category: slide.category || 'Latest News',
    title: slide.title || '',
    summary: slide.summary || '',
    image:
      typeof slide.image === 'string' &&
      slide.image.startsWith('data:image/') &&
      slide.image.length > 350000
        ? ''
        : (slide.image || ''),
    link: slide.link || '',
    buttonLabel: slide.buttonLabel || 'Read more',
  }));
};

const getFallbackHeroImage = (index = 0) =>
  defaultHeroNewsCarousel[index % defaultHeroNewsCarousel.length]?.image || '';

const resolveHeroImage = (src, fallbackSrc) => {
  if (typeof src === 'string' && src.startsWith('data:image/') && src.length > 350000) {
    return fallbackSrc || '';
  }

  return src || fallbackSrc || '';
};

const loadImageFromFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const compressHeroSlideImage = async (file) => {
  const image = await loadImageFromFile(file);
  const maxWidth = 1600;
  const maxHeight = 900;
  const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Image processing is unavailable');
  }
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.82);
};

const PreviewImage = ({ src, fallbackSrc, alt, className }) => {
  const [imageSrc, setImageSrc] = useState(resolveHeroImage(src, fallbackSrc));

  useEffect(() => {
    setImageSrc(resolveHeroImage(src, fallbackSrc));
  }, [src, fallbackSrc]);

  if (!imageSrc) {
    return null;
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (fallbackSrc && imageSrc !== fallbackSrc) {
          setImageSrc(fallbackSrc);
        }
      }}
    />
  );
};

const VOLUNTEER_FIELD_LABELS = {
  fullName: 'Full Name',
  email: 'Email',
  address: 'Address',
  phone: 'Phone Number',
  gender: 'Gender',
  dateOfBirth: 'Date of Birth',
  education: 'Educational Qualification',
  educationOther: 'Educational Qualification',
  institution: 'Name of Institution / College',
  occupation: 'Occupation',
  hearAbout: 'How did you hear about this drive?',
  hearAboutOther: 'How did you hear about this drive?',
  motivation: 'Why do you want to participate in this Volunteer Drive?',
  previousVolunteer: 'Have you previously participated in any volunteer activities? Say about that.',
  skills: 'What are your key skills or areas of interest?',
  skillsOther: 'Key Skills / Areas of Interest',
  capacity: 'In what capacity would you like to be involved?',
  capacityOther: 'Capacity',
  corePurpose: 'In one powerful line, tell us the purpose that drives you every day?',
  newLaw: "If you had the power to create one new law for India — one that doesn't exist yet — what law would you bring, and why?",
  viewOnSociety: "What is your point of view about today's society around you?",
  leadershipAction: 'If you were chosen as a leader, what is the action you would take to create a change?',
  dailyHabit: 'What is one tiny daily habit that you believe can create a massive change in society if everyone practices it?',
  city: 'City',
  state: 'State',
  pincode: 'Pincode',
  occupationOther: 'Occupation Other',
  interests: 'Interests',
  availability: 'Availability',
  hoursPerWeek: 'Hours Per Week',
  experience: 'Experience',
  emergencyContact: 'Emergency Contact',
  selectedOpportunityId: 'Selected Opportunity ID',
  selectedOpportunityTitle: 'Selected Opportunity Title',
  agreeConduct: 'Agreed To Conduct',
  agreeDeclaration: 'Agreed To Declaration',
  status: 'Status',
  createdAt: 'Applied On',
  updatedAt: 'Updated On',
};

const VOLUNTEER_PRIMARY_FIELDS = [
  'fullName',
  'email',
  'address',
  'phone',
  'gender',
  'dateOfBirth',
  'education',
  'educationOther',
  'institution',
  'occupation',
  'occupationOther',
  'hearAbout',
  'hearAboutOther',
  'motivation',
  'previousVolunteer',
  'skills',
  'skillsOther',
  'capacity',
  'capacityOther',
  'corePurpose',
  'newLaw',
  'viewOnSociety',
  'leadershipAction',
  'dailyHabit',
  'interests',
  'city',
  'state',
  'pincode',
  'availability',
  'hoursPerWeek',
  'experience',
  'emergencyContact',
  'selectedOpportunityId',
  'selectedOpportunityTitle',
  'agreeConduct',
  'agreeDeclaration',
  'status',
  'createdAt',
  'updatedAt',
];

const VOLUNTEER_EXCLUDED_FIELDS = new Set(['_id', 'id', '__v', 'passwordHash']);
const VOLUNTEER_BOOLEAN_FIELDS = new Set(['agreeConduct', 'agreeDeclaration']);
const VOLUNTEER_ARRAY_FIELDS = new Set(['interests', 'skills', 'capacity']);
const VOLUNTEER_OBJECT_FIELDS = new Set(['availability', 'emergencyContact']);
const DONATION_EDIT_FIELDS = [
  { key: 'name', label: 'Donor Name', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'phone', label: 'Phone', type: 'text', required: true },
  { key: 'amount', label: 'Amount (INR)', type: 'number', required: true },
  { key: 'type', label: 'Donation Type', type: 'select', options: ['one-time', 'monthly'] },
  { key: 'project', label: 'Project', type: 'text' },
  { key: 'paymentStatus', label: 'Payment Status', type: 'select', options: ['pending', 'accepted', 'rejected', 'completed', 'failed'] },
  { key: 'transactionId', label: 'Transaction ID', type: 'text' },
  { key: 'paymentMethod', label: 'Payment Method', type: 'text' },
  { key: 'pan', label: 'PAN', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'state', label: 'State', type: 'text' },
  { key: 'address', label: 'Address', type: 'textarea' },
  { key: 'message', label: 'Message', type: 'textarea' },
];

const normalizeVolunteerRecord = (volunteer = {}) => ({
  ...volunteer,
  id: volunteer.id || volunteer._id,
});

const getVolunteerFieldList = (volunteer = {}) => {
  const extraFields = Object.keys(volunteer || {}).filter(
    (key) => !VOLUNTEER_EXCLUDED_FIELDS.has(key) && !VOLUNTEER_PRIMARY_FIELDS.includes(key)
  );

  return [...VOLUNTEER_PRIMARY_FIELDS, ...extraFields].filter(
    (key) => !VOLUNTEER_EXCLUDED_FIELDS.has(key)
  );
};

const formatVolunteerFieldValue = (value, key) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if ((key === 'createdAt' || key === 'updatedAt' || key === 'dateOfBirth') && value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('en-IN');
    }
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : '-';
  }

  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, nestedValue]) => nestedValue !== null && nestedValue !== undefined && nestedValue !== '')
      .map(([nestedKey, nestedValue]) => `${VOLUNTEER_FIELD_LABELS[nestedKey] || nestedKey}: ${nestedValue}`)
      .join(', ') || '-';
  }

  return String(value);
};

const getVolunteerInputType = (key, value) => {
  if (key === 'status') {
    return 'select';
  }

  if (typeof value === 'boolean') {
    return 'checkbox';
  }

  if (Array.isArray(value) || typeof value === 'object') {
    return 'textarea';
  }

  if (key === 'email') {
    return 'email';
  }

  if (key === 'dateOfBirth') {
    return 'date';
  }

  const longTextFields = new Set([
    'address', 'motivation', 'previousVolunteer', 'experience', 'corePurpose',
    'newLaw', 'viewOnSociety', 'leadershipAction', 'dailyHabit',
  ]);

  return longTextFields.has(key) ? 'textarea' : 'text';
};

const stringifyVolunteerFieldValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

const parseVolunteerFieldValue = (rawValue, sourceValue, key) => {
  if (VOLUNTEER_BOOLEAN_FIELDS.has(key) || typeof sourceValue === 'boolean') {
    return Boolean(rawValue);
  }

  if (VOLUNTEER_ARRAY_FIELDS.has(key) || Array.isArray(sourceValue)) {
    return String(rawValue)
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (VOLUNTEER_OBJECT_FIELDS.has(key) || (sourceValue && typeof sourceValue === 'object')) {
    try {
      return rawValue ? JSON.parse(rawValue) : {};
    } catch (error) {
      throw new Error(`Invalid JSON in ${VOLUNTEER_FIELD_LABELS[key] || key}.`);
    }
  }

  return rawValue;
};

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('donations');
  const [itemsByType, setItemsByType] = useState({
    projects: [], events: [], blogs: [], reports: [],
    volunteer: [], volunteerApplications: [], donations: [],
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalsByType, setTotalsByType] = useState({});
  const [summaryByType, setSummaryByType] = useState({});
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [volunteerFilter, setVolunteerFilter] = useState('pending');
  const [donationStatusFilter, setDonationStatusFilter] = useState('pending');
  const [screenshotModal, setScreenshotModal] = useState(null);
  const [volunteerModalMode, setVolunteerModalMode] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [volunteerFormData, setVolunteerFormData] = useState({});
  const [volunteerModalLoading, setVolunteerModalLoading] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [donationFormData, setDonationFormData] = useState({});
  const [donationModalLoading, setDonationModalLoading] = useState(false);

  // Donation Settings state
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [heroSaving, setHeroSaving] = useState(false);
  const [qrImage, setQrImage] = useState('');
  const [bankDetails, setBankDetails] = useState({ ...defaultBankDetails });
  const [heroCarouselSlides, setHeroCarouselSlides] = useState([]);
  const qrFileRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;
    const countFor = async (type, status) => {
      const result = await apiService.getAdminContentPage(type, { page: 1, pageSize: 1, status });
      return result.totalRowCount || 0;
    };
    const countedTypes = contentTypes.filter((type) => type.popupType || ['volunteerApplications', 'donations'].includes(type.id));
    Promise.all([
      Promise.allSettled(countedTypes.map(async (type) => [type.id, await countFor(type.id)])),
      Promise.allSettled(['pending', 'approved', 'rejected'].map(async (status) => [status, await countFor('volunteerApplications', status)])),
      Promise.allSettled(['pending', 'accepted', 'rejected'].map(async (status) => [status, await countFor('donations', status)])),
      apiService.getDonationStats().catch(() => null),
    ]).then(([countResults, volunteerResults, donationResults, donationStats]) => {
      if (cancelled) return;
      const fulfilled = (results) => results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
      const totals = Object.fromEntries(fulfilled(countResults));
      setTotalsByType((previous) => ({ ...previous, ...totals }));
      setSummaryByType({
        volunteerApplications: { total: totals.volunteerApplications, ...Object.fromEntries(fulfilled(volunteerResults)) },
        donations: { total: totals.donations, ...Object.fromEntries(fulfilled(donationResults)), totalAmount: donationStats?.data?.acceptedAmount || 0 },
      });
    }).catch(() => { if (!cancelled) toast.error('Failed to load dashboard counts'); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  useEffect(() => {
    if (activeTab === 'donationSettings' || activeTab === 'homepageCarousel') return undefined;
    let cancelled = false;
    setLoading(true);
    const params = { page, pageSize, search: debouncedSearch || undefined };
    if (activeTab === 'volunteerApplications' && volunteerFilter !== 'all') params.status = volunteerFilter;
    if (activeTab === 'donations' && donationStatusFilter !== 'all') params.status = donationStatusFilter;
    apiService.getAdminContentPage(activeTab, params).then((result) => {
      if (cancelled) return;
      const nextTotal = result.totalRowCount || 0;
      const lastPage = Math.max(1, Math.ceil(nextTotal / pageSize));
      if (page > lastPage) { setPage(lastPage); return; }
      setItemsByType((previous) => ({ ...previous, [activeTab]: result.items }));
      setTotalItems(nextTotal);
      if (!debouncedSearch && volunteerFilter === 'all' && donationStatusFilter === 'all') {
        setTotalsByType((previous) => ({ ...previous, [activeTab]: nextTotal }));
      }
    }).catch((error) => {
      if (!cancelled) toast.error(error.message || 'Failed to load dashboard content');
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab, page, pageSize, debouncedSearch, volunteerFilter, donationStatusFilter, refreshKey]);

  useEffect(() => {
    if (activeTab === 'donationSettings' || activeTab === 'homepageCarousel') {
      loadAdminSettings();
    }
  }, [activeTab]);

  const loadAdminSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await apiService.getAdminSettings();
      if (res?.data) {
        setQrImage(res.data.donationQrImage || '');
        setBankDetails({ ...defaultBankDetails, ...res.data.bankDetails });
        setHeroCarouselSlides(normalizeHeroSlides(res.data.heroNewsCarousel));
      }
    } catch (e) {
      toast.error('Failed to load settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleQrFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('QR image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setQrImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await apiService.updateAdminSettings({ donationQrImage: qrImage, bankDetails });
      toast.success('Payment settings saved successfully!');
    } catch (e) {
      toast.error(e.message || 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleHeroSlideChange = (slideId, field, value) => {
    setHeroCarouselSlides((prev) => prev.map((slide) => (
      slide.id === slideId ? { ...slide, [field]: value } : slide
    )));
  };

  const handleHeroSlideImageChange = async (slideId, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Slide image must be under 5MB');
      return;
    }

    try {
      const compressedImage = await compressHeroSlideImage(file);
      handleHeroSlideChange(slideId, 'image', compressedImage);
      toast.success('Slide image optimized for the homepage');
    } catch (error) {
      toast.error('Failed to process slide image');
    }
  };

  const handleMoveHeroSlide = (slideId, direction) => {
    setHeroCarouselSlides((prev) => {
      const currentIndex = prev.findIndex((slide) => slide.id === slideId);
      if (currentIndex < 0) return prev;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
      return next;
    });
  };

  const handleAddHeroSlide = () => {
    setHeroCarouselSlides((prev) => [...prev, createHeroSlide()]);
  };

  const handleRemoveHeroSlide = (slideId) => {
    if (heroCarouselSlides.length === 1) {
      toast.info('At least one slide is recommended for the homepage carousel');
    }

    setHeroCarouselSlides((prev) => prev.filter((slide) => slide.id !== slideId));
  };

  const handleSaveHeroCarousel = async () => {
    setHeroSaving(true);
    try {
      await apiService.updateAdminSettings({ heroNewsCarousel: heroCarouselSlides });
      toast.success('Hero carousel saved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to save hero carousel');
    } finally {
      setHeroSaving(false);
    }
  };

  const popupType = contentTypes.find((type) => type.id === activeTab)?.popupType || 'project';
  const items = useMemo(() => itemsByType[activeTab] || [], [itemsByType, activeTab]);

  const filteredItems = items;
  const refreshContent = () => setRefreshKey((key) => key + 1);

  const normalizePayload = (type, item) => {
    if (type === 'project') {
      return {
        ...item,
        progress: Number(item.progress || 0),
        goal: Number(item.goal || 0),
        raised: Number(item.raised || 0),
        livesImpacted: Number(item.livesImpacted || 0),
        volunteersEngaged: Number(item.volunteersEngaged || 0),
        impact: Object.fromEntries(
          Object.entries(item.impact || {}).filter(([key]) => key).map(([key, value]) => [key, Number(value || 0)])
        ),
      };
    }
    if (type === 'event') return { ...item, capacity: Number(item.capacity || 0), registered: Number(item.registered || 0), price: Number(item.price || 0) };
    if (type === 'blog') return { ...item, readTime: Number(item.readTime || 1) };
    if (type === 'volunteer') return { ...item, spots: Number(item.spots || 1), status: item.status || 'active' };
    if (type === 'report') return { ...item, pages: Number(item.pages || 0), downloads: Number(item.downloads || 0), views: Number(item.views || 0), featured: Boolean(item.featured), status: item.status || 'published' };
    return item;
  };

  const handleAdd = () => { setSelectedItem(null); setShowPopup(true); };
  const handleEdit = (item) => { setSelectedItem(item); setShowPopup(true); };
  const openDonationModal = (donation) => {
    setSelectedDonation(donation);
    setDonationFormData({
      name: donation.name || '',
      email: donation.email || '',
      phone: donation.phone || '',
      amount: donation.amount || '',
      type: donation.type || 'one-time',
      project: donation.project || 'general',
      paymentStatus: donation.paymentStatus || 'pending',
      transactionId: donation.transactionId || '',
      paymentMethod: donation.paymentMethod || '',
      pan: donation.pan || '',
      city: donation.city || '',
      state: donation.state || '',
      address: donation.address || '',
      message: donation.message || '',
    });
    setDonationModalOpen(true);
  };
  const closeDonationModal = () => {
    if (donationModalLoading) return;
    setDonationModalOpen(false);
    setSelectedDonation(null);
    setDonationFormData({});
  };

  const updateVolunteerInState = (updatedVolunteer) => {
    const normalizedVolunteer = normalizeVolunteerRecord(updatedVolunteer);
    setItemsByType((prev) => ({
      ...prev,
      volunteerApplications: prev.volunteerApplications.map((volunteer) =>
        (volunteer._id || volunteer.id) === normalizedVolunteer.id
          ? { ...volunteer, ...normalizedVolunteer }
          : volunteer
      ),
    }));
    setSelectedVolunteer(normalizedVolunteer);
  };

  const closeVolunteerModal = () => {
    if (volunteerModalLoading) return;
    setVolunteerModalMode(null);
    setSelectedVolunteer(null);
    setVolunteerFormData({});
  };

  const openVolunteerModal = async (volunteer, mode) => {
    const volunteerId = volunteer._id || volunteer.id;
    if (!volunteerId) {
      toast.error('Volunteer record is missing an id');
      return;
    }

    setVolunteerModalMode(mode);
    setVolunteerModalLoading(true);

    try {
      const response = await apiService.getVolunteerProfile(volunteerId);
      const volunteerData = normalizeVolunteerRecord(response?.data || volunteer);
      setSelectedVolunteer(volunteerData);
      setVolunteerFormData(
        getVolunteerFieldList(volunteerData).reduce((acc, key) => {
          acc[key] = stringifyVolunteerFieldValue(volunteerData[key]);
          return acc;
        }, {})
      );
    } catch (error) {
      toast.error(error.message || 'Failed to load volunteer details');
      setVolunteerModalMode(null);
    } finally {
      setVolunteerModalLoading(false);
    }
  };

  const handleDelete = async (item) => {
    const label = popupType === 'volunteer' ? 'volunteer opportunity' : popupType;
    if (!window.confirm(`Are you sure you want to delete this ${label}?`)) return;
    try {
      if (activeTab === 'projects') await apiService.deleteProjectAdmin(item.id);
      else if (activeTab === 'events') await apiService.deleteEventAdmin(item.id);
      else if (activeTab === 'blogs') await apiService.deleteBlogAdmin(item.id);
      else if (activeTab === 'reports') await apiService.deleteReportAdmin(item.id);
      else if (activeTab === 'volunteer') await apiService.deleteVolunteerOpportunityAdmin(item.id);

      setItemsByType((prev) => ({ ...prev, [activeTab]: prev[activeTab].filter((entry) => entry.id !== item.id) }));
      refreshContent();
      toast.success('Deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleAcceptVolunteer = async (volunteer) => {
    try {
      await apiService.updateVolunteerStatus(volunteer._id || volunteer.id, 'approved');
      updateVolunteerInState({ ...volunteer, status: 'approved' });
      refreshContent();
      toast.success(`${volunteer.fullName} has been accepted`);
    } catch (error) {
      toast.error('Failed to accept volunteer');
    }
  };

  const handleRejectVolunteer = async (volunteer) => {
    try {
      await apiService.updateVolunteerStatus(volunteer._id || volunteer.id, 'rejected');
      updateVolunteerInState({ ...volunteer, status: 'rejected' });
      refreshContent();
      toast.success(`${volunteer.fullName} has been rejected`);
    } catch (error) {
      toast.error('Failed to reject volunteer');
    }
  };

  const handleDeleteVolunteer = async (volunteer) => {
    if (!window.confirm(`Delete ${volunteer.fullName} from the volunteer applications table?`)) return;

    try {
      await apiService.deleteVolunteer(volunteer._id || volunteer.id);
      setItemsByType((prev) => ({
        ...prev,
        volunteerApplications: prev.volunteerApplications.filter((v) => (v._id || v.id) !== (volunteer._id || volunteer.id)),
      }));
      if ((selectedVolunteer?._id || selectedVolunteer?.id) === (volunteer._id || volunteer.id)) {
        closeVolunteerModal();
      }
      refreshContent();
      toast.success(`${volunteer.fullName} has been deleted`);
    } catch (error) {
      toast.error(error.message || 'Failed to delete volunteer');
    }
  };

  const handleDonationFieldChange = (field, value) => {
    setDonationFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDonationEdit = async () => {
    if (!selectedDonation) return;

    if (!donationFormData.name || !donationFormData.email || !donationFormData.phone || !donationFormData.amount) {
      toast.error('Please fill donor name, email, phone, and amount');
      return;
    }

    setDonationModalLoading(true);
    try {
      const payload = {
        ...donationFormData,
        amount: Number(donationFormData.amount),
      };
      const response = await apiService.updateDonation(selectedDonation.id || selectedDonation._id, payload);
      const updatedDonation = response?.data || payload;

      setItemsByType((prev) => ({
        ...prev,
        donations: prev.donations.map((donation) =>
          (donation._id || donation.id) === (selectedDonation._id || selectedDonation.id)
            ? { ...donation, ...updatedDonation, id: updatedDonation.id || updatedDonation._id || donation.id }
            : donation
        ),
      }));
      refreshContent();

      toast.success(`Donation from ${payload.name} updated`);
      closeDonationModal();
    } catch (error) {
      toast.error(error.message || 'Failed to update donation');
    } finally {
      setDonationModalLoading(false);
    }
  };

  const handleDeleteDonation = async (donation) => {
    if (!window.confirm(`Delete donation from ${donation.name}?`)) return;

    try {
      await apiService.deleteDonation(donation._id || donation.id);
      setItemsByType((prev) => ({
        ...prev,
        donations: prev.donations.filter((entry) => (entry._id || entry.id) !== (donation._id || donation.id)),
      }));
      refreshContent();
      toast.success('Donation deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete donation');
    }
  };

  const handleVolunteerFieldChange = (key, value) => {
    setVolunteerFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveVolunteerEdit = async () => {
    if (!selectedVolunteer) return;

    setVolunteerModalLoading(true);
    try {
      const payload = getVolunteerFieldList(selectedVolunteer).reduce((acc, key) => {
        if (key === 'createdAt' || key === 'updatedAt') {
          return acc;
        }

        acc[key] = parseVolunteerFieldValue(volunteerFormData[key], selectedVolunteer[key], key);
        return acc;
      }, {});

      const response = await apiService.updateVolunteer(selectedVolunteer.id || selectedVolunteer._id, payload);
      const updatedVolunteer = normalizeVolunteerRecord(response?.data || payload);
      updateVolunteerInState(updatedVolunteer);
      setVolunteerFormData(
        getVolunteerFieldList(updatedVolunteer).reduce((acc, key) => {
          acc[key] = stringifyVolunteerFieldValue(updatedVolunteer[key]);
          return acc;
        }, {})
      );
      setVolunteerModalMode('view');
      refreshContent();
      toast.success('Volunteer details updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update volunteer');
    } finally {
      setVolunteerModalLoading(false);
    }
  };

  const handleAcceptDonation = async (donation) => {
    try {
      await apiService.updateDonationStatus(donation._id || donation.id, 'accepted');
      setItemsByType((prev) => ({
        ...prev,
        donations: prev.donations.map((d) =>
          (d._id || d.id) === (donation._id || donation.id) ? { ...d, paymentStatus: 'accepted' } : d
        ),
      }));
      refreshContent();
      toast.success(`Donation from ${donation.name} accepted`);
    } catch (error) {
      toast.error('Failed to accept donation');
    }
  };

  const handleRejectDonation = async (donation) => {
    if (!window.confirm(`Reject donation from ${donation.name}?`)) return;
    try {
      await apiService.updateDonationStatus(donation._id || donation.id, 'rejected');
      setItemsByType((prev) => ({
        ...prev,
        donations: prev.donations.map((d) =>
          (d._id || d.id) === (donation._id || donation.id) ? { ...d, paymentStatus: 'rejected' } : d
        ),
      }));
      refreshContent();
      toast.success(`Donation from ${donation.name} rejected`);
    } catch (error) {
      toast.error('Failed to reject donation');
    }
  };

  const handleSave = async (newItem) => {
    setSaving(true);
    try {
      const payload = normalizePayload(popupType, newItem);
      let savedItem;
      if (activeTab === 'projects') savedItem = selectedItem ? await apiService.updateProjectAdmin(selectedItem.id, payload) : await apiService.createProjectAdmin(payload);
      else if (activeTab === 'events') savedItem = selectedItem ? await apiService.updateEventAdmin(selectedItem.id, payload) : await apiService.createEventAdmin(payload);
      else if (activeTab === 'blogs') savedItem = selectedItem ? await apiService.updateBlogAdmin(selectedItem.id, payload) : await apiService.createBlogAdmin(payload);
      else if (activeTab === 'reports') savedItem = selectedItem ? await apiService.updateReportAdmin(selectedItem.id, payload) : await apiService.createReportAdmin(payload);
      else if (activeTab === 'volunteer') savedItem = selectedItem ? await apiService.updateVolunteerOpportunityAdmin(selectedItem.id, payload) : await apiService.createVolunteerOpportunityAdmin(payload);

      setItemsByType((prev) => ({
        ...prev,
        [activeTab]: selectedItem
          ? prev[activeTab].map((entry) => (entry.id === savedItem.id ? savedItem : entry))
          : [savedItem, ...prev[activeTab]],
      }));
      if (!selectedItem) setPage(1);
      refreshContent();
    } finally {
      setSaving(false);
    }
  };

  const exportToExcel = (data, filename, columns, headers) => {
    if (data.length === 0) { toast.info('Nothing to export'); return; }
    const rows = data.map((item) =>
      columns.reduce((acc, col, i) => {
        acc[headers[i]] = Array.isArray(item[col]) ? item[col].join(', ') : (item[col] ?? '');
        return acc;
      }, {})
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
    toast.success('Exported to Excel');
  };

  const exportToPdf = async (data, filename, columns, headers) => {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const doc = new jsPDF({ orientation: 'landscape', format: columns.length > 10 ? 'a3' : 'a4' });
    doc.setFontSize(14);
    doc.text(filename.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()), 12, 15);
    autoTable(doc, {
      head: [headers.map((header) => header.replace('₹', 'INR'))],
      body: data.map((item) => columns.map((column) => {
        const value = Array.isArray(item[column]) ? item[column].join(', ') : item[column];
        return value == null ? '' : String(value);
      })),
      startY: 21,
      margin: { left: 10, right: 10 },
      styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [22, 101, 99] },
    });
    doc.save(`${filename}.pdf`);
    toast.success('Exported to PDF');
  };

  const handleExport = async (format) => {
    try {
      const params = { search: searchTerm.trim() || undefined };
      if (activeTab === 'volunteerApplications') params.status = 'approved';
      if (activeTab === 'donations' && donationStatusFilter !== 'all') params.status = donationStatusFilter;
      const { items: exportItems } = await apiService.getAdminContentPage(activeTab, params);
      if (exportItems.length === 0) { toast.info('Nothing to export'); return; }
      let filename;
      let columns;
      let headers;
      if (activeTab === 'volunteerApplications') {
        filename = 'volunteer_applications';
        columns = ['fullName', 'email', 'phone', 'city', 'state', 'occupation', 'skills', 'interests', 'hoursPerWeek', 'status', 'createdAt'];
        headers = ['Full Name', 'Email', 'Phone', 'City', 'State', 'Occupation', 'Skills', 'Interests', 'Hours/Week', 'Status', 'Applied Date'];
      } else if (activeTab === 'donations') {
        filename = 'donations';
        columns = ['name', 'email', 'phone', 'amount', 'type', 'project', 'transactionId', 'paymentStatus', 'pan', 'city', 'state', 'createdAt'];
        headers = ['Donor Name', 'Email', 'Phone', 'Amount (₹)', 'Type', 'Project', 'Transaction ID', 'Status', 'PAN', 'City', 'State', 'Date'];
      } else {
        filename = activeTab;
        columns = tableColumns[activeTab];
        headers = columns.map((column) => column.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()));
      }
      if (format === 'pdf') await exportToPdf(exportItems, filename, columns, headers);
      else exportToExcel(exportItems, filename, columns, headers);
    } catch (error) {
      toast.error(error.message || 'Export failed');
    }
  };

  const renderCell = (column, value) => {
    if (column === 'date' || column === 'createdAt' || column === 'publishedDate') {
      return value ? new Date(value).toLocaleDateString('en-IN') : '-';
    }
    if (column === 'goal' || column === 'raised' || column === 'price') {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
    }
    if (column === 'amount') {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
    }
    if (column === 'progress') return `${value || 0}%`;
    if (Array.isArray(value)) return value.join(', ') || '-';
    if (column === 'status') {
      const colors = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', completed: 'bg-blue-100 text-blue-800', active: 'bg-green-100 text-green-800', inactive: 'bg-gray-100 text-gray-800', published: 'bg-blue-100 text-blue-800', draft: 'bg-gray-100 text-gray-800', verified: 'bg-green-100 text-green-800' };
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[value] || 'bg-gray-100 text-gray-700'}`}>{value || '-'}</span>;
    }
    if (column === 'paymentStatus') {
      const colors = { pending: 'bg-yellow-100 text-yellow-800', accepted: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', completed: 'bg-blue-100 text-blue-800', failed: 'bg-red-100 text-red-800' };
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[value] || 'bg-gray-100 text-gray-700'}`}>{value || '-'}</span>;
    }
    if (column === 'transactionId') {
      return value ? <span className="font-mono text-xs text-gray-700">{value}</span> : <span className="text-gray-400">-</span>;
    }
    return value || '-';
  };

  const isSpecialTab = ['volunteerApplications', 'donations', 'donationSettings', 'homepageCarousel'].includes(activeTab);
  const selectedVolunteerFields = selectedVolunteer ? getVolunteerFieldList(selectedVolunteer) : [];
  const statusSummary = summaryByType[activeTab] || {};
  const selectedStatus = activeTab === 'donations' ? donationStatusFilter : volunteerFilter;
  const statusOptions = ['donations', 'volunteerApplications'].includes(activeTab) ? [
    { id: 'all', label: 'ALL', icon: FiList, count: statusSummary.total, inactive: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100', active: 'border-blue-400 bg-blue-100 text-blue-900 hover:bg-blue-200' },
    { id: 'pending', label: 'Pending', icon: FiClock, count: statusSummary.pending, inactive: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100', active: 'border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200' },
    { id: activeTab === 'donations' ? 'accepted' : 'approved', label: activeTab === 'donations' ? 'Accepted' : 'Approved', icon: FiCheckCircle, count: activeTab === 'donations' ? statusSummary.accepted : statusSummary.approved, inactive: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100', active: 'border-green-400 bg-green-100 text-green-900 hover:bg-green-200' },
    { id: 'rejected', label: 'Rejected', icon: FiXCircle, count: statusSummary.rejected, inactive: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100', active: 'border-red-400 bg-red-100 text-red-900 hover:bg-red-200' },
  ] : [];

  const renderDashboardTabs = (showToolbar = false) => (
    <div className="mb-4 flex flex-wrap items-center gap-2">
    <nav aria-label="Admin sections" className="flex min-w-0 w-full items-center gap-1.5 overflow-x-auto sm:w-auto sm:flex-1">
      {contentTypes.map((type) => (
        <button
          key={type.id}
          type="button"
          aria-pressed={activeTab === type.id}
          aria-label={type.label}
          data-tooltip={type.label}
          onClick={() => { setActiveTab(type.id); setPage(1); setSearchTerm(''); setVolunteerFilter('pending'); setDonationStatusFilter(type.id === 'donations' ? 'pending' : 'all'); }}
          className={`inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${activeTab === type.id ? 'border-primary-500 bg-primary-600 px-2.5 text-white shadow-sm' : 'w-8 border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'}`}
        >
          <type.icon aria-hidden="true" className="h-4 w-4 shrink-0" />
          {activeTab === type.id && <span>{type.label}</span>}
          {activeTab === type.id && type.id !== 'donationSettings' && (
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[11px] leading-none text-white">
              {type.id === 'homepageCarousel' ? heroCarouselSlides.length : totalsByType[type.id] || 0}
            </span>
          )}
        </button>
      ))}
    </nav>
    {statusOptions.length > 0 && (
      <div role="group" aria-label={activeTab === 'donations' ? 'Donation status' : 'Volunteer application status'} className="flex shrink-0 items-center gap-1.5">
        {statusOptions.map((status) => (
          <button
            key={status.id}
            type="button"
            aria-pressed={selectedStatus === status.id}
            aria-label={`${status.label}: ${status.count || 0}`}
            data-tooltip={status.label}
            onClick={() => { (activeTab === 'donations' ? setDonationStatusFilter : setVolunteerFilter)(status.id); setPage(1); }}
            className={`inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${selectedStatus === status.id ? `px-2.5 ${status.active}` : `w-8 ${status.inactive}`}`}
          >
            <status.icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            {selectedStatus === status.id && <span>{status.label}</span>}
            {selectedStatus === status.id && status.id === 'pending' && <span className="font-semibold tabular-nums">{status.count || 0}</span>}
          </button>
        ))}
      </div>
    )}
    {showToolbar && (
      <>
        {activeTab === 'donations' && (
          <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-2.5 text-xs text-violet-800">
            <span>Total Amount</span>
            <strong className="tabular-nums">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(summaryByType.donations?.totalAmount || 0)}</strong>
          </span>
        )}
        <button type="button" onClick={() => handleExport('excel')} aria-label={activeTab === 'volunteerApplications' ? 'Export accepted applications to Excel' : 'Export to Excel'} data-tooltip={activeTab === 'volunteerApplications' ? 'Export accepted applications to Excel' : 'Export to Excel'} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-green-700 hover:bg-green-50">
          <FaFileExcel aria-hidden="true" className="h-4 w-4 text-green-700" />
        </button>
        <button type="button" onClick={() => handleExport('pdf')} aria-label={activeTab === 'volunteerApplications' ? 'Export accepted applications to PDF' : 'Export to PDF'} data-tooltip={activeTab === 'volunteerApplications' ? 'Export accepted applications to PDF' : 'Export to PDF'} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-red-700 hover:bg-red-50">
          <FaFilePdf aria-hidden="true" className="h-4 w-4" />
        </button>
        <div className="relative w-full sm:w-48 lg:w-56">
          <FiSearch aria-hidden="true" className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            aria-label={`Search ${activeTab}`}
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="h-8 w-full rounded-md border border-gray-300 bg-white pl-8 pr-3 text-xs focus:border-primary-500 focus:outline-none"
          />
        </div>
        {!isSpecialTab && (
          <button type="button" onClick={handleAdd} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-primary-600 px-2.5 text-xs text-white hover:bg-primary-700">
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Add New
          </button>
        )}
      </>
    )}
    </div>
  );

  // ---- Donation Settings Panel ----
  if (activeTab === 'donationSettings') {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-gray-50">
        <div className="w-full px-[5px]">
          {renderDashboardTabs()}

          {settingsLoading ? (
            <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* QR Code Upload */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><FiImage /> Donation QR Code</h2>
                <p className="text-sm text-gray-500 mb-5">Upload the QR code image that donators will scan to pay. This will appear on the public donation page.</p>

                <div
                  onClick={() => qrFileRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors mb-4"
                >
                  {qrImage ? (
                    <div className="relative inline-block">
                      <img src={qrImage} alt="QR Preview" className="max-h-48 mx-auto rounded border border-gray-200" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setQrImage(''); if (qrFileRef.current) qrFileRef.current.value = ''; }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <FiUpload size={32} className="mx-auto mb-2" />
                      <p className="text-sm font-medium">Click to upload QR image</p>
                      <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input ref={qrFileRef} type="file" accept="image/*" onChange={handleQrFileChange} className="hidden" />
              </div>

              {/* Bank Details */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><FaRupeeSign /> Bank Account Details</h2>
                <p className="text-sm text-gray-500 mb-5">These details are shown on the donation page for direct bank transfers.</p>

                <div className="space-y-4">
                  {[
                    { key: 'accountHolder', label: 'Account Holder' },
                    { key: 'bank', label: 'Bank Name' },
                    { key: 'branch', label: 'Branch' },
                    { key: 'accountNo', label: 'Account Number' },
                    { key: 'ifscCode', label: 'IFSC Code' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                      <input
                        type="text"
                        value={bankDetails[key] || ''}
                        onChange={(e) => setBankDetails((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="lg:col-span-2">
                <button
                  onClick={handleSaveSettings}
                  disabled={settingsSaving}
                  className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {settingsSaving ? 'Saving...' : 'Save Payment Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'homepageCarousel') {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-gray-50">
        <div className="w-full px-[5px]">
          {renderDashboardTabs()}

          <div className="mb-6 flex justify-end">
            <button
              onClick={handleAddHeroSlide}
              className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
            >
              <FiPlus className="mr-2" />
              Add Slide
            </button>
          </div>

          {settingsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900">Hero carousel preview</h2>
                <p className="text-sm text-gray-500 mt-1">
                  These slides are stored in the database and shown only on the public homepage. Add image, title, summary, and link for each slide.
                </p>
              </div>

              {heroCarouselSlides.length === 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                    <FiImage size={28} />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-gray-900">No homepage slides yet</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add a slide here and save it to store the homepage carousel in the database.
                  </p>
                </div>
              )}

              {heroCarouselSlides.map((slide, index) => (
                <div key={slide.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                        Slide {index + 1}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mt-2">
                        {slide.title || 'Untitled slide'}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveHeroSlide(slide.id, 'up')}
                        disabled={index === 0}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                      >
                        <FiChevronUp />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveHeroSlide(slide.id, 'down')}
                        disabled={index === heroCarouselSlides.length - 1}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                      >
                        <FiChevronDown />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveHeroSlide(slide.id)}
                        className="px-3 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_360px] gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                        <input
                          type="text"
                          value={slide.category}
                          onChange={(e) => handleHeroSlideChange(slide.id, 'category', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                          placeholder="Movement Update"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Button Label</label>
                        <input
                          type="text"
                          value={slide.buttonLabel}
                          onChange={(e) => handleHeroSlideChange(slide.id, 'buttonLabel', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                          placeholder="Read more"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => handleHeroSlideChange(slide.id, 'title', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                          placeholder="Featured headline"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Summary</label>
                        <textarea
                          rows={4}
                          value={slide.summary}
                          onChange={(e) => handleHeroSlideChange(slide.id, 'summary', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-sm resize-none"
                          placeholder="Short supporting summary for this news slide"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Link</label>
                        <input
                          type="text"
                          value={slide.link}
                          onChange={(e) => handleHeroSlideChange(slide.id, 'link', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                          placeholder="/blogs or https://..."
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4">
                        {slide.image ? (
                          <div className="space-y-3">
                            <PreviewImage
                              src={slide.image}
                              fallbackSrc={getFallbackHeroImage(index)}
                              alt={slide.title || `Slide ${index + 1}`}
                              className="w-full h-48 object-cover rounded-xl border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => handleHeroSlideChange(slide.id, 'image', '')}
                              className="w-full px-4 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50"
                            >
                              Remove image
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 py-8">
                            <FiImage size={36} className="mx-auto mb-3" />
                            <p className="text-sm font-medium">Upload slide image</p>
                            <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                          </div>
                        )}

                        <label className="mt-4 inline-flex w-full justify-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 cursor-pointer text-sm font-semibold">
                          <FiUpload className="mr-2 mt-0.5" />
                          Choose image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              handleHeroSlideImageChange(slide.id, e.target.files?.[0]);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        <p className="mt-3 text-xs text-gray-500">
                          Large images are automatically compressed before saving.
                        </p>
                      </div>

                      <div className="rounded-2xl overflow-hidden bg-[#0f2f2f] text-white min-h-[220px] relative">
                        <PreviewImage
                          src={slide.image}
                          fallbackSrc={getFallbackHeroImage(index)}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#082629]/90 via-[#082629]/76 to-[#082629]/40" />
                        <div className="relative z-10 p-5 flex h-full flex-col justify-end">
                          <span className="inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                            {slide.category || 'Latest News'}
                          </span>
                          <h4 className="mt-3 text-lg font-bold leading-snug">
                            {slide.title || 'Slide title preview'}
                          </h4>
                          <p className="mt-2 text-sm leading-6 text-white/80">
                            {slide.summary || 'Slide summary preview will appear here.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={handleSaveHeroCarousel}
                  disabled={heroSaving}
                  className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {heroSaving ? 'Saving...' : 'Save Hero Carousel'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- Main Dashboard ----
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gray-50 pt-20">
      <div className="flex min-h-0 w-full flex-1 flex-col px-[5px]">
        {renderDashboardTabs(true)}

        {/* Table */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-lg bg-white shadow-lg">
          {loading ? (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="min-h-0 flex-1 py-12 text-center">
              <FiFileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No {activeTab} yet</h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'volunteerApplications' ? 'No volunteer applications found.' : activeTab === 'donations' ? 'No donations recorded yet.' : 'Create your first item.'}
              </p>
              {!isSpecialTab && (
                <button onClick={handleAdd} className="btn-primary"><FiPlus className="inline mr-2" />Add New</button>
              )}
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-x-auto">
              <div className="flex h-full min-w-[900px] flex-col">
                <table className="w-full table-fixed border-b border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tableColumns[activeTab].map((column) => (
                      <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {column === 'createdAt' ? 'Date' : column.replace(/([A-Z])/g, ' $1').trim()}
                      </th>
                    ))}
                    {activeTab === 'donations' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screenshot</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </>
                    )}
                    {activeTab !== 'donations' && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                </table>
                <div className="admin-table-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <table className="w-full table-fixed">
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item, idx) => (
                    <tr key={item._id || item.id || idx} className="hover:bg-gray-50">
                      {tableColumns[activeTab].map((column) => (
                        <td
                          key={column}
                          className="max-w-0 truncate px-6 py-4 text-sm text-gray-900"
                          data-tooltip={typeof item[column] === 'string' ? item[column] : Array.isArray(item[column]) ? item[column].join(', ') : undefined}
                        >
                          {renderCell(column, item[column])}
                        </td>
                      ))}
                      {activeTab === 'donations' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {item.paymentScreenshot ? (
                            <button
                              type="button"
                              onClick={() => setScreenshotModal(item.paymentScreenshot)}
                              className="flex items-center gap-1 text-primary-600 hover:text-primary-800 text-xs font-medium"
                              data-tooltip="View screenshot"
                            >
                              <FiEye size={14} />
                              View
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                        </td>
                      )}
                      {activeTab === 'donations' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {item.paymentStatus === 'pending' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAcceptDonation(item)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-green-700 hover:bg-green-100 hover:text-green-900"
                                  data-tooltip="Approve donation"
                                  aria-label={`Approve donation from ${item.name || 'donor'}`}
                                >
                                  <FiCheckCircle size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectDonation(item)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-700 hover:bg-red-100 hover:text-red-900"
                                  data-tooltip="Reject donation"
                                  aria-label={`Reject donation from ${item.name || 'donor'}`}
                                >
                                  <FiXCircle size={16} />
                                </button>
                              </>
                            ) : (
                              <span
                                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                  item.paymentStatus === 'accepted'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-600'
                                }`}
                              >
                                {item.paymentStatus === 'accepted' ? <FiCheck size={12} /> : <FiX size={12} />}
                                {item.paymentStatus === 'accepted' ? 'Approved' : 'Rejected'}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {activeTab === 'volunteerApplications' ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openVolunteerModal(item, 'view')}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sky-700 hover:bg-sky-100"
                              data-tooltip="View volunteer details"
                              aria-label="View volunteer details"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteVolunteer(item)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-700 hover:bg-red-100"
                              data-tooltip="Delete volunteer"
                              aria-label="Delete volunteer"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        ) : activeTab === 'donations' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openDonationModal(item)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-blue-700 hover:bg-blue-100"
                              data-tooltip="Edit donation"
                              aria-label="Edit donation"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteDonation(item)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-700 hover:bg-red-100"
                              data-tooltip="Delete donation"
                              aria-label="Delete donation"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(item)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-100 hover:text-blue-900" data-tooltip="Edit" aria-label="Edit item"><FiEdit2 size={16} /></button>
                            <button onClick={() => handleDelete(item)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-100 hover:text-red-900" data-tooltip="Delete" aria-label="Delete item"><FiTrash2 size={16} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </div>
              </div>
            </div>
          )}
          <Pagination
            page={page}
            pageSize={pageSize}
            total={totalItems}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            disabled={loading}
            itemLabel="Rows"
          />
        </div>

        {showPopup && !isSpecialTab && (
          <ContentPopup
            type={popupType}
            item={selectedItem}
            onClose={() => { if (!saving) { setShowPopup(false); setSelectedItem(null); } }}
            onSave={handleSave}
          />
        )}

        {volunteerModalMode && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={closeVolunteerModal}
          >
            <div
              className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {volunteerModalMode === 'edit' ? 'Edit Volunteer Application' : 'View Volunteer Application'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedVolunteer?.fullName || 'Volunteer details'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeVolunteerModal}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="max-h-[calc(90vh-150px)] overflow-y-auto px-6 py-5">
                {volunteerModalLoading && !selectedVolunteer ? (
                  <div className="flex h-48 items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {selectedVolunteerFields.map((field) => {
                      const inputType = getVolunteerInputType(field, selectedVolunteer?.[field]);
                      const isFullWidth = inputType === 'textarea';
                      const label = VOLUNTEER_FIELD_LABELS[field] || field.replace(/([A-Z])/g, ' $1').trim();

                      return (
                        <div key={field} className={isFullWidth ? 'md:col-span-2' : ''}>
                          <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>

                          {volunteerModalMode === 'edit' && field !== 'createdAt' && field !== 'updatedAt' ? (
                            inputType === 'checkbox' ? (
                              <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={Boolean(volunteerFormData[field])}
                                  onChange={(e) => handleVolunteerFieldChange(field, e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300 text-primary-600"
                                />
                                <span>{label}</span>
                              </label>
                            ) : inputType === 'select' ? (
                              <select
                                value={volunteerFormData[field] || 'pending'}
                                onChange={(e) => handleVolunteerFieldChange(field, e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            ) : inputType === 'textarea' ? (
                              <textarea
                                rows={field === 'availability' || typeof selectedVolunteer?.[field] === 'object' ? 5 : 4}
                                value={volunteerFormData[field] || ''}
                                onChange={(e) => handleVolunteerFieldChange(field, e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
                              />
                            ) : (
                              <input
                                type={inputType}
                                value={volunteerFormData[field] || ''}
                                onChange={(e) => handleVolunteerFieldChange(field, e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
                              />
                            )
                          ) : (
                            <div className="min-h-[48px] rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap break-words">
                              {formatVolunteerFieldValue(selectedVolunteer?.[field], field)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {volunteerModalMode === 'view' && selectedVolunteer && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAcceptVolunteer(selectedVolunteer)}
                        disabled={volunteerModalLoading || selectedVolunteer.status === 'approved'}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FiCheck size={14} /> Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectVolunteer(selectedVolunteer)}
                        disabled={volunteerModalLoading || selectedVolunteer.status === 'rejected'}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FiX size={14} /> Reject
                      </button>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  {volunteerModalMode === 'view' ? (
                    <button
                      type="button"
                      onClick={() => setVolunteerModalMode('edit')}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <FiEdit2 size={14} /> Edit Details
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveVolunteerEdit}
                      disabled={volunteerModalLoading}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {volunteerModalLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeVolunteerModal}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {donationModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={closeDonationModal}
          >
            <div
              className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Edit Donation</h3>
                  <p className="mt-1 text-sm text-gray-500">{selectedDonation?.name || 'Donation record'}</p>
                </div>
                <button
                  type="button"
                  onClick={closeDonationModal}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="max-h-[calc(90vh-150px)] overflow-y-auto px-6 py-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {DONATION_EDIT_FIELDS.map((field) => (
                    <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          rows={4}
                          value={donationFormData[field.key] || ''}
                          onChange={(e) => handleDonationFieldChange(field.key, e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={donationFormData[field.key] || field.options?.[0] || ''}
                          onChange={(e) => handleDonationFieldChange(field.key, e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
                        >
                          {field.options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={donationFormData[field.key] || ''}
                          onChange={(e) => handleDonationFieldChange(field.key, e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeDonationModal}
                  className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDonationEdit}
                  disabled={donationModalLoading}
                  className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {donationModalLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Screenshot Modal */}
        {screenshotModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={() => setScreenshotModal(null)}
          >
            <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setScreenshotModal(null)}
                className="absolute -top-4 -right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 shadow-lg z-10"
              >
                <FiX size={18} />
              </button>
              <img src={screenshotModal} alt="Payment Screenshot" className="w-full max-h-[80vh] object-contain rounded-lg shadow-xl" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
