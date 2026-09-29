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
  const [heroSlides, setHeroSlides] = useState(() => getHeroSlides(defaultHeroNewsCarousel));
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadHeroSlides = async () => {
      try {
        const response = await apiService.getAdminSettings();
        if (!isMounted) return;

        const slides = getHeroSlides(response?.data?.heroNewsCarousel);
        setHeroSlides(slides.length > 0 ? slides : getHeroSlides(defaultHeroNewsCarousel));
      } catch {
        if (isMounted) {
          setHeroSlides(getHeroSlides(defaultHeroNewsCarousel));
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
    <section className="bg-[#fffaf1] pt-16 text-ink-950 md:pt-18">
      {currentSlide && (
        <div className="relative min-h-[450px] w-full overflow-hidden md:min-h-[520px]">
          <HeroSlideImage
            src={currentSlide.image}
            fallbackSrc={getFallbackHeroImage(activeSlide)}
            alt={currentSlide.title || 'Featured community update'}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071f21]/95 via-[#092b2d]/72 to-[#092b2d]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071f21]/75 via-transparent to-black/10" />

          <div className="container-custom relative z-10 flex min-h-[450px] items-end pb-10 pt-14 md:min-h-[520px] md:pb-12">
            <div className="max-w-3xl text-white">
              <div className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] backdrop-blur-md">
                {currentSlide.category || 'Featured update'}
              </div>
              <h1 className="mt-5 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                {currentSlide.title || 'Young voices creating meaningful community change'}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 md:text-lg">
                {currentSlide.summary || 'Discover the people, programs, and shared efforts moving our communities forward.'}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <SlideAction slide={currentSlide} />
                <Link to="/volunteer" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary-900 transition hover:bg-primary-50">
                  Join the movement <FiArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          {heroSlides.length > 1 && (
            <div className="absolute bottom-7 right-5 z-20 flex items-center gap-3 md:bottom-10 md:right-10">
              <div className="mr-2 hidden items-center gap-2 sm:flex">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id || slide._id || index}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${index === activeSlide ? 'w-10 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/75'}`}
                    aria-label={`Show hero slide ${index + 1}`}
                  />
                ))}
              </div>
              <button type="button" onClick={() => setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition hover:bg-white/20" aria-label="Previous hero slide"><FiChevronLeft /></button>
              <button type="button" onClick={() => setActiveSlide((current) => (current + 1) % heroSlides.length)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition hover:bg-white/20" aria-label="Next hero slide"><FiChevronRight /></button>
            </div>
          )}
        </div>
      )}

      <div className="container-custom py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">Who we are</p>
            <h2 className="mt-4 max-w-4xl text-3xl font-bold leading-tight text-ink-950 md:text-5xl">
              Heritage gives us roots. Young people give change its momentum.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-ink-600 md:text-lg">
              Raavana Thalaigal Trust is a student and youth-led movement built on unity, learning, growth, and social responsibility. We bring people together to turn local ideas into practical, lasting action.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/our-story" className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-800">Our story <FiArrowRight /></Link>
              <Link to="/donate" className="inline-flex items-center gap-2 rounded-full border border-primary-300 bg-white px-6 py-3 text-sm font-semibold text-primary-800 transition hover:bg-primary-50">Support our mission <FiHeart /></Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {trustStats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-primary-100 bg-primary-50/55 p-5">
                  <div className="text-3xl font-bold text-primary-800">{item.value}</div>
                  <div className="mt-2 text-sm leading-5 text-ink-600">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-primary-950 p-6 text-white shadow-[0_28px_80px_-48px_rgba(8,38,40,0.7)] md:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-300">Our focus</p>
                <h2 className="mt-2 text-2xl font-bold">Where we create impact</h2>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10"><FiAward size={24} /></div>
            </div>
            <div className="mt-5 space-y-3">
              {focusAreas.map((item) => (
                <div key={item.title} className="flex gap-4 rounded-2xl bg-white/[0.07] p-4 transition hover:bg-white/[0.1]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-300 text-primary-950"><item.icon size={21} /></div>
                  <div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/65">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoundationHeroCarousel;
