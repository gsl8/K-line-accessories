import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { useStore } from '../contexts/StoreContext';
import { instagramProfileLink } from '../utils/contact';

export function InstagramFeed() {
  const { settings, products } = useStore();
  const profile = instagramProfileLink(settings);

  // Product-driven lookbook: newest pieces double as the Instagram grid.
  const posts = products.slice(0, 5);

  if (posts.length === 0) return null;

  const layout = [
  'aspect-square md:aspect-auto md:col-start-1 md:row-start-1 md:col-span-2',
  'aspect-square md:aspect-auto md:col-start-3 md:row-start-2 md:col-span-2',
  'aspect-[3/4] md:aspect-auto md:col-start-5 md:row-start-1 md:row-span-2 md:col-span-2',
  'aspect-square md:aspect-auto md:col-start-7 md:row-start-2 md:col-span-2',
  'aspect-[3/4] md:aspect-auto md:col-start-9 md:row-start-1 md:row-span-2 md:col-span-2'];

  return (
    <section className="bg-paper pb-16">
      <SectionHeading title="Follow us on Instagram" />
      <div className="px-6 md:px-10 lg:px-14 grid grid-cols-2 md:grid-cols-10 md:grid-rows-[170px_170px] lg:grid-rows-[210px_210px] gap-3 md:gap-4">
        {posts.map((product, i) =>
        <a
          key={product.id}
          href={profile}
          target="_blank"
          rel="noreferrer"
          className={`group relative overflow-hidden ${layout[i]}`}>

            <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          loading="lazy" />

          </a>
        )}
      </div>
      <div className="px-6 md:px-10 lg:px-14 pt-8">
        <a
          href={profile}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] border-b border-ink pb-0.5 text-ink hover:opacity-60 transition-opacity">

          @{settings.instagramHandle}
          <ArrowUpRight size={12} strokeWidth={1.2} />
        </a>
      </div>
    </section>);

}
