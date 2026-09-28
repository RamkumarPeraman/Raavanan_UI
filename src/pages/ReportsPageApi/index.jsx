import React, { useEffect, useMemo, useState } from 'react';
import {
  FiDownload, FiEye, FiCalendar, FiFileText, FiBarChart2,
  FiSearch, FiChevronLeft, FiChevronRight,
  FiAward, FiHeart, FiDollarSign, FiCheckCircle, FiStar
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReportPopup from '../../components/common/ReportPopup';
import apiService from '../../services/api';

const reportTypes = [
  'All',
  'Annual Report',
  'Quarterly Report',
  'Impact Report',
  'Financial Report',
  'Project Report',
  'Field Visit Report',
  'Sustainability Report',
  'Publication',
];

const ReportsPageApi = () => {
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

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const data = await apiService.getReports();
        setReports(data);
        setFilteredReports(data);
      } catch (error) {
        console.error('Failed to load reports:', error);
        toast.error(error.response?.data?.message || error.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  useEffect(() => {
    let filtered = [...reports];

    if (searchTerm) {
      const normalizedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((report) =>
        report.title?.toLowerCase().includes(normalizedSearch) ||
        report.description?.toLowerCase().includes(normalizedSearch) ||
        report.category?.toLowerCase().includes(normalizedSearch) ||
        report.summary?.toLowerCase().includes(normalizedSearch)
      );
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter((report) => report.year === selectedYear);
    }

    if (selectedType !== 'all') {
      const normalizedType = selectedType.toLowerCase().replace(/\s+/g, '_');
      filtered = filtered.filter(
        (report) => report.category === selectedType || report.type === normalizedType
      );
    }

    if (activeTab === 'featured') {
      filtered = filtered.filter((report) => report.featured);
    } else if (activeTab === 'annual') {
      filtered = filtered.filter((report) => report.type === 'annual');
    } else if (activeTab === 'impact') {
      filtered = filtered.filter((report) => report.type === 'impact');
    } else if (activeTab === 'financial') {
      filtered = filtered.filter((report) => report.type === 'financial');
    } else if (activeTab === 'publications') {
      filtered = filtered.filter((report) => report.type === 'publication' || report.category === 'Publication');
    }

    setFilteredReports(filtered);
    setCurrentPage(1);
  }, [reports, searchTerm, selectedYear, selectedType, activeTab]);

  const years = useMemo(() => ['All', ...new Set(reports.map((report) => report.year).filter(Boolean))], [reports]);

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowPopup(true);
  };

  const handleDownloadReport = (report) => {
    if (report?.url) {
      window.open(report.url, '_blank', 'noopener,noreferrer');
      toast.success(`Opening ${report.title}...`);
      return;
    }

    toast.info('Download link will be available soon');
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedReport(null);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'annual':
        return <FiAward className="text-purple-600" />;
      case 'quarterly':
        return <FiBarChart2 className="text-blue-600" />;
      case 'impact':
        return <FiHeart className="text-red-600" />;
      case 'financial':
        return <FiDollarSign className="text-green-600" />;
      case 'project':
        return <FiCheckCircle className="text-orange-600" />;
      default:
        return <FiFileText className="text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'annual':
        return 'bg-purple-100 text-purple-800';
      case 'quarterly':
        return 'bg-blue-100 text-blue-800';
      case 'impact':
        return 'bg-red-100 text-red-800';
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'project':
        return 'bg-orange-100 text-orange-800';
      case 'publication':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const totalDownloads = reports.reduce((sum, report) => sum + Number(report.downloads || 0), 0);
  const totalViews = reports.reduce((sum, report) => sum + Number(report.views || 0), 0);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const currentReports = filteredReports.slice((currentPage - 1) * reportsPerPage, currentPage * reportsPerPage);

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Reports & Publications</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access our annual reports, impact assessments, financial statements,
            and publications to understand our work and transparency.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FiFileText className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FiDownload className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{totalDownloads.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Downloads</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FiEye className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Views</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FiStar className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{reports.filter((report) => report.featured).length}</div>
            <div className="text-sm text-gray-600">Featured</div>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          {[
            ['all', 'All Reports'],
            ['featured', 'Featured'],
            ['annual', 'Annual Reports'],
            ['impact', 'Impact Reports'],
            ['financial', 'Financial Reports'],
            ['publications', 'Publications'],
          ].map(([tabId, label]) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === tabId
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year === 'All' ? 'all' : year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
            >
              {reportTypes.map((type) => (
                <option key={type} value={type === 'All' ? 'all' : type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentReports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-40 bg-gradient-to-br from-primary-600 to-primary-800 relative">
                {report.thumbnail ? (
                  <img src={report.thumbnail} alt={report.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">{getTypeIcon(report.type)}</div>
                )}

                {report.featured && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                    <FiStar className="mr-1" size={12} />
                    Featured
                  </div>
                )}
              </div>

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

                {report.metrics && Object.keys(report.metrics).length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {Object.entries(report.metrics).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-xs font-semibold text-primary-600">{value}</div>
                        <div className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center">
                    <FiFileText className="mr-1" size={12} />
                    {report.pages || 0} pages
                  </span>
                  <span className="flex items-center">
                    <FiDownload className="mr-1" size={12} />
                    {report.downloads || 0} downloads
                  </span>
                  <span className="flex items-center">
                    <FiEye className="mr-1" size={12} />
                    {report.views || 0} views
                  </span>
                </div>

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

        {filteredReports.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow mt-6">
            <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No reports found</h3>
            <p className="text-gray-500">Try adjusting your filters or search term</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === index + 1
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
              >
                <FiChevronRight />
              </button>
            </nav>
          </div>
        )}

        {showPopup && selectedReport && (
          <ReportPopup report={selectedReport} onClose={handleClosePopup} onDownload={handleDownloadReport} />
        )}
      </div>
    </div>
  );
};

export default ReportsPageApi;
