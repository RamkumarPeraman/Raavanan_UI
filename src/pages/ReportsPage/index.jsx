import React, { useEffect, useMemo, useState } from 'react';
import {
  FiDownload, FiEye, FiCalendar, FiFileText, FiBarChart2,
  FiSearch, FiChevronLeft, FiChevronRight,
  FiAward, FiHeart, FiDollarSign, FiCheckCircle, FiStar
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReportPopup from '../../components/common/ReportPopup';
import apiService from '../../services/api';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  
  const reportsPerPage = 9;

  // Report types
  const reportTypes = [
    'All',
    'Annual Report',
    'Quarterly Report',
    'Impact Report',
    'Financial Report',
    'Project Report',
    'Field Visit Report',
    'Sustainability Report'
  ];

  // Years
  const years = ['All', '2024', '2023', '2022', '2021', '2020'];

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, selectedYear, selectedType, activeTab]);

  const loadReports = () => {
    // Mock reports data
    const mockReports = [
      {
        id: 1,
        title: 'Annual Report 2023-24',
        type: 'annual',
        category: 'Annual Report',
        year: '2024',
        period: 'FY 2023-24',
        publishedDate: '2024-03-15',
        description: 'Comprehensive annual report covering all activities, achievements, and financials for the fiscal year 2023-24.',
        summary: 'This report highlights our major achievements including reaching 10,000+ beneficiaries, launching 5 new projects, and maintaining financial transparency.',
        fileSize: '5.2 MB',
        pages: 48,
        downloads: 1234,
        views: 3456,
        featured: true,
        thumbnail: '/assets/reports/annual-2024.jpg',
        url: '/reports/annual-2024.pdf',
        metrics: {
          beneficiaries: '10,234',
          projects: '25',
          volunteers: '500+',
          states: '12'
        },
        highlights: [
          'Launched education program in 50 new villages',
          'Reached 5,000 children through healthcare camps',
          'Empowered 1,000 women through skill training',
          'Planted 50,000 trees across 10 districts'
        ],
        projects: [
          { name: 'Education for All', beneficiaries: '3,200', budget: '₹45L' },
          { name: 'Healthcare Initiative', beneficiaries: '5,000', budget: '₹32L' },
          { name: 'Women Empowerment', beneficiaries: '1,000', budget: '₹28L' },
          { name: 'Environment Campaign', beneficiaries: '50,000 trees', budget: '₹15L' }
        ],
        testimonials: [
          { name: 'Priya Sharma', role: 'Beneficiary', quote: 'The education program changed my daughter\'s life.' },
          { name: 'Rajesh Kumar', role: 'Volunteer', quote: 'Proud to be part of this amazing journey.' }
        ],
        financial: {
          income: '12500000',
          expenses: '11200000',
          breakdown: {
            'Program Expenses': '8500000',
            'Administrative': '1500000',
            'Fundraising': '700000',
            'Emergency Fund': '500000'
          }
        },
        gallery: [
          '/assets/gallery/report1.jpg',
          '/assets/gallery/report2.jpg',
          '/assets/gallery/report3.jpg',
          '/assets/gallery/report4.jpg'
        ]
      },
      {
        id: 2,
        title: 'Q4 Impact Report 2023',
        type: 'quarterly',
        category: 'Quarterly Report',
        year: '2023',
        period: 'Q4 2023',
        publishedDate: '2024-01-10',
        description: 'Quarterly impact report highlighting key achievements and milestones from October to December 2023.',
        summary: 'This quarter saw significant progress in our education and healthcare initiatives.',
        fileSize: '2.8 MB',
        pages: 24,
        downloads: 856,
        views: 2341,
        featured: false,
        thumbnail: '/assets/reports/q4-2023.jpg',
        url: '/reports/q4-2023.pdf',
        metrics: {
          beneficiaries: '3,456',
          projects: '18',
          volunteers: '234',
          events: '45'
        },
        highlights: [
          'Conducted 20 health camps in rural areas',
          'Enrolled 500 new students in education program',
          'Organized 15 community events',
          'Completed 2 major infrastructure projects'
        ]
      },
      {
        id: 3,
        title: 'Education Impact Report 2023',
        type: 'impact',
        category: 'Impact Report',
        year: '2023',
        period: 'Full Year 2023',
        publishedDate: '2023-12-05',
        description: 'Detailed impact assessment of our education initiatives throughout the year.',
        summary: 'Comprehensive analysis of our education programs and their impact on children and communities.',
        fileSize: '4.1 MB',
        pages: 36,
        downloads: 567,
        views: 1890,
        featured: true,
        thumbnail: '/assets/reports/education-2023.jpg',
        url: '/reports/education-2023.pdf',
        metrics: {
          students: '5,234',
          teachers: '156',
          schools: '45',
          villages: '78'
        },
        highlights: [
          '95% student attendance rate',
          '87% improvement in test scores',
          'Established 10 new learning centers',
          'Trained 150 teachers'
        ]
      },
      {
        id: 4,
        title: 'Financial Report 2022-23',
        type: 'financial',
        category: 'Financial Report',
        year: '2023',
        period: 'FY 2022-23',
        publishedDate: '2023-08-20',
        description: 'Audited financial statements and annual accounts for the fiscal year 2022-23.',
        summary: 'Transparent financial reporting with detailed breakdown of income, expenses, and fund utilization.',
        fileSize: '3.5 MB',
        pages: 42,
        downloads: 423,
        views: 1567,
        featured: false,
        thumbnail: '/assets/reports/financial-2023.jpg',
        url: '/reports/financial-2023.pdf',
        metrics: {
          income: '₹1.2Cr',
          expenses: '₹1.05Cr',
          reserves: '₹15L',
          efficiency: '87%'
        },
        financial: {
          income: '12000000',
          expenses: '10500000',
          breakdown: {
            'Program Expenses': '8200000',
            'Administrative': '1300000',
            'Fundraising': '600000',
            'Reserves': '400000'
          }
        }
      },
      {
        id: 5,
        title: 'Healthcare Initiative Report',
        type: 'project',
        category: 'Project Report',
        year: '2023',
        period: 'Jan-Jun 2023',
        publishedDate: '2023-07-15',
        description: 'Mid-year report on our healthcare initiatives and mobile medical camps.',
        summary: 'Detailed overview of healthcare activities, patient statistics, and community impact.',
        fileSize: '3.2 MB',
        pages: 28,
        downloads: 345,
        views: 1234,
        featured: false,
        thumbnail: '/assets/reports/healthcare-2023.jpg',
        url: '/reports/healthcare-2023.pdf',
        metrics: {
          patients: '8,456',
          camps: '56',
          villages: '89',
          volunteers: '234'
        },
        highlights: [
          'Conducted 56 medical camps',
          'Treated 8,456 patients',
          'Provided free medicines worth ₹12L',
          'Health awareness to 15,000 people'
        ]
      },
      {
        id: 6,
        title: 'Women Empowerment Report',
        type: 'impact',
        category: 'Impact Report',
        year: '2023',
        period: 'Full Year 2023',
        publishedDate: '2023-11-30',
        description: 'Comprehensive report on women empowerment programs and their outcomes.',
        summary: 'Showcasing the journey of women entrepreneurs and skill development achievements.',
        fileSize: '3.8 MB',
        pages: 32,
        downloads: 678,
        views: 2100,
        featured: true,
        thumbnail: '/assets/reports/women-2023.jpg',
        url: '/reports/women-2023.pdf',
        metrics: {
          women: '1,234',
          entrepreneurs: '234',
          groups: '45',
          villages: '56'
        },
        highlights: [
          'Formed 45 self-help groups',
          'Trained 1,234 women in skills',
          'Helped start 234 small businesses',
          'Microfinance disbursed: ₹45L'
        ]
      },
      {
        id: 7,
        title: 'Q3 Impact Report 2023',
        type: 'quarterly',
        category: 'Quarterly Report',
        year: '2023',
        period: 'Q3 2023',
        publishedDate: '2023-10-10',
        description: 'Quarterly progress report for July-September 2023.',
        summary: 'Updates on project implementation and key milestones achieved.',
        fileSize: '2.4 MB',
        pages: 22,
        downloads: 456,
        views: 1678,
        featured: false,
        thumbnail: '/assets/reports/q3-2023.jpg',
        url: '/reports/q3-2023.pdf'
      },
      {
        id: 8,
        title: 'Environment Impact Report',
        type: 'impact',
        category: 'Impact Report',
        year: '2023',
        period: 'Full Year 2023',
        publishedDate: '2023-12-20',
        description: 'Annual report on environmental conservation activities.',
        summary: 'Highlights of tree plantation drives, awareness campaigns, and green initiatives.',
        fileSize: '4.0 MB',
        pages: 30,
        downloads: 567,
        views: 1890,
        featured: false,
        thumbnail: '/assets/reports/environment-2023.jpg',
        url: '/reports/environment-2023.pdf',
        metrics: {
          trees: '75,000',
          volunteers: '2,500',
          villages: '45',
          schools: '60'
        }
      },
      {
        id: 9,
        title: 'Annual Report 2022-23',
        type: 'annual',
        category: 'Annual Report',
        year: '2023',
        period: 'FY 2022-23',
        publishedDate: '2023-06-30',
        description: 'Complete annual report for the fiscal year 2022-23.',
        summary: 'Comprehensive overview of all activities, achievements, and financials.',
        fileSize: '6.1 MB',
        pages: 52,
        downloads: 2345,
        views: 5678,
        featured: false,
        thumbnail: '/assets/reports/annual-2023.jpg',
        url: '/reports/annual-2023.pdf'
      }
    ];

    setReports(mockReports);
    setFilteredReports(mockReports);
    setLoading(false);
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Year filter
    if (selectedYear !== 'all') {
      filtered = filtered.filter(report => report.year === selectedYear);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(report => 
        report.category === selectedType || report.type === selectedType.toLowerCase().replace(' ', '_')
      );
    }

    // Tab filter
    if (activeTab === 'featured') {
      filtered = filtered.filter(report => report.featured);
    } else if (activeTab === 'annual') {
      filtered = filtered.filter(report => report.type === 'annual');
    } else if (activeTab === 'impact') {
      filtered = filtered.filter(report => report.type === 'impact');
    } else if (activeTab === 'financial') {
      filtered = filtered.filter(report => report.type === 'financial');
    }

    setFilteredReports(filtered);
    setCurrentPage(1);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowPopup(true);
  };

  const handleDownloadReport = (report) => {
    // Simulate download
    toast.success(`Downloading ${report.title}...`);
    
    // In real app, you would trigger actual download
    // window.open(report.url, '_blank');
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedReport(null);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'annual': return <FiAward className="text-purple-600" />;
      case 'quarterly': return <FiBarChart2 className="text-blue-600" />;
      case 'impact': return <FiHeart className="text-red-600" />;
      case 'financial': return <FiDollarSign className="text-green-600" />;
      case 'project': return <FiCheckCircle className="text-orange-600" />;
      default: return <FiFileText className="text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'annual': return 'bg-purple-100 text-purple-800';
      case 'quarterly': return 'bg-blue-100 text-blue-800';
      case 'impact': return 'bg-red-100 text-red-800';
      case 'financial': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  if (loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reports...</p>
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
          <h1 className="text-4xl font-bold mb-4">Reports & Publications</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access our annual reports, impact assessments, financial statements, 
            and other publications to understand our work and transparency.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FiFileText className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
            <div className="text-sm text-gray-600">Total Reports</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FiDownload className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">12.5K+</div>
            <div className="text-sm text-gray-600">Downloads</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FiEye className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">34.2K+</div>
            <div className="text-sm text-gray-600">Views</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FiStar className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{reports.filter(r => r.featured).length}</div>
            <div className="text-sm text-gray-600">Featured</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'all'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'featured'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Featured
          </button>
          <button
            onClick={() => setActiveTab('annual')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'annual'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Annual Reports
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'impact'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Impact Reports
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'financial'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Financial Reports
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                {years.map(year => (
                  <option key={year} value={year === 'All' ? 'all' : year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                {reportTypes.map(type => (
                  <option key={type} value={type === 'All' ? 'all' : type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentReports.map(report => (
            <div key={report.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Thumbnail */}
              <div className="h-40 bg-gradient-to-br from-primary-600 to-primary-800 relative">
                {report.thumbnail ? (
                  <img 
                    src={report.thumbnail} 
                    alt={report.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getTypeIcon(report.type)}
                  </div>
                )}
                
                {/* Featured Badge */}
                {report.featured && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                    <FiStar className="mr-1" size={12} />
                    Featured
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(report.type)}`}>
                    {report.category || report.type}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center">
                    <FiCalendar className="mr-1" size={12} />
                    {formatDate(report.publishedDate)}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2">{report.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{report.summary || report.description}</p>

                {/* Metrics Preview */}
                {report.metrics && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {Object.entries(report.metrics).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-xs font-semibold text-primary-600">{value}</div>
                        <div className="text-xs text-gray-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center">
                    <FiFileText className="mr-1" size={12} />
                    {report.pages} pages
                  </span>
                  <span className="flex items-center">
                    <FiDownload className="mr-1" size={12} />
                    {report.downloads} downloads
                  </span>
                  <span className="flex items-center">
                    <FiEye className="mr-1" size={12} />
                    {report.views} views
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewReport(report)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <FiEye className="mr-2" size={16} />
                    Preview
                  </button>
                  <button
                    onClick={() => handleDownloadReport(report)}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <FiDownload className="mr-2" size={16} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No reports found</h3>
            <p className="text-gray-500">Try adjusting your filters or search term</p>
          </div>
        )}

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

        {/* Report Popup */}
        {showPopup && selectedReport && (
          <ReportPopup
            report={selectedReport}
            onClose={handleClosePopup}
            onDownload={handleDownloadReport}
          />
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
