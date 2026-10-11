import React, { useEffect, useMemo, useState } from 'react';
import {
  FiArrowRight, FiBookmark, FiClock, FiFileText,
  FiFilter, FiImage, FiSearch, FiShare2,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import CommonLoader from '../../components/common/CommonLoader';
import CommonPopup from '../../components/common/CommonPopup';
import Pagination from '../../components/common/Pagination';
import apiService from '../../services/api';

const blogId = (blog) => String(blog?.id || blog?._id || '');
const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const BlogCover = ({ blog, className = '' }) => {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#dcece7] via-[#f2f4e9] to-[#fff0db] text-primary-800 ${className}`}>
      {blog.image && !imageFailed ? (
        <img src={blog.image} alt="" onError={() => setImageFailed(true)} className="h-full w-full object-cover" />
      ) : <FiFileText aria-hidden="true" className="h-10 w-10" />}
      <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-3 py-1.5 text-xs font-bold text-primary-900 shadow-sm">{formatDate(blog.date)}</span>
    </div>
  );
};

const BlogsMediaPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState('blogs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarkedPosts') || '[]');
      return Array.isArray(saved) ? saved.map(String) : [];
    } catch { return []; }
  });

  useEffect(() => {
    let active = true;
    apiService.getBlogs().then((data) => {
      if (!active) return;
      setBlogs(data);
      const sharedId = new URLSearchParams(window.location.search).get('blog');
      if (sharedId) setSelectedBlog(data.find((blog) => blogId(blog) === sharedId) || null);
    }).catch((error) => {
      if (!active) return;
      setLoadError(true);
      toast.error(error?.message || 'Could not load blog posts.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => [...new Set(blogs.map((blog) => blog.category).filter(Boolean))].sort(), [blogs]);
  const featuredBlog = blogs[0];
  const tabs = [
    ['blogs', 'Blog Posts', blogs.length],
    ['media', 'Media Gallery', 0],
    ['featured', 'Featured Stories', featuredBlog ? 1 : 0],
    ['bookmarks', 'Bookmarks', blogs.filter((blog) => bookmarkedPosts.includes(blogId(blog))).length],
  ];
  const visibleBlogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return blogs.filter((blog) => {
      if (activeTab === 'featured' && blogId(blog) !== blogId(featuredBlog)) return false;
      if (activeTab === 'bookmarks' && !bookmarkedPosts.includes(blogId(blog))) return false;
      if (selectedCategory !== 'all' && blog.category !== selectedCategory) return false;
      if (query && ![blog.title, blog.excerpt, blog.author, blog.category].some((value) => String(value || '').toLowerCase().includes(query))) return false;
      return true;
    });
  }, [blogs, featuredBlog, activeTab, bookmarkedPosts, selectedCategory, searchTerm]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(visibleBlogs.length / pageSize)));
  const currentBlogs = visibleBlogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleBookmark = (id) => {
    const next = bookmarkedPosts.includes(id) ? bookmarkedPosts.filter((value) => value !== id) : [...bookmarkedPosts, id];
    setBookmarkedPosts(next);
    localStorage.setItem('bookmarkedPosts', JSON.stringify(next));
    toast.info(next.includes(id) ? 'Saved to bookmarks' : 'Removed from bookmarks');
  };

  const shareBlog = async (blog) => {
    const url = new URL('/blogs', window.location.origin);
    url.searchParams.set('blog', blogId(blog));
    try {
      if (navigator.share) await navigator.share({ title: blog.title, text: blog.excerpt, url: url.toString() });
      else { await navigator.clipboard.writeText(url.toString()); toast.success('Blog link copied'); }
    } catch (error) {
      if (error?.name !== 'AbortError') toast.error('Could not share this post.');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#faf8f3] pb-10 pt-3 text-ink-950">
      <div className="container-custom">
        <h1 className="sr-only">Blogs and Media</h1>
        <div className="flex min-w-0 flex-col gap-4 border-b border-[#e4ddd2] pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-1" role="group" aria-label="Blog views">
            {tabs.map(([id, label, count]) => (
              <button key={id} type="button" aria-pressed={activeTab === id} onClick={() => { setActiveTab(id); setPage(1); setShowFilters(false); }}
                className={`inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-3 text-sm font-semibold transition ${activeTab === id ? 'border-primary-700 bg-primary-800 text-white' : 'border-[#e4ddd2] bg-white text-ink-700 hover:border-primary-400 hover:text-primary-800'}`}>
                {label}<span className={`text-xs ${activeTab === id ? 'text-white/80' : 'text-ink-500'}`}>{count}</span>
              </button>
            ))}
          </div>
          {activeTab !== 'media' && <div className="flex min-w-0 gap-3 xl:w-[min(35vw,560px)] xl:shrink-0">
            <label className="relative min-w-0 flex-1"><span className="sr-only">Search blog posts</span>
              <FiSearch aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
              <input value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPage(1); }} placeholder="Search posts by title or topic"
                className="h-11 w-full rounded-md border border-[#ded8cd] bg-white pl-11 pr-4 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-500/15" />
            </label>
            <button type="button" aria-expanded={showFilters} aria-controls="blog-filter-panel" onClick={() => setShowFilters((open) => !open)}
              className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border px-5 text-sm font-semibold transition hover:border-primary-600 ${selectedCategory !== 'all' ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-[#ded8cd] bg-white text-ink-700'}`}>
              <FiFilter aria-hidden="true" />Filters
            </button>
          </div>}
        </div>

        {showFilters && activeTab !== 'media' && <div id="blog-filter-panel" className="mt-2 flex flex-wrap items-end gap-3 rounded-md border border-[#ded8cd] bg-white p-4 shadow-sm">
          <label className="min-w-[200px] flex-1 text-xs font-medium text-ink-500">Category
            <select value={selectedCategory} onChange={(event) => { setSelectedCategory(event.target.value); setPage(1); }} className="mt-1.5 h-10 w-full rounded-md border border-[#ded8cd] bg-white px-3 text-sm text-ink-900 outline-none focus:border-primary-600">
              <option value="all">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <button type="button" onClick={clearFilters} className="h-10 rounded-md px-3 text-sm font-semibold text-primary-800 hover:bg-primary-50">Clear</button>
          <button type="button" onClick={() => setShowFilters(false)} className="h-10 rounded-md bg-primary-800 px-4 text-sm font-semibold text-white hover:bg-primary-700">Done</button>
        </div>}

        <div className="mt-7">
          {loading ? <div className="flex min-h-64 items-center justify-center"><CommonLoader size="lg" label="Loading articles…" showLabel /></div>
            : loadError ? <div className="rounded-md border border-[#e4ddd2] bg-white px-6 py-14 text-center"><h2 className="text-xl font-bold">Posts could not load right now</h2><p className="mt-2 text-sm text-ink-600">Please refresh the page and try again.</p></div>
              : activeTab === 'media' ? <div className="rounded-md border border-[#e4ddd2] bg-white px-6 py-14 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-primary-50 text-primary-800"><FiImage size={25} aria-hidden="true" /></div><h2 className="mt-4 text-xl font-bold">No media published yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-600">Photos and videos will appear here when they are published.</p></div>
                : visibleBlogs.length === 0 ? <div className="rounded-md border border-[#e4ddd2] bg-white px-6 py-14 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-primary-50 text-primary-800"><FiFileText size={25} aria-hidden="true" /></div><h2 className="mt-4 text-xl font-bold">{activeTab === 'bookmarks' ? 'No saved posts yet' : 'No posts found'}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-600">{activeTab === 'bookmarks' ? 'Save a post to keep it here for later.' : 'Try another search or category.'}</p>{(searchTerm || selectedCategory !== 'all') && <button type="button" onClick={clearFilters} className="mt-5 rounded-md bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Clear filters</button>}</div>
                  : <>
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {currentBlogs.map((blog) => {
                        const id = blogId(blog);
                        return <article key={id} className="flex min-w-0 flex-col overflow-hidden rounded-md border border-[#e4ddd2] bg-white shadow-[0_14px_36px_-32px_rgba(9,42,43,0.45)] transition hover:border-primary-300 hover:shadow-md">
                          <div className="relative">
                            <BlogCover key={id} blog={blog} className="h-40 w-full" />
                            <button type="button" onClick={() => toggleBookmark(id)} aria-label={bookmarkedPosts.includes(id) ? 'Remove bookmark' : 'Bookmark post'} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md bg-white/95 text-primary-800 shadow-sm hover:bg-white"><FiBookmark aria-hidden="true" className={bookmarkedPosts.includes(id) ? 'fill-primary-600' : ''} /></button>
                          </div>
                          <div className="flex-1 p-5">
                            <div className="text-xs font-bold uppercase tracking-[0.12em] text-primary-700">{blog.category || 'Story'}</div>
                            <h2 className="mt-3 break-words text-xl font-bold leading-snug text-ink-950 [overflow-wrap:anywhere]">{blog.title}</h2>
                            <p className="mt-2 line-clamp-2 min-h-12 break-words text-sm leading-6 text-ink-600 [overflow-wrap:anywhere]">{blog.excerpt || 'Read more about this story.'}</p>
                            <div className="mt-4 space-y-2 text-sm text-ink-600">
                              {blog.author && <div className="flex items-center gap-2"><FiFileText aria-hidden="true" /><span>{blog.author}</span></div>}
                              {blog.readTime && <div className="flex items-center gap-2"><FiClock aria-hidden="true" /><span>{blog.readTime} min read</span></div>}
                            </div>
                          </div>
                          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[#eee9e0] px-5 py-3">
                            <button type="button" onClick={() => setSelectedBlog(blog)} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-800 hover:text-primary-600">Read story <FiArrowRight aria-hidden="true" /></button>
                            <button type="button" onClick={() => shareBlog(blog)} aria-label={`Share ${blog.title}`} className="rounded p-1.5 text-ink-500 hover:bg-primary-50 hover:text-primary-800"><FiShare2 aria-hidden="true" /></button>
                          </div>
                        </article>;
                      })}
                    </div>
                    {visibleBlogs.length > pageSize && <div className="mt-8 overflow-hidden rounded-md border border-[#e4ddd2] bg-white"><Pagination page={currentPage} pageSize={pageSize} total={visibleBlogs.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} pageSizeOptions={[9, 18, 27]} itemLabel="Posts" /></div>}
                  </>}
        </div>
      </div>

      <CommonPopup open={Boolean(selectedBlog)} title={selectedBlog?.title || 'Story'} onClose={() => setSelectedBlog(null)} size="lg">
        {selectedBlog && <div className="space-y-5">
          <BlogCover key={blogId(selectedBlog)} blog={selectedBlog} className="h-52 w-full rounded-md" />
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider text-primary-700"><span>{selectedBlog.category || 'Story'}</span><span className="text-ink-500">{formatDate(selectedBlog.date)}</span></div>
          <p className="text-base font-medium leading-7 text-ink-800">{selectedBlog.excerpt}</p>
          {selectedBlog.content && <div className="prose max-w-none text-ink-700" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eee9e0] pt-4 text-sm text-ink-600">
            <span>{selectedBlog.author || 'Raavana Thalaigal Trust'}{selectedBlog.readTime ? ` · ${selectedBlog.readTime} min read` : ''}</span>
            <div className="flex gap-2"><button type="button" onClick={() => toggleBookmark(blogId(selectedBlog))} className="inline-flex items-center gap-1.5 rounded-md border border-[#ded8cd] px-3 py-2"><FiBookmark />{bookmarkedPosts.includes(blogId(selectedBlog)) ? 'Saved' : 'Save'}</button><button type="button" onClick={() => shareBlog(selectedBlog)} className="inline-flex items-center gap-1.5 rounded-md border border-[#ded8cd] px-3 py-2"><FiShare2 />Share</button></div>
          </div>
        </div>}
      </CommonPopup>
    </div>
  );
};

export default BlogsMediaPage;
