import React, { useEffect, useState } from 'react';
import { FiStar } from 'react-icons/fi';
import apiService from '../../services/api';

const fallbackTestimonials = [
  {
    name: 'Student Parent',
    role: 'Community participant',
    content:
      'What matters most is that the support feels continuous. It is not a one-day event but a relationship that helps children keep moving.',
    rating: 5,
  },
  {
    name: 'Volunteer Mentor',
    role: 'Education volunteer',
    content:
      'This revised homepage now communicates the same seriousness we try to bring to the field: disciplined, hopeful, and focused on outcomes.',
    rating: 5,
  },
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await apiService.getTestimonials();
        if (data.length > 0) {
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  const testimonial = testimonials[currentIndex];

  return (
    <section className="bg-[#f5efe5] py-20">
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
          <div>
            <div className="text-reveal text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
              Voices from the field
            </div>
            <h2 className="text-reveal text-reveal-delay-1 mt-4 text-3xl font-bold text-ink-950 md:text-4xl">
              A homepage for a foundation should feel personal, but grounded.
            </h2>
            <p className="text-reveal text-reveal-delay-2 mt-5 max-w-xl text-base leading-7 text-ink-700">
              The testimonial section now supports that balance with cleaner typography and more
              breathing room, instead of looking like a generic carousel card.
            </p>
          </div>

          <div className="text-reveal text-reveal-delay-3 rounded-[2.25rem] border border-[#eadbc5]/75 bg-white/86 p-8 shadow-[0_26px_70px_-42px_rgba(20,26,32,0.16)] md:p-10">
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating ? 'fill-current text-accent-500' : 'text-stone-300'
                    }`}
                  />
                ))}
            </div>

            <blockquote className="mt-6 text-xl font-medium leading-8 text-ink-900 md:text-2xl md:leading-9">
              "{testimonial.content}"
            </blockquote>

            <div className="mt-8 border-t border-stone-200 pt-6">
              <div className="text-base font-bold text-ink-950 md:text-lg">{testimonial.name}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.16em] text-primary-700">
                {testimonial.role}
              </div>
            </div>

            <div className="mt-8 flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-12 bg-primary-700'
                      : 'w-2.5 bg-primary-200 hover:bg-primary-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
