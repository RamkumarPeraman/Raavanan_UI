import React from 'react';
import Hero from '../../components/home/FoundationHeroCarousel';
import ImpactMetrics from '../../components/home/ImpactMetrics';
import ProjectsSummary from '../../components/home/ProjectsSummary';
import LatestNews from '../../components/home/LatestNews';
import Testimonials from '../../components/home/Testimonials';

const HomePage = () => {
  return (
    <main>
      <Hero />
      <ImpactMetrics />
      <ProjectsSummary />
      <LatestNews />
      <Testimonials />
    </main>
  );
};

export default HomePage;
