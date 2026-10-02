import React, { useState } from 'react';
import { 
  FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiUser,
  FiMessageSquare, FiFacebook,
  FiInstagram, FiLinkedin, FiYoutube, FiHeart, FiMessageCircle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../../services/api';

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

  const [faqOpen, setFaqOpen] = useState({});

  const contactDetails = {
    addressLine1: '212, 1st Floor, Ramalingam Road East',
    addressLine2: 'R.S. Puram, Coimbatore - 641002',
    addressLine3: 'Tamil Nadu, India',
    phone: '+91 94878 14418',
    email: 'enquiry.raavanathalaigal@gmail.com'
  };

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

  // FAQs
  const faqs = [
    {
      question: 'How can I donate to Raavana Thalaigal Trust?',
      answer: 'You can donate online through our website via credit card, debit card, UPI, or net banking. You can also send a cheque or demand draft to our Chennai headquarters. All donations are eligible for tax exemption under Section 80G of the Income Tax Act.'
    },
    {
      question: 'How do I volunteer with your organization?',
      answer: 'Visit our Volunteer page and fill out the application form. Our volunteer coordinator will contact you within 3-5 business days to discuss opportunities that match your skills and interests. We also conduct regular orientation sessions for new volunteers.'
    },
    {
      question: 'Can I donate to a specific project?',
      answer: 'Yes, you can choose to donate to specific projects like Education, Healthcare, Women Empowerment, or Environment. Our donation form allows you to allocate your contribution to the project of your choice.'
    },
    {
      question: 'How is my donation used?',
      answer: 'We maintain complete transparency in fund utilization. 85% of donations go directly to program activities, 10% to administrative costs, and 5% to fundraising. You can view our detailed financial reports in the Reports section.'
    },
    {
      question: 'Do you provide certificates for donations?',
      answer: 'Yes, we provide 80G certificates for all donations above ₹500. The certificate will be sent to your email within 7 working days of the donation.'
    },
    {
      question: 'How can I partner with your organization?',
      answer: 'We welcome corporate partnerships, CSR collaborations, and institutional funding. Please contact our partnerships team at partnerships@raavanathalaigal.org with your proposal.'
    },
    {
      question: 'Can I visit your project sites?',
      answer: 'Yes, we organize site visits for donors and partners. Please contact us to schedule a visit. We recommend giving at least two weeks notice for arrangements.'
    },
    {
      question: 'How do I update my donor information?',
      answer: 'You can update your information by logging into your account on our website or by contacting our donor support team at donate@raavanathalaigal.org.'
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

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
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
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMapPin className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
            <p className="text-gray-600 text-sm">
              {contactDetails.addressLine1}<br />
              {contactDetails.addressLine2}<br />
              {contactDetails.addressLine3}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPhone className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Call Us</h3>
            <p className="text-gray-600 text-sm">
              {contactDetails.phone}<br />
              Secretariat Office<br />
              Mon-Fri, 9am-6pm
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Email Us</h3>
            <p className="text-gray-600 text-sm">
              {contactDetails.email}<br />
              Official Enquiries<br />
              Reply during office hours
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiClock className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Office Hours</h3>
            <p className="text-gray-600 text-sm">
              Monday - Friday<br />
              9:00 AM - 6:00 PM<br />
              Saturday: 10am-2pm
            </p>
          </div>
        </div>

        {/* Main Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="What's this about?"
                      />
                  </div>
                </div>

                {/* Inquiry Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inquiry Type
                  </label>
                  <select
                    name="inquiryType"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMessageSquare className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      name="message"
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
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
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
            {/* Emergency Contact */}
            <div className="bg-primary-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FiHeart className="mr-2" />
                Emergency Contact
              </h3>
              <p className="mb-4">
                For urgent matters requiring immediate attention:
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FiPhone className="mr-3" />
                  <a href={`tel:${contactDetails.phone.replace(/\s+/g, '')}`} className="hover:underline">
                    Mobile: {contactDetails.phone}
                  </a>
                </div>
                <div className="flex items-center">
                  <FiMail className="mr-3" />
                  <a href={`mailto:${contactDetails.email}`} className="break-all hover:underline">
                    {contactDetails.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-lg p-6">
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

        {/* Map Placeholder */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Find Us</h2>
            <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FiMapPin className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600">Interactive Map Integration</p>
                <p className="text-sm text-gray-500">Google Maps will be integrated here</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow mb-4 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      faqOpen[index] ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {faqOpen[index] && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="mb-6">
              Subscribe to our newsletter to receive updates about our projects, events, and impact stories.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="text-sm text-primary-100 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
