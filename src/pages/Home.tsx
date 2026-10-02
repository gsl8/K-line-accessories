import React from 'react';
import { Hero } from '../components/Hero';
import { NewArrivals } from '../components/NewArrivals';
import { Bestsellers } from '../components/Bestsellers';
import { CategoriesStrip } from '../components/CategoriesStrip';
import { ContactBanner } from '../components/ContactBanner';
import { InstagramFeed } from '../components/InstagramFeed';

export function Home() {
  return (
    <main>
      <Hero />
      <NewArrivals />
      <Bestsellers />
      <CategoriesStrip />
      <ContactBanner />
      <InstagramFeed />
    </main>
  );
}
