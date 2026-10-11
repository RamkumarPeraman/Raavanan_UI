import CommonLoader from '../../components/common/CommonLoader';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FiArrowRight, FiDownload, FiCalendar, FiFileText, FiBarChart2,
  FiSearch, FiFilter, FiChevronLeft, FiChevronRight,
  FiAward, FiHeart, FiDollarSign, FiCheckCircle
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
  const [showFilters, setShowFilters] = useState(false);
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

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) : 'Date unavailable';

  const tabs = [
    ['all', 'All Reports', reports.length],
    ['featured', 'Featured', reports.filter((report) => report.featured).length],
    ['annual', 'Annual Reports', reports.filter((report) => report.type === 'annual').length],
    ['impact', 'Impact Reports', reports.filter((report) => report.type === 'impact').length],
    ['financial', 'Financial Reports', reports.filter((report) => report.type === 'financial').length],
    ['publications', 'Publications', reports.filter((report) => report.type === 'publication' || report.category === 'Publication').length],
  ];
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const currentReports = filteredReports.slice((currentPage - 1) * reportsPerPage, currentPage * reportsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f3] pt-3">
        <div className="container-custom">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <CommonLoader className="mb-4" />
              <p className="text-gray-600">Loading reports...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] pt-3 pb-10 text-ink-950">
      <div className="container-custom">
        <h1 className="sr-only">Reports and Publications</h1>
        <div className="relative flex min-w-0 flex-col gap-4 border-b border-[#e4ddd2] pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-1" role="group" aria-label="Report views">
          {tabs.map(([tabId, label, count]) => (
            <button
              key={tabId}
              type="button"
              aria-pressed={activeTab === tabId}
              onClick={() => setActiveTab(tabId)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-3 text-sm font-semibold transition ${
                activeTab === tabId
                  ? 'border-primary-700 bg-primary-800 text-white'
                  : 'border-[#e4ddd2] bg-white text-ink-700 hover:border-primary-400 hover:text-primary-800'
              }`}
            >
              {label}
              <span className={`text-xs ${activeTab === tabId ? 'text-white/80' : 'text-ink-500'}`}>{count}</span>
            </button>
          ))}
          </div>
          <div className="flex min-w-0 gap-3 xl:w-[min(35vw,560px)] xl:shrink-0">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search reports</span>
              <FiSearch aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                type="text"
                placeholder="Search reports by title or topic"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-11 w-full rounded-md border border-[#ded8cd] bg-white pl-11 pr-4 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-500/15"
              />
            </label>
            <button
              type="button"
              aria-expanded={showFilters}
              aria-controls="report-filter-panel"
              onClick={() => setShowFilters((open) => !open)}
              className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border px-5 text-sm font-semibold transition hover:border-primary-600 ${selectedYear !== 'all' || selectedType !== 'all' ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-[#ded8cd] bg-white text-ink-700'}`}
            ><FiFilter aria-hidden="true" />Filters</button>
          </div>
        </div>

        {showFilters && <div id="report-filter-panel" className="relative z-10 mt-2 flex flex-wrap items-end gap-3 rounded-md border border-[#ded8cd] bg-white p-4 shadow-sm">
          <label className="min-w-[150px] flex-1 text-xs font-medium text-ink-500">Year
            <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-[#ded8cd] bg-white px-3 text-sm text-ink-900 outline-none focus:border-primary-600">
              {years.map((year) => <option key={year} value={year === 'All' ? 'all' : year}>{year === 'All' ? 'All years' : year}</option>)}
            </select>
          </label>
          <label className="min-w-[170px] flex-1 text-xs font-medium text-ink-500">Type
            <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-[#ded8cd] bg-white px-3 text-sm text-ink-900 outline-none focus:border-primary-600">
              {reportTypes.map((type) => <option key={type} value={type === 'All' ? 'all' : type}>{type === 'All' ? 'All types' : type}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => { setSelectedYear('all'); setSelectedType('all'); }} className="h-10 rounded-md px-3 text-sm font-semibold text-primary-800 hover:bg-primary-50">Clear</button>
          <button type="button" onClick={() => setShowFilters(false)} className="h-10 rounded-md bg-primary-800 px-4 text-sm font-semibold text-white hover:bg-primary-700">Done</button>
        </div>}

        <p className="mt-6 mb-4 text-sm text-ink-500">{filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}</p>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {currentReports.map((report) => (
            <article key={report.id} className="flex min-w-0 flex-col overflow-hidden rounded-md border border-[#e4ddd2] bg-white shadow-[0_14px_36px_-32px_rgba(9,42,43,0.45)] transition hover:border-primary-300 hover:shadow-md">
              <div className="relative flex h-40 w-full items-center justify-center bg-gradient-to-br from-[#dcece7] via-[#f2f4e9] to-[#fff0db] text-4xl text-primary-800">
                {getTypeIcon(report.type)}
                {report.year && <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-3 py-1.5 text-xs font-bold text-primary-900 shadow-sm">{report.year}</span>}
              </div>

              <div className="flex-1 p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-700">
                  <span>{report.category || report.type || 'Report'}</span>
                  {report.featured && <><span className="h-1 w-1 rounded-full bg-stone-400" aria-hidden="true" /><span className="text-ink-500">Featured</span></>}
                </div>
                <h3 className="mt-3 break-words text-xl font-bold leading-snug text-ink-950 [overflow-wrap:anywhere]">{report.title}</h3>
                <p className="mt-2 line-clamp-2 min-h-12 break-words text-sm leading-6 text-ink-600 [overflow-wrap:anywhere]">{report.summary || report.description || 'Explore this document for more details.'}</p>
                <div className="mt-4 space-y-2 text-sm text-ink-600">
                  <div className="flex items-center gap-2"><FiCalendar aria-hidden="true" /><span>{formatDate(report.publishedDate)}</span></div>
                  {report.pages && <div className="flex items-center gap-2"><FiFileText aria-hidden="true" /><span>{report.pages} pages</span></div>}
                  <div className="flex items-center gap-2"><FiDownload aria-hidden="true" /><span>{report.downloads || 0} downloads</span></div>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[#eee9e0] px-5 py-3">
                <button type="button" onClick={() => handleViewReport(report)} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-800 hover:text-primary-600">
                  View details <FiArrowRight aria-hidden="true" />
                </button>
                <button type="button" onClick={() => handleDownloadReport(report)} className="inline-flex items-center gap-1.5 rounded bg-primary-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-primary-700">
                  <FiDownload aria-hidden="true" /> Open file
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="rounded-md border border-[#e4ddd2] bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-primary-50 text-primary-800"><FiFileText size={25} aria-hidden="true" /></div>
            <h2 className="mt-4 text-xl font-bold">No reports found</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-600">Try another search, view, or filter.</p>
            {(searchTerm || activeTab !== 'all' || selectedYear !== 'all' || selectedType !== 'all') && <button type="button" onClick={() => { setSearchTerm(''); setActiveTab('all'); setSelectedYear('all'); setSelectedType('all'); }} className="mt-5 rounded-md bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Clear filters</button>}
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
