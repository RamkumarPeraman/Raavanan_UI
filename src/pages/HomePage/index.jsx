import React from 'react';
import Hero from '../../components/home/FoundationHeroCarousel';
import ImpactMetrics from '../../components/home/ImpactMetrics';
import LatestNews from '../../components/home/LatestNews';
import Testimonials from '../../components/home/Testimonials';

const HomePage = () => {
  return (
    <main>
      <Hero />
      <ImpactMetrics />
      <LatestNews />
      <Testimonials />
    </main>
  );
};

export default HomePage;
