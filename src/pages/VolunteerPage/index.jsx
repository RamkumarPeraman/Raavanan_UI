import React, { useEffect, useRef, useState } from 'react';
import { FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import CommonPopup from '../../components/common/CommonPopup';
import Pagination from '../../components/common/Pagination';

const LINK_PATTERN = /(https?:\/\/[^\s]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

const createInitialFormData = () => ({
  fullName: '',
  email: '',
  address: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  education: '',
  educationOther: '',
  institution: '',
  occupation: '',
  occupationOther: '',
  hearAbout: [],
  hearAboutOther: '',
  motivation: '',
  previousVolunteer: '',
  capacity: [],
  capacityOther: '',
  skills: [],
  skillsOther: '',
  interests: [],
  selectedOpportunityId: '',
  selectedOpportunityTitle: '',
  corePurpose: '',
  newLaw: '',
  viewOnSociety: '',
  leadershipAction: '',
  dailyHabit: '',
  agreeConduct: false,
  agreeDeclaration: false,
});

const isBlank = (value) => !value || !value.toString().trim();

const getPageValidationMessage = (page, formData) => {
  if (page === 1) {
    if (isBlank(formData.fullName)) return 'Please enter your full name.';
    if (isBlank(formData.email)) return 'Please enter your email address.';
    if (isBlank(formData.address)) return 'Please enter your address.';
    if (isBlank(formData.phone)) return 'Please enter your phone number.';
    if (isBlank(formData.gender)) return 'Please select your gender.';
    if (isBlank(formData.dateOfBirth)) return 'Please select your date of birth.';
    if (isBlank(formData.education)) return 'Please select your educational qualification.';
    if (formData.education === 'Other' && isBlank(formData.educationOther)) return 'Please specify your educational qualification.';
    if (isBlank(formData.occupation)) return 'Please select your occupation.';
    if (formData.occupation === 'Other' && isBlank(formData.occupationOther)) return 'Please specify your occupation.';
  }

  if (page === 2) {
    if (!Array.isArray(formData.hearAbout) || formData.hearAbout.length === 0) return 'Please tell us how you heard about this drive.';
    if (formData.hearAbout.includes('Other') && isBlank(formData.hearAboutOther)) return 'Please specify how you heard about this drive.';
    if (isBlank(formData.motivation)) return 'Please tell us why you want to participate in this volunteer drive.';
    if (isBlank(formData.previousVolunteer)) return 'Please tell us about your previous volunteer activities.';
    if (!Array.isArray(formData.capacity) || formData.capacity.length === 0) return 'Please select how you would like to be involved.';
    if (formData.capacity.includes('Other') && isBlank(formData.capacityOther)) return 'Please specify how you would like to be involved.';
    if (!Array.isArray(formData.skills) || formData.skills.length === 0) return 'Please select at least one skill or area of interest.';
    if (formData.skills.includes('Other') && isBlank(formData.skillsOther)) return 'Please specify your other skill or area of interest.';
  }

  if (page === 3) {
    if (isBlank(formData.corePurpose)) return 'Please share the purpose that drives you every day.';
    if (isBlank(formData.newLaw)) return 'Please answer the question about the new law you would create.';
    if (isBlank(formData.viewOnSociety)) return 'Please share your point of view about today\'s society.';
    if (isBlank(formData.leadershipAction)) return 'Please tell us what action you would take as a leader.';
    if (isBlank(formData.dailyHabit)) return 'Please tell us the daily habit you believe can create change.';
  }

  if (page === 4 && (!formData.agreeConduct || !formData.agreeDeclaration)) {
    return 'Please agree to both declarations before submitting.';
  }

  return '';
};

const renderTextWithLinks = (text) => {
  if (!text) {
    return null;
  }

  const lines = text.toString().split(/\r?\n/);

  return lines.map((line, lineIndex) => {
    const parts = line.split(LINK_PATTERN);

    return (
      <React.Fragment key={`${line}-${lineIndex}`}>
        {parts.map((part, partIndex) => {
          if (!part) {
            return null;
          }

          const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(part);
          const isUrl = /^https?:\/\//i.test(part);

          if (!isEmail && !isUrl) {
            return <React.Fragment key={`${lineIndex}-${partIndex}`}>{part}</React.Fragment>;
          }

          const href = isEmail ? `mailto:${part}` : part;

          return (
            <a
              key={`${lineIndex}-${partIndex}`}
              href={href}
              target={isUrl ? '_blank' : undefined}
              rel={isUrl ? 'noopener noreferrer' : undefined}
              className="break-all text-blue-600 underline underline-offset-2 transition-colors hover:text-blue-700"
            >
              {part}
            </a>
          );
        })}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

const VolunteerPage = () => {
  const [activeTab, setActiveTab] = useState('apply');
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [opportunityPage, setOpportunityPage] = useState(1);
  const [opportunityPageSize, setOpportunityPageSize] = useState(5);
  const formSectionRef = useRef(null);
  const hasMounted = useRef(false);

  function scrollToFormTop() {
    if (!formSectionRef.current) return;
    formSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const [formPage, setFormPage] = useState(1);

  // Form state
  const [formData, setFormData] = useState(createInitialFormData);

  // Capacity options
  const capacityOptions = [
    'Planning & Organizing',
    'Execution & Outreach',
    'Content Development',
    'Support & Documentation',
    'Promotion & Awareness',
    'Any role as needed',
  ];

  // Skill options
  const skillOptions = [
    'Content Creation / Social Media',
    'Public Speaking / Communication',
    'Design / Art / Creativity',
    'Technical (IT / Software / Digital Tools)',
    'Event Planning / Coordination',
    'Writing (Articles, Posts, Scripts)',
    'Research / Knowledge Building',
    'Field Volunteering (Community visits, Awareness drives)',
    'Language & Cultural Promotion (Tamil identity, storytelling, sessions)',
    'Outreach & Networking (Connecting with schools, colleges, communities)',
    'Administrative / Documentation Support',
    'Mental Health & Peer Support',
    'Photography / Videography (For events, campaigns, documentation)',
    'Voice & Podcasting (For audio series, reflections, interviews)',
    'Training & Mentoring (If you wish to guide others in any skill or subject)',
    'Fundraising / Resource Mobilization',
    'Campus Ambassador / Regional Connector',
  ];

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        const data = await apiService.getVolunteerOpportunities();
        setOpportunities(data);
      } catch (error) {
        console.error('Error fetching volunteer opportunities:', error);
      }
    };

    loadOpportunities();
  }, []);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (activeTab !== 'apply') {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollToFormTop();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeTab, formPage]);

  // Testimonials
  const volunteerTestimonials = [
    {
      id: 1,
      name: 'Priya Krishnan',
      role: 'Education Volunteer',
      content: 'Volunteering as a tutor has been the most rewarding experience. Seeing the children smile and learn gives me immense satisfaction.',
      duration: '2 years',
      image: '/assets/testimonials/priya.jpg',
    },
    {
      id: 2,
      name: 'Arun Kumar',
      role: 'Healthcare Volunteer',
      content: 'Being part of the medical camps has opened my eyes to the healthcare needs of rural communities. Every weekend well spent!',
      duration: '1.5 years',
      image: '/assets/testimonials/arun.jpg',
    },
    {
      id: 3,
      name: 'Deepa Rajan',
      role: 'Women Empowerment Volunteer',
      content: 'Teaching women new skills and seeing them become financially independent is priceless. This organization does amazing work.',
      duration: '3 years',
      image: '/assets/testimonials/deepa.jpg',
    },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const arrayFields = ['hearAbout', 'capacity', 'skills', 'interests'];

    if (type === 'checkbox' && arrayFields.includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: (Array.isArray(prev[name]) ? prev[name] : []).includes(value)
          ? prev[name].filter(v => v !== value)
          : [...(Array.isArray(prev[name]) ? prev[name] : []), value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validatePage = (page) => {
    const message = getPageValidationMessage(page, formData);

    if (message) {
      toast.error(message);
      return false;
    }

    return true;
  };

  const handleNextPage = (nextPage) => {
    if (validatePage(formPage)) {
      setFormPage(nextPage);
    }
  };

  const handlePreviousPage = (previousPage) => {
    setFormPage(previousPage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let page = 1; page <= 4; page += 1) {
      const message = getPageValidationMessage(page, formData);
      if (message) {
        setFormPage(page);
        toast.error(message);
        return;
      }
    }

    setLoading(true);

    try {
      // Convert hearAbout array to string
      const submitData = { ...formData };
      if (Array.isArray(submitData.hearAbout)) {
        submitData.hearAbout = submitData.hearAbout.filter(Boolean).join(", ");
      }

      const response = await apiService.submitVolunteerApplication(submitData);

      if (response.success) {
        toast.success('Thank you for applying! We will contact you soon.');
        setFormData(createInitialFormData());
        setFormPage(1);
        setActiveTab('opportunities');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpportunityApply = (opportunity) => {
    setActiveTab('apply');
    setFormPage(1);
    setFormData(prev => ({
      ...prev,
      interests: Array.isArray(prev.interests) && prev.interests.includes(opportunity.category)
        ? prev.interests
        : [...(Array.isArray(prev.interests) ? prev.interests : []), opportunity.category],
      selectedOpportunityId: opportunity.id || '',
      selectedOpportunityTitle: opportunity.title || '',
    }));

    toast.info(`You're applying for: ${opportunity.title}`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f5f7f6]">
      <div className="flex h-full min-h-0 w-full flex-col px-[5px]">
        {/* Navigation Tabs */}
        <div className="z-20 mb-2 shrink-0 bg-[#f5f7f6]/95 py-3 backdrop-blur-sm">
        <div className="flex w-fit max-w-full gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === 'opportunities'
                ? 'bg-[#092b2d] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            Volunteer Opportunities
          </button>
          <button
            onClick={() => setActiveTab('apply')}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === 'apply'
                ? 'bg-[#092b2d] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            Apply as Volunteer
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === 'testimonials'
                ? 'bg-[#092b2d] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            Volunteer Stories
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === 'faq'
                ? 'bg-[#092b2d] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            FAQs
          </button>
        </div>
        </div>

        <div className={activeTab === 'opportunities' ? 'min-h-0 flex-1' : 'min-h-0 flex-1 overflow-y-auto overscroll-contain pb-10'}>
        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <section aria-label="Volunteer opportunities" className="flex h-full min-h-0 flex-col overflow-hidden rounded-t-xl border border-gray-200 bg-white shadow-sm">
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[820px] table-fixed text-sm">
                <colgroup><col className="w-[29%]" /><col className="w-[18%]" /><col className="w-[16%]" /><col className="w-[17%]" /><col className="w-[9%]" /><col className="w-[11%]" /></colgroup>
                <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500"><tr>
                  <th scope="col" className="px-4 py-3 font-medium">Opportunity</th>
                  <th scope="col" className="px-4 py-3 font-medium">Category</th>
                  <th scope="col" className="px-4 py-3 font-medium">Location</th>
                  <th scope="col" className="px-4 py-3 font-medium">Commitment</th>
                  <th scope="col" className="px-4 py-3 font-medium">Spots</th>
                  <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {opportunities.slice((opportunityPage - 1) * opportunityPageSize, opportunityPage * opportunityPageSize).map((opp) => (
                    <tr key={opp.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 align-top font-semibold text-gray-900">{opp.title}</td>
                      <td className="break-words px-4 py-3 align-top text-gray-600">{opp.category || '—'}</td>
                      <td className="break-words px-4 py-3 align-top text-gray-600">{opp.location || '—'}</td>
                      <td className="break-words px-4 py-3 align-top text-gray-600">{opp.commitment || '—'}</td>
                      <td className="px-4 py-3 align-top"><span className="rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">{opp.spots ?? '—'}</span></td>
                      <td className="px-4 py-3 align-top"><div className="flex flex-col items-start gap-1"><button type="button" onClick={() => setSelectedOpportunity(opp)} className="rounded px-2 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-50">View</button><button type="button" onClick={() => handleOpportunityApply(opp)} className="rounded bg-primary-700 px-2 py-1 text-xs font-semibold text-white hover:bg-primary-800">Apply</button></div></td>
                    </tr>
                  ))}
                  {opportunities.length === 0 && <tr><td colSpan={6} className="px-4 py-14 text-center text-sm text-gray-500">No opportunities available right now.</td></tr>}
                </tbody>
              </table>
            </div>
            <Pagination page={opportunityPage} pageSize={opportunityPageSize} total={opportunities.length} onPageChange={setOpportunityPage} onPageSizeChange={size => { setOpportunityPageSize(size); setOpportunityPage(1); }} itemLabel="Opportunities" />
          </section>
        )}

        {/* Application Form Tab */}
        {activeTab === 'apply' && (
          <div ref={formSectionRef} className="mx-auto max-w-5xl scroll-mt-24">
            <h2 className="mb-1 text-xl font-bold text-gray-900">Volunteer application</h2>
            <p className="mb-4 text-sm text-gray-500">Complete the four steps below. Fields marked * are required.</p>
            {formData.selectedOpportunityTitle && (
              <p className="mb-4 text-sm text-primary-700">
                Applying for: <span className="font-semibold">{formData.selectedOpportunityTitle}</span>
              </p>
            )}
            {/* Progress indicator */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${formPage >= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {step}
                  </div>
                  {step < 4 && <div className={`w-8 h-0.5 ${formPage > step ? 'bg-primary-600' : 'bg-gray-200'}`} />}
                </div>
              ))}
              <span className="ml-3 text-sm text-gray-500">
                {formPage === 1 && 'Personal Information'}
                {formPage === 2 && 'Interests & Motivation'}
                {formPage === 3 && 'Your Journey'}
                {formPage === 4 && 'Declaration'}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">

              {/* PAGE 1 — Personal Information */}
              {formPage === 1 && (
                <div>
                  <h3 className="mb-4 flex items-center text-base font-semibold">
                    <FiUser className="mr-2 text-primary-600" />
                    Personal Information
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Please add +91) *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="+91" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                      <div className="flex flex-wrap gap-4">
                        {['Male', 'Female', 'Prefer not to say'].map((g) => (
                          <label key={g} className="flex items-center space-x-2">
                            <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleInputChange} className="w-4 h-4 text-primary-600" />
                            <span className="text-sm text-gray-700">{g}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                      <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Educational Qualification *</label>
                      <div className="flex flex-wrap gap-4">
                        {['Diploma', 'Undergraduate', 'Postgraduate', 'Doctorate'].map((q) => (
                          <label key={q} className="flex items-center space-x-2">
                            <input type="radio" name="education" value={q} checked={formData.education === q} onChange={handleInputChange} className="w-4 h-4 text-primary-600" />
                            <span className="text-sm text-gray-700">{q}</span>
                          </label>
                        ))}
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="education" value="Other" checked={formData.education === 'Other'} onChange={handleInputChange} className="w-4 h-4 text-primary-600" />
                          <span className="text-sm text-gray-700">Other:</span>
                          <input type="text" name="educationOther" value={formData.educationOther} onChange={handleInputChange} disabled={formData.education !== 'Other'} className="w-36 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none" />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name of Institution / College</label>
                      <input type="text" name="institution" value={formData.institution} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Occupation *</label>
                      <div className="flex flex-wrap gap-4">
                        {['Student', 'Working Professional', 'Entrepreneur'].map((o) => (
                          <label key={o} className="flex items-center space-x-2">
                            <input type="radio" name="occupation" value={o} checked={formData.occupation === o} onChange={handleInputChange} className="w-4 h-4 text-primary-600" />
                            <span className="text-sm text-gray-700">{o}</span>
                          </label>
                        ))}
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="occupation" value="Other" checked={formData.occupation === 'Other'} onChange={handleInputChange} className="w-4 h-4 text-primary-600" />
                          <span className="text-sm text-gray-700">Other:</span>
                          <input type="text" name="occupationOther" value={formData.occupationOther} onChange={handleInputChange} disabled={formData.occupation !== 'Other'} className="w-36 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none" />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 gap-3">
                    <button type="button" onClick={() => handleNextPage(2)} className="btn-primary px-8">Next</button>
                  </div>
                </div>
              )}

              {/* PAGE 2 — Interests & Motivation */}
              {formPage === 2 && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Interests & Motivation</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">How did you hear about this drive? *</label>
                      <div className="flex flex-wrap gap-4">
                        {['Social Media', 'Friends / Word of Mouth', 'NGO Member'].map((opt) => (
                          <label key={opt} className="flex items-center space-x-2">
                            <input type="checkbox" name="hearAbout" value={opt} checked={formData.hearAbout.includes(opt)} onChange={handleInputChange} className="w-4 h-4 text-primary-600 border-gray-300 rounded" />
                            <span className="text-sm text-gray-700">{opt}</span>
                          </label>
                        ))}
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" name="hearAbout" value="Other" checked={formData.hearAbout.includes('Other')} onChange={handleInputChange} className="w-4 h-4 text-primary-600 border-gray-300 rounded" />
                          <span className="text-sm text-gray-700">Other:</span>
                          <input type="text" name="hearAboutOther" value={formData.hearAboutOther} onChange={handleInputChange} disabled={!formData.hearAbout.includes('Other')} className="w-36 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none" />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to participate in this Volunteer Drive? *</label>
                      <textarea name="motivation" value={formData.motivation} onChange={handleInputChange} required rows="3" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Have you previously participated in any volunteer activities? Say about that. *</label>
                      <textarea name="previousVolunteer" value={formData.previousVolunteer} onChange={handleInputChange} required rows="3" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">In what capacity would you like to be involved? (You may select more than one) *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {capacityOptions.map((opt) => (
                          <label key={opt} className="flex items-center space-x-2">
                            <input type="checkbox" name="capacity" value={opt} checked={formData.capacity.includes(opt)} onChange={handleInputChange} className="w-4 h-4 text-primary-600 border-gray-300 rounded" />
                            <span className="text-sm text-gray-700">{opt}</span>
                          </label>
                        ))}
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" name="capacity" value="Other" checked={formData.capacity.includes('Other')} onChange={handleInputChange} className="w-4 h-4 text-primary-600 border-gray-300 rounded" />
                          <span className="text-sm text-gray-700">Other:</span>
                          <input type="text" name="capacityOther" value={formData.capacityOther} onChange={handleInputChange} disabled={!formData.capacity.includes('Other')} className="w-36 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none" />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">What are your key skills or areas of interest? (You may select more than one) *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {skillOptions.map((skill) => (
                          <label key={skill} className="flex items-center space-x-2">
                            <input type="checkbox" name="skills" value={skill} checked={formData.skills.includes(skill)} onChange={handleInputChange} className="w-4 h-4 text-primary-600 border-gray-300 rounded" />
                            <span className="text-sm text-gray-700">{skill}</span>
                          </label>
                        ))}
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" name="skills" value="Other" checked={formData.skills.includes('Other')} onChange={handleInputChange} className="w-4 h-4 text-primary-600 border-gray-300 rounded" />
                          <span className="text-sm text-gray-700">Other:</span>
                          <input type="text" name="skillsOther" value={formData.skillsOther} onChange={handleInputChange} disabled={!formData.skills.includes('Other')} className="w-36 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none" />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <button type="button" onClick={() => handlePreviousPage(1)} className="btn-secondary px-8">Previous</button>
                    <button type="button" onClick={() => handleNextPage(3)} className="btn-primary px-8">Next</button>
                  </div>
                </div>
              )}

              {/* PAGE 3 — Your Journey */}
              {formPage === 3 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Journey</h3>
                  <p className="text-sm text-gray-500 mb-6 italic">To understand your journey, your fire, and your role in service</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">In one powerful line, tell us the purpose that drives you every day? *</label>
                      <textarea name="corePurpose" value={formData.corePurpose} onChange={handleInputChange} required rows="2" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">If you had the power to create one new law for India — one that doesn't exist yet — what law would you bring, and why? *</label>
                      <textarea name="newLaw" value={formData.newLaw} onChange={handleInputChange} required rows="3" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">What is your point of view about today's society around you? *</label>
                      <textarea name="viewOnSociety" value={formData.viewOnSociety} onChange={handleInputChange} required rows="3" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">If you were chosen as a leader, what is the action you would take to create a change? *</label>
                      <textarea name="leadershipAction" value={formData.leadershipAction} onChange={handleInputChange} required rows="3" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">What is one tiny daily habit that you believe can create a massive change in society if everyone practices it? *</label>
                      <textarea name="dailyHabit" value={formData.dailyHabit} onChange={handleInputChange} required rows="3" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"></textarea>
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <button type="button" onClick={() => handlePreviousPage(2)} className="btn-secondary px-8">Previous</button>
                    <button type="button" onClick={() => handleNextPage(4)} className="btn-primary px-8">Next</button>
                  </div>
                </div>
              )}

              {/* PAGE 4 — Declaration */}
              {formPage === 4 && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Declaration</h3>
                  <div className="space-y-4">
                    <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                      <input type="checkbox" name="agreeConduct" checked={formData.agreeConduct} onChange={handleInputChange} className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1" />
                      <span className="text-sm text-gray-700">
                        I agree to abide by the code of conduct and guidelines by the Raavana Thalaigal Trust Trust. I consent to the Trust using my contact details for communication related to this drive. <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                      <input type="checkbox" name="agreeDeclaration" checked={formData.agreeDeclaration} onChange={handleInputChange} className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1" />
                      <span className="text-sm text-gray-700">
                        I understand that participation in this online drive is voluntary and without remuneration. I hereby declare that the information provided above is true and correct to the best of my knowledge. <span className="text-red-500">*</span>
                      </span>
                    </label>
                  </div>
                  <div className="flex justify-between mt-6">
                    <button type="button" onClick={() => handlePreviousPage(3)} className="btn-secondary px-8">Previous</button>
                    <button type="submit" disabled={loading || !formData.agreeConduct || !formData.agreeDeclaration} className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Volunteer Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {volunteerTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-bold text-lg">{testimonial.name}</h3>
                      <p className="text-primary-600 text-sm">{testimonial.role}</p>
                      <p className="text-gray-500 text-xs">{testimonial.duration} with us</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.content}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "What is the minimum time commitment?",
                  a: "We ask for a minimum commitment of 3 months, with at least 2-4 hours per week. However, some event-based opportunities may have different requirements."
                },
                {
                  q: "Do I need any specific qualifications?",
                  a: "While some roles may require specific skills, many opportunities are open to everyone. We provide training for most volunteer positions."
                },
                {
                  q: "Is there an age limit to volunteer?",
                  a: "Volunteers must be 18 or older. However, we have special programs for students aged 16-17 with parental consent."
                },
                {
                  q: "Will I get a certificate?",
                  a: "Yes, we provide certificates of appreciation for all volunteers. For long-term volunteers, we also provide detailed reference letters."
                },
                {
                  q: "Can I volunteer remotely?",
                  a: "Yes, we have several remote volunteering opportunities including content writing, social media management, and online tutoring."
                },
                {
                  q: "How soon can I start after applying?",
                  a: "After submitting your application, we'll contact you within 3-5 business days for an interview and orientation."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="font-semibold text-lg mb-2 text-primary-600">{faq.q}</h3>
                  <p className="text-gray-700">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
      <CommonPopup open={Boolean(selectedOpportunity)} title={selectedOpportunity?.title || 'Opportunity details'} onClose={() => setSelectedOpportunity(null)} size="lg" footer={<div className="flex justify-end gap-2"><button type="button" onClick={() => setSelectedOpportunity(null)} className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Close</button><button type="button" onClick={() => { const opportunity = selectedOpportunity; setSelectedOpportunity(null); handleOpportunityApply(opportunity); }} className="rounded bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800">Apply for this role</button></div>}>
        {selectedOpportunity && <div className="space-y-5 text-sm text-gray-700">
          <div className="grid gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-2"><p><span className="block text-gray-500">Category</span><strong>{selectedOpportunity.category || '—'}</strong></p><p><span className="block text-gray-500">Location</span><strong>{selectedOpportunity.location || '—'}</strong></p><p><span className="block text-gray-500">Commitment</span><strong>{selectedOpportunity.commitment || '—'}</strong></p><p><span className="block text-gray-500">Available spots</span><strong>{selectedOpportunity.spots ?? '—'}</strong></p></div>
          <div><h3 className="mb-1 font-semibold text-gray-900">About the role</h3><p className="whitespace-pre-wrap leading-6">{renderTextWithLinks(selectedOpportunity.description)}</p></div>
          {selectedOpportunity.requirements?.length > 0 && <div><h3 className="mb-2 font-semibold text-gray-900">Requirements</h3><ul className="list-disc space-y-1 pl-5">{selectedOpportunity.requirements.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
        </div>}
      </CommonPopup>
    </div>
  );
};

export default VolunteerPage;
