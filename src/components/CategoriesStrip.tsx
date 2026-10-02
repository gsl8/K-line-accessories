import React from 'react';
import { Link } from 'react-router-dom';
import { SectionHeading } from './SectionHeading';
import { useStore } from '../contexts/StoreContext';

export function CategoriesStrip() {
  const { settings, products } = useStore();
  const categories = settings.categories.filter((c) => c.trim().length > 0);

  if (categories.length === 0) return null;

  return (
    <section className="bg-paper pb-16">
      <SectionHeading title="Shop by category" to="/shop" />
      <div className="px-6 md:px-10 lg:px-14">
        <ul className="border-t border-ink/15">
          {categories.map((category, i) => {
            const count = products.filter((p) => p.category === category).length;
            return (
              <li key={category} className="border-b border-ink/15">
                <Link
                  to={`/shop?category=${encodeURIComponent(category)}`}
                  className="group flex items-baseline justify-between gap-6 py-4 md:py-5">
                  
                  <span className="flex items-baseline gap-5">
                    <span className="text-[9px] tabular-nums text-ink/35 tracking-[0.18em]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[14px] md:text-[17px] uppercase tracking-[0.14em] font-light text-ink group-hover:opacity-60 transition-opacity">
                      {category}
                    </span>
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-ink/40">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </Link>
              </li>);
          })}
        </ul>
      </div>
    </section>);

}
