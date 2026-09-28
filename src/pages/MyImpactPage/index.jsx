import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHeart, FiUsers, FiClock, FiCalendar, FiAward,
  FiTrendingUp, FiGlobe, FiDroplet, FiBook, FiHome,
  FiActivity, FiStar, FiMapPin, FiDownload, FiShare2,
  FiChevronLeft, FiChevronRight, FiBarChart2, FiTarget
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const MyImpactPage = () => {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all'); // all, year, month, week
  const [impactData, setImpactData] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [showShareModal, setShowShareModal] = useState(false);

  // Years for filter
  const years = ['2024', '2023', '2022', '2021'];

  useEffect(() => {
    loadImpactData();
  }, [timeframe, selectedYear]);

  const loadImpactData = () => {
    // Mock impact data
    const mockImpactData = {
      // Overall Stats
      overall: {
        volunteerHours: 245,
        eventsAttended: 18,
        donationsMade: 12,
        totalDonated: 45000,
        projectsSupported: 8,
        badges: 15,
        impactScore: 850,
        rank: 'Bronze Supporter',
        nextRank: 'Silver Supporter',
        rankProgress: 65,
        peopleHelped: 1245,
        trees: 50,
        meals: 500,
        childrenEducated: 25,
        womenEmpowered: 15
      },

      // Monthly breakdown
      monthly: [
        { month: 'Jan', hours: 25, events: 2, donations: 5000 },
        { month: 'Feb', hours: 30, events: 3, donations: 2500 },
        { month: 'Mar', hours: 20, events: 1, donations: 10000 },
        { month: 'Apr', hours: 15, events: 1, donations: 0 },
        { month: 'May', hours: 28, events: 2, donations: 5000 },
        { month: 'Jun', hours: 22, events: 2, donations: 2500 },
        { month: 'Jul', hours: 18, events: 1, donations: 5000 },
        { month: 'Aug', hours: 12, events: 1, donations: 0 },
        { month: 'Sep', hours: 20, events: 2, donations: 5000 },
        { month: 'Oct', hours: 25, events: 2, donations: 2500 },
        { month: 'Nov', hours: 15, events: 1, donations: 5000 },
        { month: 'Dec', hours: 15, events: 0, donations: 5000 }
      ],

      // Project-wise impact
      projects: [
        {
          id: 1,
          name: 'Education for All',
          hours: 120,
          donations: 15000,
          impact: 'Helped 15 children with education'
        },
        {
          id: 2,
          name: 'Healthcare Initiative',
          hours: 45,
          donations: 10000,
          impact: 'Supported 5 medical camps'
        },
        {
          id: 3,
          name: 'Women Empowerment',
          hours: 30,
          donations: 8000,
          impact: 'Empowered 8 women entrepreneurs'
        },
        {
          id: 4,
          name: 'Environment Campaign',
          hours: 50,
          donations: 5000,
          impact: 'Planted 50 trees'
        },
        {
          id: 5,
          name: 'Disaster Relief',
          hours: 0,
          donations: 7000,
          impact: 'Helped 20 families during floods'
        }
      ],

      // Timeline of activities
      timeline: [
        {
          date: '2024-02-15',
          type: 'donation',
          title: 'Donated to Education Fund',
          amount: 5000,
          impact: 'Supports education for 2 children for 1 month'
        },
        {
          date: '2024-02-10',
          type: 'volunteer',
          title: 'Volunteered at Education Camp',
          hours: 4,
          impact: 'Taught 20 children mathematics'
        },
        {
          date: '2024-02-05',
          type: 'event',
          title: 'Attended Fundraising Gala',
          hours: 3,
          impact: 'Helped raise awareness'
        },
        {
          date: '2024-01-28',
          type: 'badge',
          title: 'Earned "Super Volunteer" Badge',
          impact: 'Completed 200 volunteer hours'
        },
        {
          date: '2024-01-20',
          type: 'donation',
          title: 'Donated to Healthcare Initiative',
          amount: 2500,
          impact: 'Provided medicines for 50 patients'
        },
        {
          date: '2024-01-15',
          type: 'volunteer',
          title: 'Volunteered at Medical Camp',
          hours: 6,
          impact: 'Assisted in treating 100 patients'
        },
        {
          date: '2024-01-10',
          type: 'donation',
          title: 'Donated to Women Empowerment',
          amount: 5000,
          impact: 'Supported 2 women in starting small businesses'
        }
      ],

      // Certificates
      certificates: [
        {
          id: 1,
          name: 'Certificate of Appreciation 2023',
          date: '2023-12-31',
          hours: 200,
          url: '/certificates/2023.pdf'
        },
        {
          id: 2,
          name: 'Volunteer Excellence Award',
          date: '2023-06-15',
          hours: 100,
          url: '/certificates/excellence.pdf'
        }
      ],

      // Badges earned
      badges: [
        { id: 1, name: 'First Donation', icon: '🎁', earned: '2023-06-20', description: 'Made your first donation' },
        { id: 2, name: 'Super Volunteer', icon: '🌟', earned: '2024-01-05', description: 'Completed 200 volunteer hours' },
        { id: 3, name: 'Event Star', icon: '⭐', earned: '2023-12-10', description: 'Attended 15 events' },
        { id: 4, name: 'Team Player', icon: '🤝', earned: '2023-09-30', description: 'Joined 5 group activities' },
        { id: 5, name: 'Tree Champion', icon: '🌳', earned: '2023-08-15', description: 'Planted 50 trees' },
        { id: 6, name: 'Healthcare Hero', icon: '🏥', earned: '2023-07-20', description: 'Volunteered at 5 medical camps' },
        { id: 7, name: 'Education Advocate', icon: '📚', earned: '2023-06-10', description: 'Supported education for 25 children' },
        { id: 8, name: 'Bronze Donor', icon: '🥉', earned: '2023-05-05', description: 'Donated ₹10,000 total' }
      ],

      // Next milestones
      nextMilestones: [
        { name: '500 Volunteer Hours', progress: 245, target: 500, icon: '⏰' },
        { name: '₹1,00,000 Donations', progress: 45000, target: 100000, icon: '💰' },
        { name: 'Silver Donor', progress: 45000, target: 50000, icon: '🥈' },
        { name: '50 Events Attended', progress: 18, target: 50, icon: '🎪' },
        { name: 'Master Volunteer', progress: 245, target: 1000, icon: '🏆' }
      ],

      // Impact by category
      categoryImpact: [
        { category: 'Education', percentage: 35, value: '15 children' },
        { category: 'Healthcare', percentage: 25, value: '500 patients' },
        { category: 'Environment', percentage: 15, value: '50 trees' },
        { category: 'Women Empowerment', percentage: 15, value: '15 women' },
        { category: 'Disaster Relief', percentage: 10, value: '20 families' }
      ],

      // Comparison with community
      communityRank: {
        top: 15,
        percent: 85,
        total: 1250
      }
    };

    setImpactData(mockImpactData);
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'donation': return <FiHeart className="text-red-600" />;
      case 'volunteer': return <FiClock className="text-blue-600" />;
      case 'event': return <FiCalendar className="text-purple-600" />;
      case 'badge': return <FiAward className="text-yellow-600" />;
      default: return <FiActivity className="text-gray-600" />;
    }
  };

  const handleDownloadCertificate = (certificate) => {
    toast.success(`Downloading ${certificate.name}...`);
  };

  const handleShareImpact = () => {
    setShowShareModal(true);
  };

  const shareOnSocial = (platform) => {
    toast.success(`Shared on ${platform}`);
    setShowShareModal(false);
  };

  if (loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Calculating your impact...</p>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <FiHeart className="mr-3 text-primary-600" />
              My Impact
            </h1>
            <p className="text-gray-600">
              See the difference you're making in our community
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={handleShareImpact}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <FiShare2 className="mr-2" />
              Share Impact
            </button>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="year">This Year</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>

        {/* Impact Score Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <p className="text-primary-100 mb-2">Your Impact Score</p>
              <p className="text-5xl font-bold mb-2">{impactData.overall.impactScore}</p>
              <p className="text-primary-100">{impactData.overall.rank}</p>
            </div>
            
            <div className="text-center md:text-left">
              <p className="text-primary-100 mb-2">Next Rank</p>
              <p className="text-2xl font-semibold mb-2">{impactData.overall.nextRank}</p>
              <div className="flex items-center">
                <div className="flex-1 h-2 bg-primary-500 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ width: `${impactData.overall.rankProgress}%` }}
                  ></div>
                </div>
                <span className="ml-3 text-sm">{impactData.overall.rankProgress}%</span>
              </div>
            </div>

            <div className="text-center md:text-left">
              <p className="text-primary-100 mb-2">Community Rank</p>
              <p className="text-2xl font-bold mb-2">Top {impactData.communityRank.top}%</p>
              <p className="text-primary-100">Among {impactData.communityRank.total} members</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FiClock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{impactData.overall.volunteerHours}</div>
            <div className="text-sm text-gray-600">Volunteer Hours</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FiCalendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{impactData.overall.eventsAttended}</div>
            <div className="text-sm text-gray-600">Events Attended</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FiHeart className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{impactData.overall.donationsMade}</div>
            <div className="text-sm text-gray-600">Donations</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FiAward className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{impactData.overall.badges}</div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </div>
        </div>

        {/* People Impacted */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">People You've Helped</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">{impactData.overall.peopleHelped}</div>
              <div className="text-sm text-gray-600">Total People</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{impactData.overall.childrenEducated}</div>
              <div className="text-sm text-gray-600">Children Educated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{impactData.overall.womenEmpowered}</div>
              <div className="text-sm text-gray-600">Women Empowered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{impactData.overall.trees}</div>
              <div className="text-sm text-gray-600">Trees Planted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{impactData.overall.meals}</div>
              <div className="text-sm text-gray-600">Meals Provided</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Monthly Activity</h2>
            <div className="space-y-4">
              {impactData.monthly.map((month, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-12 text-sm font-medium text-gray-600">{month.month}</span>
                  <div className="flex-1 ml-4">
                    <div className="flex items-center space-x-1">
                      <div 
                        className="h-8 bg-blue-600 rounded-l"
                        style={{ width: `${(month.hours / 40) * 100}%` }}
                      ></div>
                      <div 
                        className="h-8 bg-green-600"
                        style={{ width: `${(month.donations / 10000) * 100}%` }}
                      ></div>
                      <div 
                        className="h-8 bg-purple-600 rounded-r"
                        style={{ width: `${(month.events / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Hours</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Donations</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-600 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Events</span>
              </div>
            </div>
          </div>

          {/* Impact by Category */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Impact by Category</h2>
            <div className="space-y-4">
              {impactData.categoryImpact.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm text-gray-600">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 rounded-full h-2"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project-wise Impact */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Impact by Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {impactData.projects.map(project => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">{project.name}</h3>
                <div className="space-y-2 text-sm">
                  {project.hours > 0 && (
                    <p className="text-gray-600 flex items-center">
                      <FiClock className="mr-2 text-blue-600" size={14} />
                      {project.hours} volunteer hours
                    </p>
                  )}
                  {project.donations > 0 && (
                    <p className="text-gray-600 flex items-center">
                      <FiHeart className="mr-2 text-red-600" size={14} />
                      ₹{project.donations} donated
                    </p>
                  )}
                  <p className="text-green-600 font-medium mt-2">{project.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Your Impact Timeline</h2>
          <div className="space-y-6">
            {impactData.timeline.map((item, index) => (
              <div key={index} className="flex items-start">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  {getActivityIcon(item.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className="text-sm text-gray-500">{formatDate(item.date)}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{item.impact}</p>
                  {item.amount && (
                    <p className="text-green-600 text-sm font-medium mt-1">Donated: ₹{item.amount}</p>
                  )}
                  {item.hours && (
                    <p className="text-blue-600 text-sm font-medium mt-1">{item.hours} hours</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges & Certificates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Badges */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Earned Badges</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {impactData.badges.map(badge => (
                <div key={badge.id} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">{badge.icon}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                  <p className="text-xs text-primary-600 mt-1">Earned {formatDate(badge.earned)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Your Certificates</h2>
            <div className="space-y-4">
              {impactData.certificates.map(cert => (
                <div key={cert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{cert.name}</h3>
                    <p className="text-sm text-gray-600">Issued: {formatDate(cert.date)} • {cert.hours} hours</p>
                  </div>
                  <button
                    onClick={() => handleDownloadCertificate(cert)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                  >
                    <FiDownload className="mr-2" size={16} />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Milestones */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Next Milestones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {impactData.nextMilestones.map((milestone, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{milestone.icon}</span>
                  <h3 className="font-semibold">{milestone.name}</h3>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium">{milestone.progress}/{milestone.target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 rounded-full h-2"
                    style={{ width: `${(milestone.progress / milestone.target) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {Math.round((milestone.progress / milestone.target) * 100)}% complete
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Share Impact Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Share Your Impact</h3>
              
              <div className="space-y-4">
                <button
                  onClick={() => shareOnSocial('Facebook')}
                  className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  Share on Facebook
                </button>
                <button
                  onClick={() => shareOnSocial('Twitter')}
                  className="w-full p-4 bg-blue-400 text-white rounded-lg hover:bg-blue-500 flex items-center justify-center"
                >
                  Share on Twitter
                </button>
                <button
                  onClick={() => shareOnSocial('LinkedIn')}
                  className="w-full p-4 bg-blue-800 text-white rounded-lg hover:bg-blue-900 flex items-center justify-center"
                >
                  Share on LinkedIn
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('Check out my impact at Raavana Thalaigal Trust NGO!');
                    toast.success('Copied to clipboard!');
                    setShowShareModal(false);
                  }}
                  className="w-full p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center"
                >
                  Copy Link
                </button>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full mt-4 p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyImpactPage;