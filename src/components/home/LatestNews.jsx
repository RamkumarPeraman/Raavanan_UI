import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
} from 'react-icons/fi';
import apiService from '../../services/api';

const fallbackStories = [
  {
    id: 'story-1',
    title: 'How student mentoring changes confidence long before exam results appear',
    excerpt:
      'A stronger homepage needs narrative proof. This story block is styled to foreground long-term transformation instead of simple announcements.',
    date: '2026-03-10',
    author: 'Editorial Team',
    category: 'Student Story',
  },
  {
    id: 'story-2',
    title: 'Why neighbourhood volunteers are central to sustainable educational support',
    excerpt:
      'The Agaram-like reference leans on purpose and credibility. This layout does the same through editorial, readable cards.',
    date: '2026-02-28',
    author: 'Community Desk',
    category: 'Field Update',
  },
  {
    id: 'story-3',
    title: 'From donor trust to visible outcomes: presenting impact with more discipline',
    excerpt:
      'A social-impact homepage should communicate seriousness. These updates are framed with that institutional tone.',
    date: '2026-02-12',
    author: 'Program Office',
    category: 'Impact Note',
  },
];

const LatestNews = () => {
  const [blogs, setBlogs] = useState(fallbackStories);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await apiService.getBlogs();
        if (data.length > 0) {
          setBlogs(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    if (blogs.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % blogs.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [blogs.length]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const activeStory = blogs[activeIndex] || blogs[0];

  const goToPrevious = () =>
    setActiveIndex((current) => (current - 1 + blogs.length) % blogs.length);

  const goToNext = () => setActiveIndex((current) => (current + 1) % blogs.length);

  return (
    <section className="bg-primary-950 py-20 text-white">
      <div className="container-custom">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="text-reveal text-xs font-semibold uppercase tracking-[0.22em] text-accent-300">
              Stories and updates
            </div>
            <h2 className="text-reveal text-reveal-delay-1 mt-4 text-3xl font-bold md:text-4xl">
              Editorial blocks that feel more credible and human.
            </h2>
            <p className="text-reveal text-reveal-delay-2 mt-5 text-base leading-7 text-white/60">
              This section now supports the homepage with narrative depth, which is an important
              part of the reference style you pointed to.
            </p>
          </div>
          <Link to="/blogs" className="text-reveal text-reveal-delay-3 inline-flex items-center font-semibold text-accent-300">
            Visit the blog
            <FiArrowRight className="ml-2" />
          </Link>
        </div>

        <div className="text-reveal text-reveal-delay-4 mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <article className="overflow-hidden rounded-[2rem] border border-accent-400/20 bg-white/90 text-ink-950 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.28)]">
            <div className="bg-gradient-to-br from-accent-100/70 via-white to-primary-50/60 p-7 md:p-9">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-accent-100/72 px-3 py-1 font-semibold uppercase tracking-[0.16em] text-accent-800">
                    {activeStory.category}
                  </span>
                  <div className="text-ink-500/90">{formatDate(activeStory.date)}</div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-200/70 bg-white/75 text-primary-800 transition hover:bg-white"
                    aria-label="Previous news"
                  >
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-200/70 bg-white/75 text-primary-800 transition hover:bg-white"
                    aria-label="Next news"
                  >
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="relative mt-8 min-h-[15rem] md:min-h-[17rem]">
                {blogs.map((blog, index) => (
                  <div
                    key={blog.id}
                    className={`absolute inset-0 transition-all duration-500 ${
                      index === activeIndex
                        ? 'translate-y-0 opacity-100'
                        : 'pointer-events-none translate-y-4 opacity-0'
                    }`}
                  >
                    <h3 className="max-w-3xl text-3xl font-bold md:text-4xl">
                      {blog.title}
                    </h3>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-600/90 md:text-base md:leading-7">
                      {blog.excerpt}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-ink-500/90">
                      <span className="inline-flex items-center">
                        <FiCalendar className="mr-2" />
                        {formatDate(blog.date)}
                      </span>
                      <span className="inline-flex items-center">
                        <FiUser className="mr-2" />
                        {blog.author}
                      </span>
                    </div>

                    <Link
                      to="/blogs"
                      className="mt-8 inline-flex items-center font-semibold text-primary-700"
                    >
                      Read the full update
                      <FiArrowRight className="ml-2" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-stone-200/80 bg-white/68 px-7 py-5 md:px-9">
              <div className="flex flex-wrap items-center gap-2">
                {blogs.map((blog, index) => (
                  <button
                    key={`indicator-${blog.id}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`transition-all ${
                      index === activeIndex
                        ? 'h-2.5 w-12 rounded-full bg-primary-700'
                        : 'h-2.5 w-2.5 rounded-full bg-primary-200 hover:bg-primary-300'
                    }`}
                    aria-label={`Show news ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </article>

          <div className="space-y-4">
            {blogs.map((blog, index) => (
              <button
                key={blog.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`block w-full rounded-[1.5rem] border p-5 text-left transition ${
                  index === activeIndex
                    ? 'border-accent-400/18 bg-white/12 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.3)]'
                    : 'border-white/8 bg-white/4 hover:bg-white/7'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em]">
                  <span className={index === activeIndex ? 'text-accent-300' : 'text-white/55'}>
                    {blog.category}
                  </span>
                  <span className="text-white/40">{formatDate(blog.date)}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{blog.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">{blog.excerpt}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
