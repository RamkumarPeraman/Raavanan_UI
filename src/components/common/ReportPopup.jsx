import React from 'react';
import { 
  FiX, FiDownload, FiEye, FiCalendar, FiFileText, 
  FiBarChart2, FiUsers, FiHeart, FiAward, FiMapPin,
  FiClock, FiCheckCircle, FiTrendingUp, FiDollarSign
} from 'react-icons/fi';

const ReportPopup = ({ report, onClose, onDownload }) => {
  if (!report) return null;

  const getReportIcon = (type) => {
    switch(type) {
      case 'annual': return <FiAward className="text-purple-600" size={24} />;
      case 'quarterly': return <FiBarChart2 className="text-blue-600" size={24} />;
      case 'impact': return <FiHeart className="text-red-600" size={24} />;
      case 'financial': return <FiDollarSign className="text-green-600" size={24} />;
      case 'project': return <FiCheckCircle className="text-orange-600" size={24} />;
      default: return <FiFileText className="text-gray-600" size={24} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {getReportIcon(report.type)}
            <h2 className="text-xl font-bold text-white ml-3">{report.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-primary-500 p-1 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {/* Report Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Report Type</p>
              <p className="font-semibold capitalize">{report.type || 'General'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Period</p>
              <p className="font-semibold">
                {report.period || (report.year ? `FY ${report.year}` : 'N/A')}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Published</p>
              <p className="font-semibold">{formatDate(report.publishedDate || report.date)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Pages</p>
              <p className="font-semibold">{report.pages || 'N/A'}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">About this Report</h3>
            <p className="text-gray-700 leading-relaxed">
              {report.description || report.summary || 'No description available.'}
            </p>
          </div>

          {/* Key Metrics */}
          {report.metrics && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(report.metrics).map(([key, value]) => (
                  <div key={key} className="bg-primary-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary-600">{value}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Impact Highlights */}
          {report.highlights && report.highlights.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Impact Highlights</h3>
              <div className="space-y-3">
                {report.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <FiCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {report.projects && report.projects.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Projects Covered</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.projects.map((project, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{project.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    <div className="flex justify-between text-sm">
                      <span>Beneficiaries: {project.beneficiaries}</span>
                      <span className="text-primary-600">Budget: ₹{project.budget}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonials */}
          {report.testimonials && report.testimonials.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Stories from the Field</h3>
              <div className="space-y-4">
                {report.testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-600">
                    <p className="text-gray-700 italic mb-2">"{testimonial.quote}"</p>
                    <p className="text-sm font-medium">— {testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Summary */}
          {report.financial && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">₹{report.financial.income}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">₹{report.financial.expenses}</p>
                  </div>
                </div>
                
                {report.financial.breakdown && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium mb-3">Expense Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(report.financial.breakdown).map(([category, amount]) => (
                        <div key={category} className="flex justify-between text-sm">
                          <span className="text-gray-600">{category}</span>
                          <span className="font-medium">₹{amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gallery */}
          {report.gallery && report.gallery.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Photo Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {report.gallery.map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={image} 
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <FiFileText className="inline mr-2" />
            {report.fileSize || report.size || 'PDF'} • {report.pages || 'N/A'} pages
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onDownload(report)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <FiDownload className="mr-2" />
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPopup;