const resolveApiBaseURL = () => {
  const apiURL = import.meta.env.VITE_API_URL?.trim();
  if (!apiURL) {
    throw new Error('VITE_API_URL is missing. Set it in the environment file for the current Vite mode.');
  }

  return apiURL.replace(/\/+$/, '');
};

// API Configuration
const config = {
  api: {
    baseURL: resolveApiBaseURL(),
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    // API Endpoints
    endpoints: {
      // Donation endpoints
      donations: {
        create: '/donations',
        getAll: '/donations',
        getById: (id) => `/donations/${id}`,
        getStats: '/donations/stats',
        updateStatus: (id) => `/donations/${id}`,
      },
      // Service request endpoints
      services: {
        create: '/services',
        getAll: '/services',
        getById: (id) => `/services/${id}`,
        updateStatus: (id) => `/services/${id}`,
      },
      // Volunteer endpoints
      volunteers: {
        register: '/volunteers/register',
        login: '/volunteers/login',
        getAll: '/volunteers',
        getById: (id) => `/volunteers/${id}`,
        updateStatus: (id) => `/volunteers/${id}/status`,
      },
      // Contact endpoints
      contact: {
        submit: '/contact',
      },
      // Event endpoints
      events: {
        getAll: '/events',
        getById: (id) => `/events/${id}`,
        create: '/events',
      },
      // Blog endpoints
      blogs: {
        getAll: '/blogs',
        getById: (id) => `/blogs/${id}`,
        create: '/blogs',
      },
    },
  },

  // Feature flags for phased implementation
  features: {
    phase1: {
      donation: true,
      volunteer: true,
      blogs: true,
      contact: true,
      services: true,
    },
    phase2: {
      membership: false,
      proposals: false,
      reviews: false,
      mailing: false,
      events: true,
    },
    phase3: {
      community: false,
      grievance: false,
      advancedReports: false,
      paymentGateway: false,
    },
  },

  // Payment configuration
  payment: {
    razorpayKey: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_mock_key',
    currency: 'INR',
    methods: ['card', 'upi', 'netbanking'],
    donationAmounts: {
      oneTime: [500, 1000, 2500, 5000, 10000],
      monthly: [500, 1000, 2500, 5000],
      minAmount: 100,
      maxAmount: 100000,
    },
  },

  // Donation types
  donationTypes: {
    oneTime: {
      id: 'one-time',
      label: 'One-Time Donation',
      description: 'Make a single donation',
    },
    monthly: {
      id: 'monthly',
      label: 'Monthly Donation',
      description: 'Support us every month',
      percentageRange: { min: 1, max: 5 },
    },
  },

  // Donation purposes
  donationPurposes: [
    { value: 'general', label: 'General Fund', description: 'Support overall operations' },
    { value: 'education', label: 'Education', description: 'Support educational programs' },
    { value: 'healthcare', label: 'Healthcare', description: 'Support healthcare initiatives' },
    { value: 'disaster', label: 'Disaster Relief', description: 'Emergency relief efforts' },
    { value: 'community', label: 'Community Development', description: 'Community projects' },
  ],

  // Service types
  serviceTypes: [
    { value: 'education', label: 'Education Support', icon: '📚' },
    { value: 'healthcare', label: 'Healthcare Assistance', icon: '🏥' },
    { value: 'food', label: 'Food Distribution', icon: '🍲' },
    { value: 'shelter', label: 'Shelter Support', icon: '🏠' },
    { value: 'other', label: 'Other Services', icon: '🤝' },
  ],

  // Volunteer roles and skills
  volunteerRoles: {
    skills: [
      'Teaching', 'Cooking', 'Medical', 'Counseling', 'Administration',
      'Fundraising', 'Event Management', 'Social Media', 'Photography',
      'Content Writing', 'Translation', 'Driving', 'Construction'
    ],
    interests: [
      'Education', 'Healthcare', 'Environment', 'Women Empowerment',
      'Child Welfare', 'Elderly Care', 'Disaster Relief', 'Animal Welfare'
    ],
    availability: [
      { value: 'weekdays', label: 'Weekdays (Monday-Friday)' },
      { value: 'weekends', label: 'Weekends (Saturday-Sunday)' },
      { value: 'both', label: 'Both Weekdays and Weekends' },
      { value: 'flexible', label: 'Flexible Schedule' },
    ],
  },

  // Social media links
  socialMedia: {
    facebook: 'https://www.facebook.com/share/1C4Tkx3Ndy/',
    whatsapp: 'https://whatsapp.com/channel/0029Vb5NAAlGufIwYVr3CZ0r',
    instagram: 'https://www.instagram.com/raavanathalaigalofficial?igsh=MTRtaXF6bnBxMHpzag==',
    linkedin: 'https://shorturl.at/wx7aw',
    youtube: 'http://www.youtube.com/@Raavanathalaigal',
  },

  // Navigation items
  navigation: {
    main: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
      { name: 'Projects', path: '/projects' },
      { name: 'Blogs', path: '/blogs' },
      { name: 'Events', path: '/events' },
      { name: 'Volunteer', path: '/volunteer' },
      { name: 'Donate', path: '/donate' },
      { name: 'Contact', path: '/contact' },
    ],
    footer: {
      quickLinks: [
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Careers', path: '/careers' },
      ],
      resources: [
        { name: 'Annual Reports', path: '/reports' },
        { name: 'Publications', path: '/publications' },
        { name: 'Media Kit', path: '/media-kit' },
      ],
    },
  },

  // Announcement banner
  announcement: {
    show: false,
    message: "Help us reach our goal of educating 1000 children this year!",
    cta: "Donate Now",
    ctaLink: "/donate",
  },

  // Impact metrics (will be fetched from API)
  impactMetrics: {
    lives: 2000,
    volunteers: 200,
    projects: 25,
    states: 10,
  },

  // Form validation rules
  validation: {
    donation: {
      name: { min: 2, max: 100, required: true },
      email: { pattern: /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/, required: true },
      phone: { pattern: /^[0-9]{10}$/, required: true },
      amount: { min: 100, max: 100000, required: true },
    },
    service: {
      name: { min: 2, max: 100, required: true },
      email: { pattern: /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/, required: true },
      phone: { pattern: /^[0-9]{10}$/, required: true },
      message: { min: 10, max: 500, required: true },
    },
    volunteer: {
      name: { min: 2, max: 100, required: true },
      email: { pattern: /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/, required: true },
      phone: { pattern: /^[0-9]{10}$/, required: true },
      password: { min: 6, required: true },
    },
  },

  // Error messages
  errorMessages: {
    networkError: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.',
    validationError: 'Please check the form for errors.',
    notFound: 'Resource not found.',
    unauthorized: 'You are not authorized to perform this action.',
    donationFailed: 'Donation processing failed. Please try again.',
  },

  // Success messages
  successMessages: {
    donation: 'Thank you for your donation!',
    monthlyDonation: 'Thank you for becoming a monthly donor!',
    serviceRequest: 'Service request submitted successfully!',
    volunteerRegistration: 'Volunteer registration submitted successfully!',
    contact: 'Message sent successfully! We will get back to you soon.',
  },
};

// API Service Class
export class ApiService {
  constructor() {
    this.baseURL = config.api.baseURL;
    this.endpoints = config.api.endpoints;
    this.timeout = config.api.timeout;
  }

  // Helper function to handle API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...config.api.headers,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || config.errorMessages.serverError);
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Donation APIs
  async createDonation(donationData) {
    return this.request(this.endpoints.donations.create, {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  async getDonations() {
    return this.request(this.endpoints.donations.getAll);
  }

  async getDonationById(id) {
    return this.request(this.endpoints.donations.getById(id));
  }

  async getDonationStats() {
    return this.request(this.endpoints.donations.getStats);
  }

  async updateDonationStatus(id, status) {
    return this.request(this.endpoints.donations.updateStatus(id), {
      method: 'PUT',
      body: JSON.stringify({ paymentStatus: status }),
    });
  }

  // Service APIs
  async createService(serviceData) {
    return this.request(this.endpoints.services.create, {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async getServices() {
    return this.request(this.endpoints.services.getAll);
  }

  async getServiceById(id) {
    return this.request(this.endpoints.services.getById(id));
  }

  async updateServiceStatus(id, status) {
    return this.request(this.endpoints.services.updateStatus(id), {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Volunteer APIs
  async registerVolunteer(volunteerData) {
    return this.request(this.endpoints.volunteers.register, {
      method: 'POST',
      body: JSON.stringify(volunteerData),
    });
  }

  async loginVolunteer(credentials) {
    return this.request(this.endpoints.volunteers.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getVolunteers() {
    return this.request(this.endpoints.volunteers.getAll);
  }

  async getVolunteerById(id) {
    return this.request(this.endpoints.volunteers.getById(id));
  }

  // Contact API
  async submitContact(contactData) {
    return this.request(this.endpoints.contact.submit, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  // Helper method to format donation amount
  formatAmount(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // Helper method to get donation purpose label
  getPurposeLabel(purpose) {
    const found = config.donationPurposes.find(p => p.value === purpose);
    return found ? found.label : purpose;
  }
}

// Create and export API instance
export const api = new ApiService();

export default config;

