import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCalendar, FiUser, FiClock, FiTag, FiEye, FiHeart, 
  FiShare2, FiDownload, FiFilter, FiSearch, FiBookmark,
  FiChevronLeft, FiChevronRight, FiPlay, FiImage, FiFileText,
  FiTwitter, FiFacebook, FiLinkedin, FiLink, FiStar
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../../services/api';

const BlogsMediaPage = () => {
  const [activeTab, setActiveTab] = useState('blogs');
  const [blogs, setBlogs] = useState([]);
  const [media, setMedia] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const postsPerPage = 6;

  // Categories
  const categories = [
    'All',
    'Impact Stories',
    'Volunteer Voices',
    'Project Updates',
    'Announcements',
    'Success Stories',
    'Events',
    'Press Releases',
    'Annual Reports'
  ];

  // Media categories
  const mediaCategories = [
    'All',
    'Photos',
    'Videos',
    'Infographics',
    'Posters',
    'Brochures',
    'Newsletters'
  ];

  useEffect(() => {
    fetchData();
    // Load bookmarks from localStorage
    const saved = localStorage.getItem('bookmarkedPosts');
    if (saved) {
      setBookmarkedPosts(JSON.parse(saved));
    }
  }, []);

  const fetchData = async () => {
    try {
      const blogsData = await apiService.getBlogs();
      setBlogs(blogsData);
      setFeaturedPost(blogsData[0]); // Set first blog as featured
      
      // Mock media data
      setMedia([
        {
          id: 1,
          title: "Annual Day Celebration 2024",
          type: "video",
          category: "Events",
          thumbnail: "/assets/media/event1.jpg",
          url: "https://youtube.com/watch?v=123",
          duration: "5:30",
          date: "2024-01-15",
          views: 1234,
          description: "Highlights from our annual day celebration"
        },
        {
          id: 2,
          title: "Education Initiative Impact",
          type: "image",
          category: "Impact",
          image: "/assets/media/edu1.jpg",
          date: "2024-01-10",
          description: "Children at our learning center"
        },
        {
          id: 3,
          title: "2023 Annual Report",
          type: "document",
          category: "Reports",
          file: "/reports/annual-2023.pdf",
          size: "5.2 MB",
          date: "2024-01-05",
          pages: 48,
          description: "Complete annual report with impact statistics"
        },
        {
          id: 4,
          title: "Tree Plantation Drive",
          type: "video",
          category: "Environment",
          thumbnail: "/assets/media/plant.jpg",
          url: "https://youtube.com/watch?v=456",
          duration: "3:45",
          date: "2023-12-20",
          views: 892,
          description: "Volunteers planting 1000 trees"
        },
        {
          id: 5,
          title: "Women Empowerment Workshop",
          type: "image",
          category: "Women",
          image: "/assets/media/women1.jpg",
          date: "2023-12-15",
          description: "Skill development session"
        },
        {
          id: 6,
          title: "Newsletter - December 2023",
          type: "document",
          category: "Newsletter",
          file: "/newsletters/dec-2023.pdf",
          size: "3.1 MB",
          date: "2023-12-01",
          pages: 12,
          description: "Monthly newsletter with updates and stories"
        }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter blogs based on search and category
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);

  const handleViewBlog = (blog) => {
    setSelectedBlog(blog);
    setShowBlogModal(true);
  };

  const handleBookmark = (blogId) => {
    let updated;
    if (bookmarkedPosts.includes(blogId)) {
      updated = bookmarkedPosts.filter(id => id !== blogId);
      toast.info('Removed from bookmarks');
    } else {
      updated = [...bookmarkedPosts, blogId];
      toast.success('Added to bookmarks');
    }
    setBookmarkedPosts(updated);
    localStorage.setItem('bookmarkedPosts', JSON.stringify(updated));
  };

  const handleShare = async (blog) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.origin + `/blog/${blog.id}`
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.origin + `/blog/${blog.id}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMediaIcon = (type) => {
    switch(type) {
      case 'video': return <FiPlay className="text-white" size={30} />;
      case 'image': return <FiImage className="text-white" size={30} />;
      case 'document': return <FiFileText className="text-white" size={30} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-gray-50">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-200 h-80 rounded-lg"></div>
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
          <h1 className="text-4xl font-bold mb-4">Blogs & Media</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with our latest news, impact stories, and multimedia content
            from our projects and initiatives.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('blogs')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'blogs'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiFileText className="inline mr-2" />
            Blog Posts
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'media'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiImage className="inline mr-2" />
            Media Gallery
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'featured'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiStar className="inline mr-2" />
            Featured Stories
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'bookmarks'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiBookmark className="inline mr-2" />
            Bookmarks
          </button>
        </div>

        {/* Blogs Tab */}
        {activeTab === 'blogs' && (
          <div>
            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Featured Story</h2>
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/2 h-64 md:h-auto bg-gray-300">
                      {featuredPost.image && (
                        <img 
                          src={featuredPost.image} 
                          alt={featuredPost.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="md:w-1/2 p-8">
                      <div className="flex items-center mb-4">
                        <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-semibold">
                          {featuredPost.category}
                        </span>
                        <span className="ml-4 text-sm text-gray-500 flex items-center">
                          <FiCalendar className="mr-1" size={14} />
                          {formatDate(featuredPost.date)}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">{featuredPost.title}</h3>
                      <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-600 font-semibold">
                            {featuredPost.author?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{featuredPost.author}</p>
                          <p className="text-sm text-gray-500">
                            <FiClock className="inline mr-1" size={12} />
                            {featuredPost.readTime} min read
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewBlog(featuredPost)}
                        className="btn-primary"
                      >
                        Read Full Story
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div className="md:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat === 'All' ? 'all' : cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentBlogs.map((blog) => (
                <article key={blog.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {blog.image && (
                    <div className="h-48 bg-gray-300 relative">
                      <img 
                        src={blog.image} 
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleBookmark(blog.id)}
                        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                      >
                        <FiBookmark 
                          className={bookmarkedPosts.includes(blog.id) ? 'fill-primary-600 text-primary-600' : 'text-gray-600'} 
                          size={18} 
                        />
                      </button>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full font-semibold">
                        {blog.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <FiCalendar className="mr-1" size={12} />
                        {formatDate(blog.date)}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{blog.excerpt}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-primary-600 font-semibold text-sm">
                            {blog.author?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{blog.author}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 flex items-center">
                          <FiClock className="mr-1" size={12} />
                          {blog.readTime} min
                        </span>
                        <button
                          onClick={() => handleShare(blog)}
                          className="text-gray-400 hover:text-primary-600"
                        >
                          <FiShare2 size={16} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewBlog(blog)}
                      className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-primary-600 hover:text-white transition-colors"
                    >
                      Read More
                    </button>
                  </div>
                </article>
              ))}
            </div>

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
          </div>
        )}

        {/* Media Gallery Tab */}
        {activeTab === 'media' && (
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search media..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div className="md:w-48">
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    {mediaCategories.map(cat => (
                      <option key={cat} value={cat === 'All' ? 'all' : cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {media.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative group">
                    {item.type === 'video' && (
                      <>
                        <div className="h-48 bg-gray-300">
                          <img 
                            src={item.thumbnail} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700">
                            <FiPlay className="text-white" size={30} />
                          </button>
                        </div>
                        <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                          {item.duration}
                        </span>
                      </>
                    )}
                    
                    {item.type === 'image' && (
                      <div className="h-48 bg-gray-300 relative group">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold">
                            View Image
                          </button>
                        </div>
                      </div>
                    )}

                    {item.type === 'document' && (
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        <FiFileText className="text-gray-400" size={48} />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.type === 'video' && `${item.views} views`}
                        {item.type === 'document' && item.size}
                      </span>
                    </div>

                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDate(item.date)}
                      </span>
                      
                      {item.type === 'document' && (
                        <a
                          href={item.file}
                          download
                          className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                        >
                          <FiDownload className="mr-1" />
                          Download
                        </a>
                      )}

                      {item.type === 'video' && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          Watch Video
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Stories Tab */}
        {activeTab === 'featured' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogs.filter(blog => blog.category === 'Impact Stories').map((blog, index) => (
                <div key={blog.id} className="bg-white rounded-lg shadow-xl overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-2/5 h-48 md:h-auto bg-gray-300">
                      <img 
                        src={blog.image} 
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="md:w-3/5 p-6">
                      <div className="flex items-center mb-2">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {formatDate(blog.date)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{blog.excerpt}</p>
                      <button
                        onClick={() => handleViewBlog(blog)}
                        className="text-primary-600 font-semibold hover:text-primary-700"
                      >
                        Read Story →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookmarks Tab */}
        {activeTab === 'bookmarks' && (
          <div>
            {bookmarkedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs
                  .filter(blog => bookmarkedPosts.includes(blog.id))
                  .map(blog => (
                    <article key={blog.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                      {blog.image && (
                        <div className="h-48 bg-gray-300 relative">
                          <img 
                            src={blog.image} 
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                        <p className="text-gray-600 mb-4">{blog.excerpt}</p>
                        <button
                          onClick={() => handleViewBlog(blog)}
                          className="text-primary-600 font-semibold hover:text-primary-700"
                        >
                          Read More →
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <FiBookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookmarks yet</h3>
                <p className="text-gray-500">Start bookmarking posts you want to read later</p>
              </div>
            )}
          </div>
        )}

        {/* Blog Modal */}
        {showBlogModal && selectedBlog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                {selectedBlog.image && (
                  <div className="h-64 md:h-96 bg-gray-300">
                    <img 
                      src={selectedBlog.image} 
                      alt={selectedBlog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <button
                  onClick={() => setShowBlogModal(false)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-8">
                {/* Meta Info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {selectedBlog.category}
                    </span>
                    <span className="text-gray-500 text-sm flex items-center">
                      <FiCalendar className="mr-1" size={14} />
                      {formatDate(selectedBlog.date)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBookmark(selectedBlog.id)}
                      className={`p-2 rounded-full hover:bg-gray-100 ${
                        bookmarkedPosts.includes(selectedBlog.id) ? 'text-primary-600' : 'text-gray-400'
                      }`}
                    >
                      <FiBookmark className={bookmarkedPosts.includes(selectedBlog.id) ? 'fill-current' : ''} size={20} />
                    </button>
                    <button
                      onClick={() => handleShare(selectedBlog)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-400"
                    >
                      <FiShare2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Title and Author */}
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{selectedBlog.title}</h1>
                
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-bold text-xl">
                      {selectedBlog.author?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{selectedBlog.author}</p>
                    <p className="text-gray-500 text-sm flex items-center">
                      <FiClock className="mr-1" size={14} />
                      {selectedBlog.readTime} min read
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 mb-6 font-medium">
                    {selectedBlog.excerpt}
                  </p>
                  
                  <div className="space-y-4 text-gray-600">
                    {selectedBlog.content ? (
                      <div dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
                    ) : (
                      <>
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <p>
                          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                          fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa 
                          qui officia deserunt mollit anim id est laborum.
                        </p>
                        <p>
                          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque 
                          laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi 
                          architecto beatae vitae dicta sunt explicabo.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlog.tags.map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share Buttons */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Share this article:</h4>
                  <div className="flex space-x-3">
                    <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                      <FiFacebook size={18} />
                    </button>
                    <button className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500">
                      <FiTwitter size={18} />
                    </button>
                    <button className="p-2 bg-blue-800 text-white rounded-full hover:bg-blue-900">
                      <FiLinkedin size={18} />
                    </button>
                    <button 
                      onClick={() => handleShare(selectedBlog)}
                      className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                    >
                      <FiLink size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsMediaPage;