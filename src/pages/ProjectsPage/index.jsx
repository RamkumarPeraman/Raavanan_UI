import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiHeart, FiUsers, FiMapPin, FiCalendar,
  FiFilter, FiSearch, FiCheckCircle, FiClock, FiBarChart2,
  FiDownload, FiEye, FiAward, FiTarget
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../../services/api';

const defaultImpactMetrics = {
  totalProjects: 25,
  ongoingProjects: 12,
  completedProjects: 13,
  livesImpacted: 15000,
  volunteersEngaged: 800,
  statesReached: 10,
};

const getProjectStatusLabel = (status) => {
  if (status === 'ongoing') {
    return 'Ongoing';
  }

  if (status === 'planned') {
    return 'Planned';
  }

  return 'Completed';
};

const getProjectStatusClass = (status) => {
  if (status === 'ongoing') {
    return 'bg-green-100 text-green-800';
  }

  if (status === 'planned') {
    return 'bg-yellow-100 text-yellow-800';
  }

  return 'bg-gray-100 text-gray-800';
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [impactMetrics, setImpactMetrics] = useState(defaultImpactMetrics);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Categories
  const categories = [
    'All',
    'Education',
    'Healthcare',
    'Women Empowerment',
    'Child Welfare',
    'Environment',
    'Skill Development',
    'Community Development',
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = [...projects];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p =>
        p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  }, [projects, selectedCategory, selectedStatus, searchTerm]);

  const fetchProjects = async () => {
    try {
      const [projectData, metricsData] = await Promise.all([
        apiService.getProjects(),
        apiService.getProjectMetrics(),
      ]);
      setProjects(projectData);
      setFilteredProjects(projectData);
      setImpactMetrics(metricsData || defaultImpactMetrics);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Unable to load projects right now');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => 
        p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  const downloadReport = (project) => {
    if (project?.reportUrl) {
      window.open(project.reportUrl, '_blank', 'noopener,noreferrer');
      toast.success('Opening project report');
      return;
    }

    toast.info('Report will be available soon');
  };

  if (loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-gray-50">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
              ))}
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
          <h1 className="text-4xl font-bold mb-4">Our Projects</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how we're making a difference through our various initiatives 
            across India. From education to healthcare, every project creates lasting impact.
          </p>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {[
            { icon: FiTarget, label: 'Total Projects', value: impactMetrics.totalProjects },
            { icon: FiClock, label: 'Ongoing', value: impactMetrics.ongoingProjects },
            { icon: FiCheckCircle, label: 'Completed', value: impactMetrics.completedProjects },
            { icon: FiHeart, label: 'Lives Impacted', value: impactMetrics.livesImpacted.toLocaleString() },
            { icon: FiUsers, label: 'Volunteers', value: impactMetrics.volunteersEngaged.toLocaleString() },
            { icon: FiMapPin, label: 'States', value: impactMetrics.statesReached },
          ].map((metric, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4 text-center">
              <metric.icon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">{metric.value}</div>
              <div className="text-xs text-gray-600">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="md:w-40">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="ongoing">Ongoing</option>
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Filter Button */}
            <button
              onClick={filterProjects}
              className="md:w-auto px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
            >
              <FiFilter className="mr-2" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Project Image */}
              <div className="h-48 bg-gray-300 relative">
                {project.image && (
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getProjectStatusClass(project.status)}`}>
                    {getProjectStatusLabel(project.status)}
                  </span>
                </div>
                {project.category && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {project.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>

                {/* Progress Bar */}
                {project.status === 'ongoing' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 rounded-full h-2 transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Funding Info */}
                {project.goal && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Funding</span>
                      <span className="font-semibold">
                        ₹{project.raised?.toLocaleString()} / ₹{project.goal.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 rounded-full h-2"
                        style={{ width: `${(project.raised / project.goal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Impact Stats */}
                {project.impact && (
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    {Object.entries(project.impact).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded p-2">
                        <div className="text-sm font-semibold text-primary-600">{value}</div>
                        <div className="text-xs text-gray-500 capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Location and Date */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  {project.location && (
                    <span className="flex items-center">
                      <FiMapPin className="mr-1" size={14} />
                      {project.location}
                    </span>
                  )}
                  {project.startDate && (
                    <span className="flex items-center">
                      <FiCalendar className="mr-1" size={14} />
                      {new Date(project.startDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewProject(project)}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                  >
                    <FiEye className="mr-2" />
                    View Details
                  </button>
                  {project.status === 'ongoing' && (
                    <Link
                      to="/donate"
                      state={{ project: project.id }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <FiHeart className="mr-2" />
                      Donate
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <FiBarChart2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects found</h3>
            <p className="text-gray-500">Try adjusting your filters or search term</p>
          </div>
        )}

        {/* Project Modal */}
        {showModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
                    <div className="flex items-center mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold mr-3 ${getProjectStatusClass(selectedProject.status)}`}>
                        {getProjectStatusLabel(selectedProject.status)}
                      </span>
                      {selectedProject.category && (
                        <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {selectedProject.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Project Image */}
                {selectedProject.image && (
                  <div className="mb-6">
                    <img 
                      src={selectedProject.image} 
                      alt={selectedProject.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Description */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-3">About the Project</h3>
                    <p className="text-gray-700 mb-4">{selectedProject.longDescription || selectedProject.description}</p>
                    
                    {selectedProject.objectives && (
                      <>
                        <h4 className="font-semibold mb-2">Objectives</h4>
                        <ul className="list-disc list-inside text-gray-700 mb-4">
                          {selectedProject.objectives.map((obj, idx) => (
                            <li key={idx}>{obj}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {selectedProject.achievements && (
                      <>
                        <h4 className="font-semibold mb-2">Key Achievements</h4>
                        <ul className="list-disc list-inside text-gray-700">
                          {selectedProject.achievements.map((ach, idx) => (
                            <li key={idx}>{ach}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>

                  {/* Sidebar Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Project Details</h3>
                    
                    <div className="space-y-3">
                      {selectedProject.location && (
                        <div className="flex items-start">
                          <FiMapPin className="text-primary-600 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium">Location</div>
                            <div className="text-sm text-gray-600">{selectedProject.location}</div>
                          </div>
                        </div>
                      )}

                      {selectedProject.startDate && (
                        <div className="flex items-start">
                          <FiCalendar className="text-primary-600 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium">Duration</div>
                            <div className="text-sm text-gray-600">
                              {new Date(selectedProject.startDate).toLocaleDateString()} 
                              {selectedProject.endDate && ` - ${new Date(selectedProject.endDate).toLocaleDateString()}`}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedProject.partners && (
                        <div className="flex items-start">
                          <FiUsers className="text-primary-600 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium">Partners</div>
                            <div className="text-sm text-gray-600">{selectedProject.partners.join(', ')}</div>
                          </div>
                        </div>
                      )}

                      {selectedProject.funding && (
                        <div className="flex items-start">
                          <FiAward className="text-primary-600 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium">Funding Partners</div>
                            <div className="text-sm text-gray-600">{selectedProject.funding.join(', ')}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Download Report */}
                    {(selectedProject.reportUrl || selectedProject.report) && (
                      <button
                        onClick={() => downloadReport(selectedProject)}
                        className="w-full mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                      >
                        <FiDownload className="mr-2" />
                        Download Report
                      </button>
                    )}
                  </div>
                </div>

                {/* Impact Section */}
                {selectedProject.impact && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Impact Created</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(selectedProject.impact).map(([key, value]) => (
                        <div key={key} className="bg-primary-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-primary-600">{value}</div>
                          <div className="text-sm text-gray-700 capitalize">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery */}
                {selectedProject.gallery && selectedProject.gallery.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Project Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedProject.gallery.map((img, idx) => (
                        <img 
                          key={idx}
                          src={img} 
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {selectedProject.status === 'ongoing' && (
                    <Link
                      to="/donate"
                      state={{ project: selectedProject.id }}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                      onClick={closeModal}
                    >
                      <FiHeart className="mr-2" />
                      Support This Project
                    </Link>
                  )}
                  <Link
                    to="/volunteer"
                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                    onClick={closeModal}
                  >
                    <FiUsers className="mr-2" />
                    Volunteer for Project
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
