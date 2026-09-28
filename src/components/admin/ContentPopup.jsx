import React, { useState, useEffect } from 'react';
import {
  FiX, FiSave, FiImage, FiCalendar, FiMapPin, 
  FiUser, FiTag, FiClock, FiDollarSign, FiHeart,
  FiUpload, FiTrash2, FiPlus
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { processImageFile } from '../../utils/imageUpload';

const ContentPopup = ({ type, item, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Form configuration based on content type
  const getFormConfig = () => {
    const configs = {
      project: {
        title: item ? 'Edit Project' : 'Add New Project',
        fields: [
          { name: 'title', label: 'Project Title', type: 'text', required: true, col: 'full' },
          { name: 'category', label: 'Category', type: 'select', required: true, col: 'half',
            options: ['Education', 'Healthcare', 'Women Empowerment', 'Environment', 'Child Welfare', 'Skill Development'] },
          { name: 'status', label: 'Status', type: 'select', required: true, col: 'half',
            options: ['ongoing', 'completed', 'planned'] },
          { name: 'description', label: 'Short Description', type: 'textarea', required: true, col: 'full', rows: 3 },
          { name: 'longDescription', label: 'Full Description', type: 'textarea', required: true, col: 'full', rows: 5 },
          { name: 'location', label: 'Location', type: 'text', col: 'half' },
          { name: 'startDate', label: 'Start Date', type: 'date', col: 'half' },
          { name: 'endDate', label: 'End Date', type: 'date', col: 'half' },
          { name: 'goal', label: 'Funding Goal (₹)', type: 'number', col: 'half' },
          { name: 'raised', label: 'Amount Raised (₹)', type: 'number', col: 'half' },
          { name: 'progress', label: 'Progress %', type: 'number', col: 'half', min: 0, max: 100 },
          { name: 'impact', label: 'Impact Metrics', type: 'keyvalue', col: 'full' }
        ]
      },
      event: {
        title: item ? 'Edit Event' : 'Add New Event',
        fields: [
          { name: 'title', label: 'Event Title', type: 'text', required: true, col: 'full' },
          { name: 'type', label: 'Event Type', type: 'select', required: true, col: 'half',
            options: ['Fundraiser', 'Workshop', 'Volunteer Training', 'Community Event', 'Awareness Campaign', 'Conference', 'Cultural Event'] },
          { name: 'category', label: 'Category', type: 'select', col: 'half',
            options: ['Education', 'Healthcare', 'Environment', 'Fundraising', 'Training'] },
          { name: 'description', label: 'Description', type: 'textarea', required: true, col: 'full', rows: 4 },
          { name: 'date', label: 'Date', type: 'date', required: true, col: 'half' },
          { name: 'time', label: 'Time', type: 'text', required: true, col: 'half', placeholder: 'e.g., 10:00 AM - 4:00 PM' },
          { name: 'location', label: 'Location', type: 'text', required: true, col: 'full' },
          { name: 'capacity', label: 'Capacity', type: 'number', col: 'half', min: 1 },
          { name: 'registered', label: 'Registered', type: 'number', col: 'half', min: 0 },
          { name: 'price', label: 'Entry Fee (₹)', type: 'number', col: 'half', min: 0 },
          { name: 'speakers', label: 'Speakers', type: 'list', col: 'full' }
        ]
      },
      blog: {
        title: item ? 'Edit Blog Post' : 'Add New Blog Post',
        fields: [
          { name: 'title', label: 'Blog Title', type: 'text', required: true, col: 'full' },
          { name: 'category', label: 'Category', type: 'select', required: true, col: 'half',
            options: ['Impact Stories', 'Volunteer Voices', 'Project Updates', 'Announcements', 'Success Stories', 'Press Releases'] },
          { name: 'author', label: 'Author', type: 'text', required: true, col: 'half' },
          { name: 'excerpt', label: 'Excerpt/Summary', type: 'textarea', required: true, col: 'full', rows: 3 },
          { name: 'content', label: 'Full Content', type: 'textarea', required: true, col: 'full', rows: 8 },
          { name: 'date', label: 'Publish Date', type: 'date', required: true, col: 'half' },
          { name: 'readTime', label: 'Read Time (minutes)', type: 'number', col: 'half', min: 1 },
          { name: 'tags', label: 'Tags', type: 'tags', col: 'full' }
        ]
      },
      volunteer: {
        title: item ? 'Edit Volunteer Opportunity' : 'Add Volunteer Opportunity',
        fields: [
          { name: 'title', label: 'Opportunity Title', type: 'text', required: true, col: 'full' },
          { name: 'category', label: 'Category', type: 'select', required: true, col: 'half',
            options: ['Education', 'Healthcare', 'Environment', 'Events', 'Administration', 'Fundraising'] },
          { name: 'location', label: 'Location', type: 'text', required: true, col: 'half' },
          { name: 'commitment', label: 'Time Commitment', type: 'text', required: true, col: 'half', placeholder: 'e.g., 2-3 hours/week' },
          { name: 'spots', label: 'Spots Available', type: 'number', col: 'half', min: 1 },
          { name: 'description', label: 'Description', type: 'textarea', required: true, col: 'full', rows: 4 },
          { name: 'requirements', label: 'Requirements', type: 'list', col: 'full' }
        ]
      },
      team: {
        title: item ? 'Edit Team Member' : 'Add Team Member',
        fields: [
          { name: 'name', label: 'Full Name', type: 'text', required: true, col: 'full' },
          { name: 'role', label: 'Role/Position', type: 'text', required: true, col: 'half' },
          { name: 'department', label: 'Department', type: 'select', col: 'half',
            options: ['Administration', 'Education', 'Healthcare', 'Communications', 'Fundraising', 'Field Operations'] },
          { name: 'bio', label: 'Biography', type: 'textarea', required: true, col: 'full', rows: 4 },
          { name: 'email', label: 'Email', type: 'email', col: 'half' },
          { name: 'phone', label: 'Phone', type: 'tel', col: 'half' }
        ]
      },
      testimonial: {
        title: item ? 'Edit Testimonial' : 'Add Testimonial',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true, col: 'half' },
          { name: 'role', label: 'Role', type: 'text', required: true, col: 'half', placeholder: 'e.g., Beneficiary, Volunteer' },
          { name: 'content', label: 'Testimonial', type: 'textarea', required: true, col: 'full', rows: 4 },
          { name: 'rating', label: 'Rating', type: 'number', col: 'half', min: 1, max: 5 },
          { name: 'date', label: 'Date', type: 'date', col: 'half' }
        ]
      },
      report: {
        title: item ? 'Edit Report' : 'Add New Report',
        fields: [
          { name: 'title', label: 'Report Title', type: 'text', required: true, col: 'full' },
          { name: 'type', label: 'Report Type', type: 'select', required: true, col: 'half',
            options: ['annual', 'quarterly', 'impact', 'financial', 'project', 'field_visit', 'sustainability', 'publication'] },
          { name: 'year', label: 'Year', type: 'select', col: 'half',
            options: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
          { name: 'category', label: 'Category', type: 'text', col: 'half' },
          { name: 'period', label: 'Period', type: 'text', col: 'half', placeholder: 'e.g., FY 2025-26' },
          { name: 'description', label: 'Description', type: 'textarea', required: true, col: 'full', rows: 4 },
          { name: 'publishedDate', label: 'Published Date', type: 'date', required: true, col: 'half' },
          { name: 'url', label: 'File URL', type: 'text', col: 'half', placeholder: '/reports/example.pdf' },
          { name: 'pages', label: 'Number of Pages', type: 'number', col: 'half' },
          { name: 'fileSize', label: 'File Size', type: 'text', col: 'half', placeholder: 'e.g., 2.5 MB' }
        ]
      }
    };
    return configs[type] || configs.project;
  };

  useEffect(() => {
    if (item) {
      setFormData(item);
      if (item.image) setPreviewImage(item.image);
    } else {
      // Initialize empty form
      const initialData = {};
      const config = getFormConfig();
      config.fields.forEach(field => {
        if (field.type === 'list' || field.type === 'tags') {
          initialData[field.name] = [];
        } else if (field.type === 'keyvalue') {
          initialData[field.name] = {};
        } else {
          initialData[field.name] = '';
        }
      });
      setFormData(initialData);
    }
  }, [item, type]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleListChange = (field, index, value) => {
    const updatedList = [...(formData[field] || [])];
    updatedList[index] = value;
    setFormData(prev => ({ ...prev, [field]: updatedList }));
  };

  const addListItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const removeListItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleKeyValueChange = (field, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...(prev[field] || {}), [key]: value }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file)
        .then((compressedImage) => {
          setPreviewImage(compressedImage);
          setFormData(prev => ({ ...prev, image: compressedImage }));
          toast.success('Image ready to upload');
        })
        .catch(() => {
          toast.error('Unable to process the selected image. Please choose a smaller image.');
        });
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    const config = getFormConfig();
    const missingFields = config.fields
      .filter(f => f.required && !formData[f.name])
      .map(f => f.label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        id: item?.id || Date.now()
      });
      toast.success(`${item ? 'Updated' : 'Added'} successfully!`);
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const config = getFormConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{config.title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-primary-500 p-1 rounded-full transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {/* Image Upload */}
          {(type === 'project' || type === 'event' || type === 'blog' || type === 'team') && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              <div className="flex items-center space-x-4">
                <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FiImage className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center">
                    <FiUpload className="mr-2" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Recommended size: 1200x800px</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.fields.map(field => {
              const colClass = field.col === 'full' ? 'md:col-span-2' : 'md:col-span-1';

              if (field.type === 'textarea') {
                return (
                  <div key={field.name} className={colClass}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      rows={field.rows || 4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </div>
                );
              }

              if (field.type === 'select') {
                return (
                  <div key={field.name} className={colClass}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.type === 'list') {
                return (
                  <div key={field.name} className={colClass}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <div className="space-y-2">
                      {(formData[field.name] || []).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleListChange(field.name, index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                            placeholder={`Enter ${field.label.toLowerCase()} item`}
                          />
                          <button
                            onClick={() => removeListItem(field.name, index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addListItem(field.name)}
                        className="mt-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-600 hover:text-primary-600 transition-colors w-full flex items-center justify-center"
                      >
                        <FiPlus className="mr-2" />
                        Add {field.label} Item
                      </button>
                    </div>
                  </div>
                );
              }

              if (field.type === 'tags') {
                return (
                  <div key={field.name} className={colClass}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      placeholder="Enter tags separated by commas"
                      value={(formData[field.name] || []).join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                        setFormData(prev => ({ ...prev, [field.name]: tags }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                  </div>
                );
              }

              if (field.type === 'keyvalue') {
                return (
                  <div key={field.name} className={colClass}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <div className="space-y-2">
                      {Object.entries(formData[field.name] || {}).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={key}
                            onChange={(e) => {
                              const newValue = { ...formData[field.name] };
                              delete newValue[key];
                              newValue[e.target.value] = value;
                              setFormData(prev => ({ ...prev, [field.name]: newValue }));
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                            placeholder="Key"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleKeyValueChange(field.name, key, e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                            placeholder="Value"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newKey = prompt('Enter metric name:');
                          if (newKey) {
                            setFormData(prev => ({
                              ...prev,
                              [field.name]: { ...(prev[field.name] || {}), [newKey]: '' }
                            }));
                          }
                        }}
                        className="mt-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-600 hover:text-primary-600 transition-colors w-full"
                      >
                        + Add Metric
                      </button>
                    </div>
                  </div>
                );
              }

              // Default input field
              return (
                <div key={field.name} className={colClass}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    min={field.min}
                    max={field.max}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
            >
              <FiSave className="mr-2" />
              {loading ? 'Saving...' : (item ? 'Update' : 'Create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPopup;
