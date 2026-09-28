import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiHome,
  FiUsers,
} from 'react-icons/fi';
import apiService, { defaultHeroNewsCarousel } from '../../services/api';

const trustStats = [
  { value: '2+', label: 'Years of service' },
  { value: '2,000+', label: 'People supported' },
  { value: '100+', label: 'Volunteers and community partners' },
];

const focusAreas = [
  {
    icon: FiBookOpen,
    title: 'Education and learning',
    description: 'Learning access, youth support, and local development initiatives for underserved communities.',
  },
  {
    icon: FiUsers,
    title: 'Community care',
    description: 'Volunteer networks, outreach efforts, and direct support for families and vulnerable groups.',
  },
  {
    icon: FiHome,
    title: 'Livelihood and resilience',
    description: 'Practical programs that help people build stability, dignity, and long-term opportunity.',
  },
];

const getHeroSlides = (slides) =>
  Array.isArray(slides)
    ? slides.filter((slide) => slide?.image || slide?.title || slide?.summary)
    : [];

const getFallbackHeroImage = (index = 0) =>
  defaultHeroNewsCarousel[index % defaultHeroNewsCarousel.length]?.image || '';

const resolveHeroImage = (src, fallbackSrc) => {
  if (typeof src === 'string' && src.startsWith('data:image/') && src.length > 350000) {
    return fallbackSrc || '';
  }

  return src || fallbackSrc || '';
};

const HeroSlideImage = ({ src, fallbackSrc, alt, className }) => {
  const [imageSrc, setImageSrc] = useState(resolveHeroImage(src, fallbackSrc));

  useEffect(() => {
    setImageSrc(resolveHeroImage(src, fallbackSrc));
  }, [src, fallbackSrc]);

  if (!imageSrc) {
    return null;
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (fallbackSrc && imageSrc !== fallbackSrc) {
          setImageSrc(fallbackSrc);
        }
      }}
    />
  );
};

const SlideAction = ({ slide }) => {
  if (!slide?.link) {
    return null;
  }

  const className = 'inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20';
  const label = slide.buttonLabel || 'Read more';

  if (/^https?:\/\//i.test(slide.link)) {
    return (
      <a href={slide.link} target="_blank" rel="noreferrer" className={className}>
        {label}
        <FiArrowRight size={14} />
      </a>
    );
  }

  return (
    <Link to={slide.link} className={className}>
      {label}
      <FiArrowRight size={14} />
    </Link>
  );
};

const FoundationHeroCarousel = () => {
  const [heroSlides, setHeroSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadHeroSlides = async () => {
      try {
        const response = await apiService.getAdminSettings();
        if (!isMounted) return;

        setHeroSlides(getHeroSlides(response?.data?.heroNewsCarousel));
      } catch (error) {
        if (isMounted) {
          setHeroSlides([]);
        }
      }
    };

    loadHeroSlides();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [heroSlides.length]);

  useEffect(() => {
    setActiveSlide((current) => (current >= heroSlides.length ? 0 : current));
  }, [heroSlides.length]);

  const currentSlide = heroSlides[activeSlide] || null;

  return (
    <section className="relative overflow-hidden bg-[#f5efe5] pt-20 text-ink-950 md:pt-15">
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-[28rem] w-[28rem] rounded-full bg-primary-100 blur-3xl" />
        <div className="absolute right-[-8rem] top-16 h-[30rem] w-[30rem] rounded-full bg-accent-100 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#efe5d4] to-transparent" />
      </div>

      <div className="container-custom relative z-10 pb-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-center">
          <div className="max-w-3xl">
            <div className="text-reveal inline-flex rounded-full border border-primary-200/70 bg-white/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700/85">
              Let your existence begin with glory and dignity
            </div>

            {currentSlide && (
              <div className="text-reveal text-reveal-delay-1 mt-6 overflow-hidden rounded-[2rem] border border-white/60 bg-[#0f2d2e] shadow-[0_28px_80px_-45px_rgba(8,38,40,0.48)]">
                <div className="relative min-h-[260px]">
                  <HeroSlideImage
                    src={currentSlide.image}
                    fallbackSrc={getFallbackHeroImage(activeSlide)}
                    alt={currentSlide.title || 'Featured news'}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#082629]/96 via-[#082629]/78 to-[#082629]/40" />

                  <div className="relative z-10 flex min-h-[260px] flex-col justify-between p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div className="inline-flex rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                        {currentSlide.category || 'Latest News'}
                      </div>

                      {heroSlides.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/18"
                            aria-label="Previous hero news slide"
                          >
                            <FiChevronLeft />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSlide((current) => (current + 1) % heroSlides.length)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/18"
                            aria-label="Next hero news slide"
                          >
                            <FiChevronRight />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="max-w-2xl">
                      <h2 className="text-xl font-bold leading-snug text-white md:text-2xl">
                        {currentSlide.title || 'Featured community update'}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-white/82 md:text-base">
                        {currentSlide.summary || 'Show important movement news, campaign highlights, and image-led updates here.'}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <SlideAction slide={currentSlide} />

                        {heroSlides.length > 1 && (
                          <div className="flex items-center gap-2">
                            {heroSlides.map((slide, index) => (
                              <button
                                key={slide.id || slide._id || index}
                                type="button"
                                onClick={() => setActiveSlide(index)}
                                className={`h-2.5 rounded-full transition-all ${index === activeSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'}`}
                                aria-label={`Show hero news slide ${index + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h1 className="text-reveal text-reveal-delay-1 mt-6 text-2xl font-bold leading-snug md:text-3xl lg:text-4xl">
              To rise as a revolutionary Tamil movement, where heritage leads, voices unite, and youth become the fire of transformation
            </h1>

            <p className="text-reveal text-reveal-delay-2 mt-6 max-w-2xl text-base leading-7 text-ink-700 md:text-lg">
              Raavana Thalaigal Trust is a student and youth-led movement built on the spirit of
              unity, learning, growth, and social responsibility - where every young voice matters,
              and when united, becomes a powerful force for meaningful change.
            </p>

            <div className="text-reveal text-reveal-delay-3 mt-5 flex flex-wrap gap-3">
              <Link
                to="/our-story"
                className="inline-flex items-center gap-2 rounded-full border border-primary-400 bg-white/80 px-5 py-2.5 text-sm font-semibold text-primary-800 transition-colors hover:bg-primary-50"
              >
                Our Story
                <FiArrowRight size={14} />
              </Link>
              <Link
                to="/key-figures"
                className="inline-flex items-center gap-2 rounded-full border border-primary-400 bg-white/80 px-5 py-2.5 text-sm font-semibold text-primary-800 transition-colors hover:bg-primary-50"
              >
                Key Figures
                <FiArrowRight size={14} />
              </Link>
            </div>

            <div className="text-reveal text-reveal-delay-3 mt-5 flex flex-col gap-4 sm:flex-row">
              <Link to="/donate" className="btn-primary group bg-primary-700 hover:bg-primary-800">
                Support our mission
                <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/volunteer" className="btn-secondary group border-primary-300/80 bg-white/72">
                Become a volunteer
                <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="text-reveal text-reveal-delay-4 mt-10 grid gap-4 sm:grid-cols-3">
              {trustStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.5rem] border border-white/55 bg-white/66 px-5 py-5 shadow-[0_24px_60px_-40px_rgba(20,26,32,0.2)] backdrop-blur"
                >
                  <div className="text-2xl font-bold text-primary-800">{item.value}</div>
                  <div className="mt-2 text-xs leading-5 text-ink-600 md:text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-[#eadbc5]/80 bg-[#fffaf1]/88 p-6 shadow-[0_32px_90px_-42px_rgba(66,46,17,0.24)] md:p-8">
              <div className="flex items-center justify-between border-b border-[#eadbc5]/75 pb-5">
                <div>
                  <div className="text-reveal text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
                    Our promise
                  </div>
                  <div className="text-reveal text-reveal-delay-1 mt-2 text-xl font-bold text-ink-950 md:text-2xl">Community impact with continuity</div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-700 text-white">
                  <FiAward className="h-7 w-7" />
                </div>
              </div>

              <div className="text-reveal text-reveal-delay-2 mt-6 space-y-4">
                {focusAreas.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-[#f0e4d3]/75 bg-white/80 px-5 py-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-ink-950">{item.title}</h2>
                        <p className="mt-2 text-sm leading-5 text-ink-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-reveal text-reveal-delay-3 mt-6 rounded-[1.5rem] border border-primary-800/40 bg-primary-900 px-6 py-6 text-white shadow-[0_18px_40px_-28px_rgba(8,38,40,0.55)]">
                <div className="flex items-center gap-3">
                  <FiHeart className="h-5 w-5 text-accent-300" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/78">
                    Community note
                  </span>
                </div>
                <p className="mt-3 text-base leading-7 text-white/94">
                  "Every contribution should feel visible: one person, one family, one clear
                  step forward."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoundationHeroCarousel;
