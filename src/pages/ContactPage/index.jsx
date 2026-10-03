import CommonLoader from '../../components/common/CommonLoader';
import React, { useState } from 'react';
import { 
  FiMapPin, FiPhone, FiMail, FiSend, FiUser,
  FiMessageSquare, FiFacebook,
  FiInstagram, FiLinkedin, FiYoutube, FiMessageCircle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import office from '../../config/office';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general',
    preferredContact: 'email',
    consent: false
  });

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/share/1C4Tkx3Ndy/',
      className: 'bg-blue-600 hover:bg-blue-700',
      icon: FiFacebook
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/raavanathalaigalofficial?igsh=MTRtaXF6bnBxMHpzag==',
      className: 'bg-pink-600 hover:bg-pink-700',
      icon: FiInstagram
    },
    {
      name: 'LinkedIn',
      href: 'https://shorturl.at/wx7aw',
      className: 'bg-blue-700 hover:bg-blue-800',
      icon: FiLinkedin
    },
    {
      name: 'YouTube',
      href: 'http://www.youtube.com/@Raavanathalaigal',
      className: 'bg-red-600 hover:bg-red-700',
      icon: FiYoutube
    },
    {
      name: 'WhatsApp Channel',
      href: 'https://whatsapp.com/channel/0029Vb5NAAlGufIwYVr3CZ0r',
      className: 'bg-green-600 hover:bg-green-700',
      icon: FiMessageCircle
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.consent) {
      toast.error('Please consent to data processing');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.submitContactForm(formData);
      
      if (!response?.success) throw new Error('Message not accepted');
      if (response.success) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          inquiryType: 'general',
          preferredContact: 'email',
          consent: false
        });
      }
    } catch {
      toast.error('Message could not be sent. Please try again, or contact us by phone or email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-10 min-h-screen bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-sm text-gray-600">
            Get in touch about volunteering, donations, partnerships, or our work.
          </p>
        </div>

        <section aria-label="Office contact details" className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold"><FiMapPin className="text-primary-600" />NGO Office</h2>
            <address className="mt-3 text-sm leading-6 not-italic text-gray-600">{office.address}</address>
            <a href={office.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-primary-700 hover:underline">Get directions</a>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold"><FiPhone className="text-primary-600" />Call Us</h2>
            <a href={office.phoneUrl} className="mt-3 block text-sm text-primary-700 hover:underline">{office.phone}</a>
            <p className="mt-2 text-sm text-gray-500">Please call ahead to confirm availability before visiting.</p>
          </div>
          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold"><FiMail className="text-primary-600" />Email Us</h2>
            <a href={'mailto:' + office.email} className="mt-3 block break-all text-sm text-primary-700 hover:underline">{office.email}</a>
            <p className="mt-2 text-sm text-gray-500">For inquiries, volunteering, and partnerships.</p>
          </div>
        </section>
        {/* Main Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <h2 className="text-xl font-semibold mb-5">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        id="contact-name" name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        id="contact-email" name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Phone and Subject Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel" required={formData.preferredContact === "phone"}
                        id="contact-phone" name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                        type="text"
                        id="contact-subject" name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="What's this about?"
                      />
                  </div>
                </div>

                {/* Inquiry Type */}
                <div>
                  <label htmlFor="contact-inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                    Inquiry Type
                  </label>
                  <select
                    id="contact-inquiryType" name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="donation">Donation Related</option>
                    <option value="volunteer">Volunteer Opportunities</option>
                    <option value="partnership">Partnership Proposal</option>
                    <option value="media">Media & Press</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="complaint">Report an Issue</option>
                  </select>
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === 'email'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-gray-700">Email</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="phone"
                        checked={formData.preferredContact === 'phone'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-gray-700">Phone</span>
                    </label>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMessageSquare className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      id="contact-message" name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="6"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Write your message here..."
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Consent */}
                <div>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                      required
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      I consent to having this website store my submitted information so they can respond to my inquiry. 
                      Your data will be processed in accordance with our privacy policy.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <CommonLoader size="sm" label="Submitting…" className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend className="mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="p-5"><h2 className="text-lg font-semibold">Find Our Office</h2><p className="mt-2 text-sm text-gray-500">Raavana Thalaigal Trust · Ganapathy, Coimbatore</p></div>
              <iframe title="Raavana Thalaigal Trust office location" src={office.embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="h-80 w-full border-0" />
              <a href={office.mapsUrl} target="_blank" rel="noopener noreferrer" className="block border-t border-gray-200 p-4 text-center text-sm font-semibold text-primary-700 hover:bg-primary-50">Open in Google Maps</a>
            </section>
            {/* Social Media */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="grid grid-cols-3 gap-3">
                {socialLinks.map(({ name, href, className, icon: Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={name}
                    data-tooltip={name}
                    className={`${className} text-white p-3 rounded-lg text-center transition-colors`}
                  >
                    <Icon className="w-6 h-6 mx-auto" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default ContactPage;
